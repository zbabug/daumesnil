routes.on("#",async()=>{
	let el=document.querySelector("#groups");
	dom({el,childs:Group.all
		.map(o=>({type:"a",inner:o.name,attributes:{href:"#groups/"+o.id}}))});
});

let TERRITORY = [{"lon":2.3886680603027344,"lat":48.826531358347054},{"lon":2.3654937744140625,"lat":48.845739667840384},{"lon":2.3694419860839844,"lat":48.85375978148347},{"lon":2.37579345703125,"lat":48.8512748132034},{"lon":2.396221160888672,"lat":48.84867675994343},{"lon":2.4145889282226562,"lat":48.8469823047543},{"lon":2.4125289916992188,"lat":48.83613643374479},{"lon":2.4092674255371094,"lat":48.83421556597207},{"lon":2.414073944091797,"lat":48.833424599010925},{"lon":2.4228286743164062,"lat":48.83613643374479},{"lon":2.428150177001953,"lat":48.83896110549604},{"lon":2.4339866638183594,"lat":48.8409947705306},{"lon":2.434673309326172,"lat":48.84517482268592},{"lon":2.447376251220703,"lat":48.843706195467924},{"lon":2.4533843994140625,"lat":48.83545848882338},{"lon":2.4655723571777344,"lat":48.826531358347054},{"lon":2.46368408203125,"lat":48.82020230247927},{"lon":2.458362579345703,"lat":48.817489605290135},{"lon":2.4394798278808594,"lat":48.8188459722355},{"lon":2.4341583251953125,"lat":48.82020230247927},{"lon":2.4303817749023438,"lat":48.82325391133874},{"lon":2.4231719970703125,"lat":48.82393202140893},{"lon":2.4193954467773438,"lat":48.824158056060064},{"lon":2.4159622192382812,"lat":48.824723138227746},{"lon":2.4121856689453125,"lat":48.824723138227746},{"lon":2.407379150390625,"lat":48.826531358347054},{"lon":2.4010276794433594,"lat":48.829582581850715},{"lon":2.39227294921875,"lat":48.82754845349204}];

routes.on("#maps",/^#maps\/\d+$/,async()=>{

	let parent = document.getElementById("page-main");
	parent.classList.remove("--page");

	let min={lon:0,lat:0},max={lon:0,lat:0};
	
	let members = Member.all.filter(o=>o.position);
	let group = /^#maps\/\d+$/.test(routes.hash) ? +routes.hash.split`/`.pop() : -1;
	if (group>=0) members = members.filter(o=>o.group==group);

	let g = group<0 ? null : Group.get(group);
	console.log(g);

	let {lon,lat} = members[0].position;
	min.lon = max.lon = lon;
	min.lat = max.lat = lat;
	members.forEach(o=>{
		let {lon,lat} = o.position;
		if (lon>max.lon) max.lon = lon;
		if (lon<min.lon) min.lon = lon;
		if (lat>max.lat) max.lat = lat;
		if (lat<min.lat) min.lat = lat;
	});

	let moving;
	let circleRadius = 10;
	let points = [];

	let canvas = dom({parent,type:"canvas",cn:"map",onrun:{
		mousewheel:event=>{
			if (moving) return;
			//
			let width = canvas.clientWidth;
			let mx = event.layerX;
			let height = canvas.clientHeight;
			let my = event.layerY;
			let delta = event.deltaY;
			//
			var p1 = map.toCoor(map.center.x-(width>>1)+mx,map.center.y-(height>>1)+my);
			var dx = mx-(width>>1);
			var dy = my-(height>>1);
			map.setZoom(delta>0?"-":"+");
			var p2 = map.toPoint(p1.lon,p1.lat);
			var center = map.toCoor(p2.x-dx,p2.y-dy);
			map.setCenter(center.lon,center.lat);
		},
		mousedown:event=>{
			let mx = event.layerX, my = event.layerY;
			var sx=mx, sy=my;
			var cx=map.center.x, cy=map.center.y;
			var max = 0;
			moving = true;
			let mousemove = event=>{
				if (!moving) return;
				let mx = event.layerX, my = event.layerY;
				var dx=mx-sx, dy=my-sy; max = Math.max(max,Math.abs(dx),Math.abs(dy));
				var p = map.toCoor(cx-dx,cy-dy);
				map.setCenter(p.lon,p.lat);
			};
			let mouseup = event=>{
				mousemove(event);
				moving = false;
				window.removeEventListener("mousemove",mousemove);
				window.removeEventListener("mouseup",mouseup);
			};
			window.addEventListener("mousemove",mousemove);
			window.addEventListener("mouseup",mouseup);
		},mousemove:event=>{
			let x = event.layerX, y = event.layerY;
			let c = circle.find(o=>{
				let distance = ((o.x-x)**2+(o.y-y)**2)**.5;
				return distance<circleRadius;
			});
			if (c==selectedCircle) return;
			selectedCircle = c;
			redrawMap(map);
		},
		click:event=>{
			let x = event.layerX, y = event.layerY;
			let {lon,lat} = map.toCoor(x+map.tl.x,y+map.tl.y);
			if (event.ctrlKey) points.push({lon,lat}); else points = [{lon,lat}];
			console.log(JSON.stringify(points));
			if (!selectedCircle) return;
			App.modal.create({title:"Membres",buttons:"ok cancel",container:dom({cn:"--flex-8",childs:selectedCircle.members.map(m=>{
				return member_dom_mini(m);
			})})})
		}
	}});

	let ctx = canvas.getContext('2d');
	let width = canvas.width = canvas.clientWidth;
	let height = canvas.height = canvas.clientHeight;
	let circle = [], selectedCircle, map;

	let drawMap=map=>{
		
		// circle / members
		circle = [];

		members.forEach(m=>{
			let {lon,lat} = m.position;
			let {x,y} = map.toPoint(lon,lat);
			x-=map.tl.x;
			y-=map.tl.y;
			let c = circle.find(o=>{
				let distance = ((o.x-x)**2+(o.y-y)**2)**.5;
				return distance<circleRadius*2;
			});
			if (!c) circle.push(c={x,y,members:[]});
			c.members.push(m);
		});

		if (g){
			let m = g.overseer;
			if (m) {
				let c = circle.find(c=>c.members.includes(m));
				if (c) c.overseer = true;
			}
			m = g.assistant;
			if (m) {
				let c = circle.find(c=>c.members.includes(m));
				if (c) c.assistant = true;
			}
		}
		circle.forEach(c=>{
			if (c.members.some(m=>m.elder)) c.elder = true;
			if (c.members.some(m=>m.servant)) c.servant = true;
			if (c.members.some(m=>m.pioneer)) c.pioneer = true;
		})

		if (selectedCircle) selectedCircle = circle.find(o=>{
			let distance = ((o.x-selectedCircle.x)**2+(o.y-selectedCircle.y)**2)**.5;
			return distance<circleRadius;
		});
		
		redrawMap(map);
	};

	let toPoint=(map,o)=>{
		let {lon,lat} = o;
		let {x,y} = map.toPoint(lon,lat);
		x-=map.tl.x;
		y-=map.tl.y;
		return {x,y};
	}

	let redrawMap=map=>{
		ctx.drawImage(map.get().canvas,0,0);

		// territory
		ctx.fillStyle = "hsla(270,50%,90%,0.3)";
		ctx.strokeStyle = "hsla(270,50%,50%,0.8)";
		ctx.beginPath();
		TERRITORY.forEach(o=>{
			let {x,y} = toPoint(map,o);
			o.x = x;
			o.y = y;
		});
		ctx.moveTo(TERRITORY[0].x,TERRITORY[0].y);
		TERRITORY.forEach(o=>ctx.lineTo(o.x,o.y));
		ctx.lineTo(TERRITORY[0].x,TERRITORY[0].y);
		ctx.fill();
		ctx.stroke();

		// draw members
		let endAngle = Math.PI*2,r=10;

		ctx.lineWidth = 3;
		circle.forEach(c=>{
			let color = 210;
			if (c.overseer || c.assistant) color = 0;
			else if (c.elder || c.servant) color = 30;
			else if (c.pioneer) color = 150;
			let hue = c == selectedCircle ? 120 : color;
			ctx.fillStyle = "hsla("+hue+",50%,90%,0.8)";
			ctx.strokeStyle = "hsla("+hue+",50%,50%,0.8)";
			ctx.beginPath();
			ctx.arc(c.x,c.y,circleRadius,0,endAngle);
			ctx.fill();
			ctx.stroke();
		});
		
		ctx.font = "12px Roboto";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		circle.forEach(c=>{
			let color = 210;
			if (c.overseer || c.assistant) color = 0;
			else if (c.elder || c.servant) color = 30;
			else if (c.pioneer) color = 150;
			let hue = c == selectedCircle ? 120 : color;
			ctx.fillStyle = "hsl("+hue+",50%,50%)";
			ctx.fillText(c.members.length,c.x,c.y+1);
		});
	};

	map = MAP.create({width,height,min,max,onProgress:(o,info)=>{
		drawMap(o);
	},onReady:(o,info)=>{
		drawMap(o);
	}});

	routes.addRunEventListener(window,"appresize",event=>{
		let width = canvas.width = canvas.clientWidth;
		let height = canvas.height = canvas.clientHeight;
		map.setSize(width,height);
	});
});

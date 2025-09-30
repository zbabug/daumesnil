routes.on("#",async()=>{
	let el=document.querySelector("#groups");
	dom({el,childs:Group.all
		.map(o=>({type:"a",inner:o.name,attributes:{href:"#groups/"+o.id}}))});
});

routes.on("#maps",/^#maps\/\d+$/,async()=>{

	let parent = document.getElementById("page-main");
	parent.classList.remove("--page");

	let min={lon:0,lat:0},max={lon:0,lat:0};
	
	let members = Member.all.filter(o=>o.position);
	let group = /^#maps\/\d+$/.test(routes.hash) ? +routes.hash.split`/`.pop() : -1;
	if (group>=0) members = members.filter(o=>o.group==group);

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
			if (!selectedCircle) return;
			App.modal.create({title:"Membres",buttons:"ok cancel",container:dom({cn:"--flex-8",childs:selectedCircle.members.map(m=>{
				return member_dom_mini(m);
			})})})
		}
	}});

	let ctx = canvas.getContext('2d');
	let width = canvas.width = canvas.clientWidth;
	let height = canvas.height = canvas.clientHeight;
	let circle = [], selectedCircle;

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

		if (selectedCircle) selectedCircle = circle.find(o=>{
			let distance = ((o.x-selectedCircle.x)**2+(o.y-selectedCircle.y)**2)**.5;
			return distance<circleRadius;
		});
		
		redrawMap(map);
	};

	let redrawMap=map=>{
		ctx.drawImage(map.get().canvas,0,0);

		// draw members
		let endAngle = Math.PI*2,r=10;

		ctx.lineWidth = 3;
		circle.forEach(c=>{
			let hue = c == selectedCircle ? 120 : 210;
			ctx.fillStyle = "hsl("+hue+",50%,90%)";
			ctx.strokeStyle = "hsl("+hue+",50%,50%)";
			ctx.beginPath();
			ctx.arc(c.x,c.y,circleRadius,0,endAngle);
			ctx.fill();
			ctx.stroke();
		});
		
		ctx.font = "12px Roboto";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		circle.forEach(c=>{
			let hue = c == selectedCircle ? 120 : 210;
			ctx.fillStyle = "hsl("+hue+",50%,50%)";
			ctx.fillText(c.members.length,c.x,c.y+1);
		});
	};

	let map = MAP.create({width,height,min,max,onProgress:(o,info)=>{
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

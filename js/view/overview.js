routes.on("#",async()=>{
	let el=document.querySelector("#groups");
	dom({el,childs:Group.all
		.filter(o=>o.id<10)
		.map(o=>({cn:"--flex-8",childs:[
			{type:"a",inner:o.name,attributes:{href:"#groups/"+o.id}},
			{type:"a",inner:"(carte)",attributes:{href:"#maps/"+o.id}}
		]}))});

	el=document.querySelector("#new-groups");
	dom({el,childs:Group.all
		.filter(o=>o.id>10)
		.map(o=>({cn:"--flex-8",childs:[
			{type:"a",inner:o.name,attributes:{href:"#groups/"+o.id}},
			{type:"a",inner:"(carte)",attributes:{href:"#maps/"+o.id}}
		]}))});
});

let TERRITORY = [{"lon":2.3886680603027344,"lat":48.826531358347054},{"lon":2.3654937744140625,"lat":48.845739667840384},{"lon":2.3694419860839844,"lat":48.85375978148347},{"lon":2.37579345703125,"lat":48.8512748132034},{"lon":2.396221160888672,"lat":48.84867675994343},{"lon":2.4145889282226562,"lat":48.8469823047543},{"lon":2.4125289916992188,"lat":48.83613643374479},{"lon":2.4092674255371094,"lat":48.83421556597207},{"lon":2.414073944091797,"lat":48.833424599010925},{"lon":2.4228286743164062,"lat":48.83613643374479},{"lon":2.428150177001953,"lat":48.83896110549604},{"lon":2.4339866638183594,"lat":48.8409947705306},{"lon":2.434673309326172,"lat":48.84517482268592},{"lon":2.447376251220703,"lat":48.843706195467924},{"lon":2.4533843994140625,"lat":48.83545848882338},{"lon":2.4655723571777344,"lat":48.826531358347054},{"lon":2.46368408203125,"lat":48.82020230247927},{"lon":2.458362579345703,"lat":48.817489605290135},{"lon":2.4394798278808594,"lat":48.8188459722355},{"lon":2.4341583251953125,"lat":48.82020230247927},{"lon":2.4303817749023438,"lat":48.82325391133874},{"lon":2.4231719970703125,"lat":48.82393202140893},{"lon":2.4193954467773438,"lat":48.824158056060064},{"lon":2.4159622192382812,"lat":48.824723138227746},{"lon":2.4121856689453125,"lat":48.824723138227746},{"lon":2.407379150390625,"lat":48.826531358347054},{"lon":2.4010276794433594,"lat":48.829582581850715},{"lon":2.39227294921875,"lat":48.82754845349204}];
let filter = {active:1};

let GROUPES = [
	[{"lon":2.373518943786621,"lat":48.84520306509496},{"lon":2.386050224304199,"lat":48.83915882655357},{"lon":2.3887109756469727,"lat":48.8369273578907},{"lon":2.391328811645508,"lat":48.83729456842787},{"lon":2.395191192626953,"lat":48.83975198504332},{"lon":2.389955520629883,"lat":48.84452524288213},{"lon":2.385878562927246,"lat":48.842632940649274},{"lon":2.383260726928711,"lat":48.844864155135326},{"lon":2.3818016052246094,"lat":48.84658692362645}], //Sibuet 
    [{"lon":2.3975086212158203,"lat":48.82870678670791},{"lon":2.4010705947875977,"lat":48.829610833052065},{"lon":2.409224510192871,"lat":48.83427206313431},{"lon":2.4034738540649414,"lat":48.83667313363422},{"lon":2.3951053619384766,"lat":48.83966724854627},{"lon":2.391200065612793,"lat":48.83729456842787},{"lon":2.3888397216796875,"lat":48.83695560495065},{"lon":2.3961353302001953,"lat":48.83099512240606}], //Charenton 
    [{"lon":2.3692703247070312,"lat":48.84274591592381},{"lon":2.3733901977539062,"lat":48.8452877922265},{"lon":2.3860931396484375,"lat":48.83907408905306},{"lon":2.3961353302001953,"lat":48.83099512240606},{"lon":2.3975086212158203,"lat":48.82873503840306},{"lon":2.3888397216796875,"lat":48.82641834650107}], //Netter 
    [{"lon":2.381865978240967,"lat":48.84660104443476},{"lon":2.3831963539123535,"lat":48.844850033837226},{"lon":2.385857105255127,"lat":48.8426611844918},{"lon":2.3898911476135254,"lat":48.8445393642718},{"lon":2.39027738571167,"lat":48.8442004498206},{"lon":2.3945260047912598,"lat":48.84626214393607},{"lon":2.395341396331787,"lat":48.84542900379384},{"lon":2.395920753479004,"lat":48.84876148119776},{"lon":2.3845481872558594,"lat":48.85015936119867},{"lon":2.3866939544677734,"lat":48.847405923927056}], //Nation 
    [{"lon":2.3691415786743164,"lat":48.842689428318394},{"lon":2.3733901977539062,"lat":48.84531603457181},{"lon":2.3866939544677734,"lat":48.84737768276037},{"lon":2.3845911026000977,"lat":48.85011700177203},{"lon":2.3758363723754883,"lat":48.8512748132034},{"lon":2.3694849014282227,"lat":48.85373154390039},{"lon":2.3654937744140625,"lat":48.845739667840384}], //Reuilly 
    [{"lon":2.395148277282715,"lat":48.83972373956022},{"lon":2.390255928039551,"lat":48.84421457130185},{"lon":2.394547462463379,"lat":48.846276264835986},{"lon":2.395319938659668,"lat":48.84540076151223},{"lon":2.4056625366210938,"lat":48.844581728416934},{"lon":2.403430938720703,"lat":48.836757875196405}], //Picpus 
    [{"lon":2.4056625366210938,"lat":48.844581728416934},{"lon":2.414073944091797,"lat":48.843960384029955},{"lon":2.4126148223876953,"lat":48.83613643374479},{"lon":2.409224510192871,"lat":48.834243814561155},{"lon":2.4034738540649414,"lat":48.836701380837546}], //Soult 
    [{"lon":2.395920753479004,"lat":48.84867675994343},{"lon":2.395319938659668,"lat":48.84540076151223},{"lon":2.414073944091797,"lat":48.84393214092011},{"lon":2.4146318435668945,"lat":48.84695406334869}]  //Vincennes 
];

function log_groups_info(){
	let members = Member.all.sort((a,b)=>a.fullname.localeCompare(b.fullname));
	console.group("Groupes");
	Group.all.filter(o=>o.id>10).forEach(g=>{
		let m = members.filter(m=>m.newgroup==g.id);
		console.groupCollapsed(`${g.name} (${m.length}) A=${m.filter(m=>m.elder).length} AM=${m.filter(m=>m.servant).length} PP=${m.filter(m=>m.pioneer).length}`);
		m.forEach(m=>{
			console.log(`${m.fullname}`);
		});
		console.groupEnd();
	});
	console.groupEnd();

	// export
	let a = Group.all.filter(o=>o.id>10).map(g=>{
		let list = [g.overseer,g.assistant];
		let m = members.filter(m=>m.newgroup==g.id && !list.includes(m));
		list.push(...m);
		let a = [`${g.name} (${list.length})`];
		list.forEach(m=>{
			let o = [];
			if (o.elder) o.push('(A)')
			if (o.servant) o.push('(AM)')
			if (o.pioneer) o.push('(PP)')
			o = o.join`, `;
			a.push(`${m.fullname}${o?" "+o:""}`);
		});
		return a;
	});
	let max = Math.max(...a.map(a=>a.length));
	a = Array(max).fill(0).map((_,i)=>Array(a.length).fill(0).map((_,j)=>a[j][i]||"").join`;`);
	navigator.clipboard.writeText(a.join`\n`);
}

routes.on("#maps",/^#maps\/\d+$/,async()=>{

	[...document.querySelectorAll('a.menu-item[href]')].filter(el=>el.hash.startsWith("#groups/")).forEach(el=>{
		let id = +el.href.split`/`.pop();
		el.setAttribute("href","#maps/"+id);
		el.hash = "#maps/"+id;
	});

	let path = routes.hash.split`/`;

	let parent = document.getElementById("page-main");
	parent.classList.remove("--page");

	let min={lon:0,lat:0},max={lon:0,lat:0};
	
	let all = Member.all.filter(o=>o.position && !o.disabled);
	let members = all;
	let group = path.length>1 ? +routes.hash.split`/`.pop() : -1;

	let filters = [
		{f:"elder",inner:"person_heart"},
		{f:"servant",inner:"person_play"},
		{f:"pioneer",inner:"diversity_4"},
		{f:"overseer",inner:"supervised_user_circle",modulo:5,list:["inactif","on","off","overseer","assistant"]},
		{f:"active",inner:"contact_emergency"},
		{f:"group",inner:"communities",modulo:2,list:["off","on"]}
	];

	let g = group<0 ? null : Group.get(group);
	console.log(g);

	let {lon,lat} = members?.length ? members[0].position : {};
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

	let member_mini=(m,property="fullname")=>{
		let childs = [{cn:"--flex-4",style:"align-items:center",childs:[{inner:m[property]}]}];
		childs.push({cn:"--flex-4",style:"font-size:0.7em;align-items:center",childs:[
			{cn:"material-symbols-outlined",inner:"location_on"},
			{inner:`${Group.get(m.group)?.name||"aucun"}`}
		]});
		childs.push({cn:"--flex-4",style:"font-size:0.7em;align-items:center",childs:[
			{cn:"material-symbols-outlined",inner:"east"},
			{inner:`${Group.get(m.newgroup)?.name||"aucun"}`}
		]});
		if (m.image) return {cn:"block",properties:{m},childs:{cn:"--flex-4",childs:[
			{type:"img",cn:"member-image",attributes:{src:m.image.url}},
			{cn:"--flex-col",childs}
		]}}
		return {cn:"block",childs,properties:{m}};
	}

	let canvas = dom({type:"canvas",cn:"map",onrun:{
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
		touchstart:event=>{
			event.preventDefault();
			let t = event.changedTouches[0]; if (!t) return;
			if (event.type=="touchstart" && event.touches.length==2){
				//TODO ZOOM
				return;
			}
			let mx = event.touches[0].clientX, my = event.touches[0].clientY;
			var sx=mx, sy=my;
			var cx=map.center.x, cy=map.center.y;
			var max = 0;
			moving = true;
			let touchmove = event=>{
				if (!moving) return;
				if (event.touches.length!=1) return;
				let mx = event.touches[0].clientX, my = event.touches[0].clientY;
				var dx=mx-sx, dy=my-sy; max = Math.max(max,Math.abs(dx),Math.abs(dy));
				var p = map.toCoor(cx-dx,cy-dy);
				map.setCenter(p.lon,p.lat);
			};
			let touchend = event=>{
				touchmove(event);
				moving = false;
				window.removeEventListener("touchmove",touchmove);
				window.removeEventListener("touchend",touchend);
			};
			window.addEventListener("touchmove",touchmove);
			window.addEventListener("touchend",touchend);
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
		},
		mousemove:event=>{
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
			App.modal.create({title:"Membres",buttons:"cancel",container:dom({cn:"--flex-8",childs:selectedCircle.members.map(m=>{
				return member_mini(m);
			}),onrun:{click:event=>{
				let el = event.target; while (el && !el.m) el=el.parentNode; if (!el) return;
				let m = el.m;
				App.modal.create({title:m.fullname,buttons:"cancel",container:dom({cn:"--flex-8",childs:Group.all.filter(o=>o.id>10).map(g=>({cn:"block",inner:g.name,properties:{g}})),onrun:{click:event=>{
					let el = event.target; while (el && !el.g) el=el.parentNode; if (!el) return;
					if (m.data.newgroup == el.g.id) return;
					App.modal.close();
					console.log(`${m.fullname}: ${Group.get(m.newgroup).name} => %c ${el.g.name} `,'background-color:hsl(60,80%,90%);color:#000a');
					m.data.newgroup = el.g.id;
					drawMap(map);
					log_groups_info();
				}}})});
			}}})})
		}
	}});

	dom({el:parent,childs:[
		canvas,
		{cn:"--flex-4",childs:[
			{type:"button",cn:'button button--contained',attributes:{color:"blue"},childs:[
				{type:"span",cn:"material-symbols-outlined",inner:"zoom_out"}
			],onrun:{click:()=>{map.setZoom("-")}}},
			{type:"button",cn:'button button--contained',attributes:{color:"blue"},childs:[
				{type:"span",cn:"material-symbols-outlined",inner:"zoom_in"}
			],onrun:{click:()=>{map.setZoom("+")}}},
			filters.map(({f,inner,list,modulo})=>({type:"button",cn:'button button--contained',attributes:{color:["blue","green","red"][filter[f]||0]},childs:[
				{type:"span",cn:"material-symbols-outlined",inner}
			],onrun:{click:event=>{
				filter[f]=((filter[f]||0)+1)%(modulo||3);
				drawMap(map);
				let el = event.target; while (el && el.nodeName!="BUTTON") el=el.parentNode;
				if (el) el.setAttribute("color",["blue","green","red","cyan","purple"][filter[f]||0])
				console.log(`filter.${f} = ${(list||["both","yes","no"])[filter[f]]}`);
			}}}))
		]}
		
	]});

	let ctx = canvas.getContext('2d');
	let width = canvas.width = canvas.clientWidth;
	let height = canvas.height = canvas.clientHeight;
	let circle = [], selectedCircle, map;

	let drawMap=map=>{

		// filter member
		members = all.slice(0);
		if (filter.group){
			if (group>=0 && group<10) members = members.filter(o=>o.group!=group && o.publisher);
			if (group>=10) members = members.filter(o=>o.newgroup!=group && o.publisher);
		} else {
			if (group>=0 && group<10) members = members.filter(o=>o.group==group && o.publisher);
			if (group>=10) members = members.filter(o=>o.newgroup==group && o.publisher);
		}
		filters.forEach(({f})=>{
			if (f=="overseer"){
				let lo = g ? [g.overseer] : Group.all.filter(g=>g.id>10).map(g=>[g.overseer]).flat();
				let la = g ? [g.assistant] : Group.all.filter(g=>g.id>10).map(g=>[g.assistant]).flat();
				let list = [[],[lo,la].flat(),[lo,la].flat(),lo,la][filter[f]];
				if (filter[f]==2) members = members.filter(o=>!list.includes(o));
				else if (filter[f]>0) members = members.filter(o=>list.includes(o));
				return;
			}
			if (filter[f]==1) members = members.filter(o=>o[f]);
			else if (filter[f]==2) members = members.filter(o=>!o[f]);
		});
		
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

	let drawZone=(map,points,hue,type)=>{
		if (!points?.length) return;
		// territory
		ctx.fillStyle = "hsla("+hue+",50%,90%,0.3)";
		ctx.strokeStyle = "hsla("+hue+",50%,50%,0.8)";
		ctx.beginPath();
		points.forEach(o=>{
			let {x,y} = toPoint(map,o);
			o.x = x;
			o.y = y;
		});
		ctx.moveTo(points[0].x,points[0].y);
		points.forEach(o=>ctx.lineTo(o.x,o.y));
		ctx.lineTo(points[0].x,points[0].y);
		if (type==1) ctx.fill();
		if (type==2) ctx.stroke();
	};

	let redrawMap=map=>{
		ctx.drawImage(map.get().canvas,0,0);

		// territory
		drawZone(map,TERRITORY,270,1);
		if (group==10) GROUPES.forEach(g=>drawZone(map,g,30,1));
		else if (g?.id>10) drawZone(map,GROUPES[g.id-11],30,1);
		drawZone(map,TERRITORY,270,2);
		if (group==10) GROUPES.forEach(g=>drawZone(map,g,30,2));
		else if (g?.id>10) drawZone(map,GROUPES[g.id-11],30,2);

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
			if (c.overseer || c.assistant) color = 0;
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

	log_groups_info();
});

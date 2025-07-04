routes.on(/^#groups\/\d+$/,async event=>{
	let id = +routes.hash.split`/`.pop();
	let group = Group.get(id);
	if (!group) return void templates.insert("not-found");
	console.log(group);

	let title = `Groupe de prédication - ${group.name}`;
	document.title = title;
	document.body.querySelector('section.app .app--subtitle').innerHTML=title;

    let fulllist = Member.all.filter(m=>!m.disabled&&m.group==id);
	let property = "fullname";

	let parent = document.getElementById("page-main");

	let list = [];

	let update=async()=>{
		let f = fields.values;
		Z.Storage.save("filters-members",f);
		console.log(f);
		let p = property = f.firstname ? "revers_fullname" : "fullname";
		list = fulllist.filter(o=>{
			if (f.pioneer && !o.pioneer) return;
			if (f.publisher && !o.publisher) return;

			if (o.gender==1 && f.masculine) return true;
			if (o.gender==2 && f.feminine) return true;
			if (o.elder && f.elder) return true;
			if (o.servant && f.servant) return true;
		}).sort((a,b)=>a[p].localeCompare(b[p]));
		refresh();
	};

	let refresh=()=>{
		dom({el:e.h3,inner:"Liste des membres ("+list.length+"/"+fulllist.length+")"});
		dom({el:e.container,inner:"",childs:list.map(m=>member_dom(m,property))});
	};

	let el = dom({parent,cn:"--flex-col-32",style:"align-items:flex-start;",childs:[
		{type:"h2",inner:title},
		{cn:"--flex-col-8",childs:[
            {type:"h3",inner:"Responsable: <b>"+group.overseer.fullname+"</b>"},
            {type:"h3",inner:"Adjoint: <b>"+group.assistant.fullname+"</b>"}
        ]},
        {cn:"--flex-col-8",style:"align-items:flex-start",childs:[
            {id:"subtitle",type:"h3"},
			members_filters,
       		{id:"container",cn:"--flex-col-8"}
        ]}
	],onrun:{fieldchange:update}});

	let e = {
		h3:el.querySelector("#subtitle"),
		container:el.querySelector("#container")
	}; console.log(e);

	let fields = new Fields();

	let f = await Z.Storage.get("filters-members").catch(()=>({}));
	fields.write(f,{initial:true});

	update();
});

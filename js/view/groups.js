routes.on(/^#groups\/\d+$/,event=>{
	let id = +routes.hash.split`/`.pop();
	let group = Group.get(id);
	if (!group) return void templates.insert("not-found");
	console.log(group);

	let title = `Groupe de prédication - ${group.name}`;
	document.title = title;
	document.body.querySelector('section.app .app--subtitle').innerHTML=title;

    let list = Member.all.filter(m=>m.group==id);
	console.log(list);

	let parent = document.getElementById("page-main");

	dom({parent,cn:"--flex-col-32",childs:[
		{type:"h2",inner:title},
        {cn:"--flex-col-8",childs:[
            {type:"h3",inner:"Responsable: <b>"+group.overseer.fullname+"</b>"},
            {type:"h3",inner:"Adjoint: <b>"+group.assistant.fullname+"</b>"}
        ]},
        {cn:"--flex-col-8",style:"align-items:flex-start",childs:[
            {type:"h3",inner:"Liste des membres ("+list.length+")"},
            {cn:"--flex-col-8",childs:list.map(m=>({cn:"block",inner:m.fullname}))}
        ]}
	]});
});

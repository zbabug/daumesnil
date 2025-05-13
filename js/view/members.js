function members_show(o){
	let list = o.list;
	console.log(list);
	let property = o.property || "fullname";

	if (o.title){
		document.title = o.title;
		document.body.querySelector('section.app .app--subtitle').innerHTML=o.title;
	}

	let parent = document.getElementById("page-main");

	dom({parent,cn:"--flex-col-32",style:"align-items:flex-start;",childs:[
		{type:"h2",inner:o.subtitle+" ("+list.length+")"},
		{cn:"--flex-col-8",childs:list.map(m=>({cn:"block",inner:m[property]}))}
	]});
}

routes.on(/^#members\/\d+$/,event=>{
	let id = +routes.hash.split`/`.pop();
	let member = Member.get(id);
	if (!member) return void templates.insert("not-found");
	console.log(member);

	let title = `Membre - ${member.name}`;
	document.title = title;
	document.body.querySelector('section.app .app--subtitle').innerHTML=title;
});

routes.on("#members",event=>{
	members_show({list:Member.all,
		title:"Membres de l'assemblée",
		subtitle:"Liste des membres de l'assemblée (par nom)"});
});

routes.on("#members/firstname",event=>{
	let list = Member.all.sort((a,b)=>a.revers_fullname.localeCompare(b.revers_fullname));
	members_show({list,property:"revers_fullname",title:"Membres de l'assemblée",
		subtitle:"Liste des membres de l'assemblée (par prénom)"});
});

routes.on("#members/elders",event=>{
	let list = Member.all.filter(o=>o.elder);
	members_show({list,title:"Anciens",
		subtitle:"Liste des anciens"});
});

routes.on("#members/assistants",event=>{
	let list = Member.all.filter(o=>o.servant);
	members_show({list,title:"Assistants",
		subtitle:"Liste des assistants"});
});

routes.on("#members/pioneers",event=>{
	let list = Member.all.filter(o=>o.pioneer);
	members_show({list,title:"Pionniers",
		subtitle:"Liste des pionniers"});
});
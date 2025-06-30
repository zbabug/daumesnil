async function members_show(o){
	let fulllist = o.list.filter(o=>!o.disabled);
	let property = o.property || "fullname";

	if (o.title){
		document.title = o.title;
		document.body.querySelector('section.app .app--subtitle').innerHTML=o.title;
	}

	let parent = document.getElementById("page-main");

	let filters = [
		{type:"label",cn:"checkbox",childs:[
			{type:"input",attributes:{type:"checkbox","data-property":"masculine"}},
			{type:"span",cn:"checkbox--checked material-symbols-outlined",inner:"check_box"},
			{type:"span",cn:"checkbox--blank material-symbols-outlined",inner:"check_box_outline_blank"},
			{type:"span",inner:"Homme"}
		]},
		{type:"label",cn:"checkbox",childs:[
			{type:"input",attributes:{type:"checkbox","data-property":"feminine"}},
			{type:"span",cn:"checkbox--checked material-symbols-outlined",inner:"check_box"},
			{type:"span",cn:"checkbox--blank material-symbols-outlined",inner:"check_box_outline_blank"},
			{type:"span",inner:"Femme"}
		]},
		{type:"label",cn:"checkbox",childs:[
			{type:"input",attributes:{type:"checkbox","data-property":"elder"}},
			{type:"span",cn:"checkbox--checked material-symbols-outlined",inner:"check_box"},
			{type:"span",cn:"checkbox--blank material-symbols-outlined",inner:"check_box_outline_blank"},
			{type:"span",inner:"Ancien"}
		]},
		{type:"label",cn:"checkbox",childs:[
			{type:"input",attributes:{type:"checkbox","data-property":"servant"}},
			{type:"span",cn:"checkbox--checked material-symbols-outlined",inner:"check_box"},
			{type:"span",cn:"checkbox--blank material-symbols-outlined",inner:"check_box_outline_blank"},
			{type:"span",inner:"Assistant"}
		]},
		{type:"label",cn:"checkbox",childs:[
			{type:"input",attributes:{type:"checkbox","data-property":"pioneer"}},
			{type:"span",cn:"checkbox--checked material-symbols-outlined",inner:"check_box"},
			{type:"span",cn:"checkbox--blank material-symbols-outlined",inner:"check_box_outline_blank"},
			{type:"span",inner:"Pionnier"}
		]},
		{type:"label",cn:"checkbox",childs:[
			{type:"input",attributes:{type:"checkbox","data-property":"firstname"}},
			{type:"span",cn:"checkbox--checked material-symbols-outlined",inner:"check_box"},
			{type:"span",cn:"checkbox--blank material-symbols-outlined",inner:"check_box_outline_blank"},
			{type:"span",inner:"Trier par prénom"}
		]}
	];

	let list = [];

	let update=async()=>{
		let f = fields.values;
		Z.Storage.save("filters-members",f);
		console.log(f);
		let p = property = f.firstname ? "revers_fullname" : "fullname";
		list = fulllist.filter(o=>{
			if (f.pioneer && !o.pioneer) return;

			if (o.gender==1 && f.masculine) return true;
			if (o.gender==2 && f.feminine) return true;
			if (o.elder && f.elder) return true;
			if (o.servant && f.servant) return true;
		}).sort((a,b)=>a[p].localeCompare(b[p]));
		refresh();
	};

	let refresh=()=>{
		dom({el:e.h3,inner:o.subtitle+" ("+list.length+"/"+fulllist.length+")"});
		dom({el:e.container,inner:"",childs:list.map(m=>{
			let childs = [{inner:m[property]}];
			let parent = m.parent.sort((a,b)=>a[property].localeCompare(b[property]));
			let children = m.children.sort((a,b)=>a[property].localeCompare(b[property]));
			if (m.spouse) childs.push({cn:"--flex-4",style:"font-size:0.7em;align-items:center",childs:[
				{cn:"material-symbols-outlined",inner:"person_heart"},
				{inner:m.spouse[property]}
			]});
			parent.forEach(o=>{
				childs.push({cn:"--flex-4",style:"font-size:0.7em;align-items:center",childs:[
					{cn:"material-symbols-outlined",inner:"family_restroom"},
					{inner:o[property]}
				]});
			});
			children.forEach(o=>{
				childs.push({cn:"--flex-4",style:"font-size:0.7em;align-items:center",childs:[
					{cn:"material-symbols-outlined",inner:"supervisor_account"},
					{inner:o[property]}
				]});
			});
			if (!m.publisher) childs.push({cn:"--flex-4",style:"font-size:0.7em;align-items:center",childs:[
				{style:"font-style:italic",inner:"Pas proclamateur"}
			]});
			return {cn:"block",childs}
		})});
	};

	let el = dom({parent,cn:"--flex-col-32",style:"align-items:flex-start;",childs:[
		{type:"h2",inner:o.title},
		{cn:"--flex-8",childs:filters},
		{type:"h3"},
		{cn:"--flex-col-8"}
	],onrun:{fieldchange:update}});

	let e = {
		h3:el.querySelector("h3"),
		container:el.querySelector("div.--flex-col-8")
	};

	let fields = new Fields();

	let f = await Z.Storage.get("filters-members").catch(()=>({}));
	fields.write(f,{initial:true});

	update();
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
		subtitle:"Liste des membres de l'assemblée"});
});

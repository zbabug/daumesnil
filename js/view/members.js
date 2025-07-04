// TOOLS
{

	//DOWNLOAD IMAGE from WhatsApp
	let DI=()=>{
		let po=el=>{while(el){if (el.classList.contains("overlay")) return el; el=el.parentNode}};
		[...document.querySelectorAll("img")].filter(o=>o.width>600)
			.forEach(img=>{let a=document.createElement("a");a.href=img.src;
				a.download=`${po(img)?.querySelector("span")?.textContent||"file"}.jpg`;
				console.log(a.download);
				navigator.clipboard.writeText(a.download);
				document.body.append(a);a.click()
			})};

}


function member_dom(m,property="fullname"){
	let childs = [{cn:"--flex-4",style:"align-items:center",childs:[{inner:m[property]}]}];
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
	if (!m.publisher) childs[0].childs.push({cn:"material-symbols-outlined",inner:"cancel"});
	if (m.image) return {cn:"block",childs:{cn:"--flex-4",childs:[
		{type:"img",cn:"member-image",attributes:{src:m.image.url}},
		{cn:"--flex-col",childs}
	]}}
	return {cn:"block",childs};
}

const members_filters = {cn:"--flex-col-8",childs:[
	{cn:"--flex-8",style:"background-color:#eee",childs:[
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
		]}
	]},
	{cn:"--flex-8",childs:[
		{type:"label",cn:"checkbox",childs:[
			{type:"input",attributes:{type:"checkbox","data-property":"pioneer"}},
			{type:"span",cn:"checkbox--checked material-symbols-outlined",inner:"check_box"},
			{type:"span",cn:"checkbox--blank material-symbols-outlined",inner:"check_box_outline_blank"},
			{type:"span",inner:"Pionnier"}
		]},
		{type:"label",cn:"checkbox",childs:[
			{type:"input",attributes:{type:"checkbox","data-property":"publisher"}},
			{type:"span",cn:"checkbox--checked material-symbols-outlined",inner:"check_box"},
			{type:"span",cn:"checkbox--blank material-symbols-outlined",inner:"check_box_outline_blank"},
			{type:"span",inner:"Proclamateur"}
		]},
		{type:"label",cn:"checkbox",childs:[
			{type:"input",attributes:{type:"checkbox","data-property":"firstname"}},
			{type:"span",cn:"checkbox--checked material-symbols-outlined",inner:"check_box"},
			{type:"span",cn:"checkbox--blank material-symbols-outlined",inner:"check_box_outline_blank"},
			{type:"span",inner:"Trier par prénom"}
		]}
	]}
]};

async function members_show(o){
	let fulllist = o.list.filter(o=>!o.disabled);
	let property = o.property || "fullname";

	if (o.title){
		document.title = o.title;
		document.body.querySelector('section.app .app--subtitle').innerHTML=o.title;
	}

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
		dom({el:e.h3,inner:o.subtitle+" ("+list.length+"/"+fulllist.length+")"});
		dom({el:e.container,inner:"",childs:list.map(m=>member_dom(m,property))});
	};

	let el = dom({parent,cn:"--flex-col-32",style:"align-items:flex-start;",childs:[
		{type:"h2",inner:o.title},
		members_filters,
		{type:"h3"},
		{cn:"--flex-col-8"}
	],onrun:{fieldchange:update}});

	let e = {
		h3:el.querySelector("h3"),
		container:el.children[3]
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

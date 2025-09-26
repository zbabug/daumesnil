window.addEventListener("builderready",async ()=>{
	App.run();
	await Member.load();
	await Group.load();
	await App.data.get("data/app-menu.json")?.json().then(async data=>{
		data[0].childs[2].childs=Group.all.map(o=>({"caption":o.name,"hash":"#groups/"+o.id}));
		App.menu.load(data);
		routes.force().run();
		console.log(`photos: %c ${Member.all.filter(o=>o.image).length}/${Member.all.length} (${Member.all.filter(o=>o.image).length*100/Member.all.length|0}%) `,`background-color:#ccc;color:#777`)
		import_S21();
	}).catch();
});

window.addEventListener("click",event=>{
	event.composedPath().forEach(el=>{
		if (el?.entry) {
			console.log(""+el.entry);
			console.log(el.entry);
		}
	});
});

window.addEventListener("fieldchange",event=>{
	let field = new Field(event.target);
	field.clearChange();
});

routes.on(()=>{
	new Fields().clearChanges();
	App.components.article.auto();
});

function Log(msg){
	console.log(msg);
}

async function import_S21(){
	let XLSX = Z.XLSX.create();
	await XLSX.loadData(await builder.get("data/S21.xlsx").base64());
	let sheet = await XLSX.readSheet(11);
	console.log(XLSX);
	console.log(sheet);
	let rows = sheet.rows;
	let members = Member.all;
	let mn = members.map(m=>Z.Tools.normalize(m.fullname).split` `.filter(o=>o));
	console.log(mn);
	let m = [];
	let find_member=name=>{
		name = {
			"BITANGA Mélanie-Ernestine":"BITANGA Mélanie",
			"KALLA EBOUMBOU Marie":"KALLA Marie",
			"ORLOC COL Marie-Hélène":"ORLOC Marie-Hélène",
			"SALAGNARD Anny":"SALAGNARD Annie"
		}[name] || name;
		let n = Z.Tools.normalize(name).split` `.filter(o=>o);
		let index = mn.findIndex(a=>a.length==n.length&&!a.some(s=>!n.includes(s)));
		if (index>=0) return members[index];
	};
	for (let i=1;i<rows.length;i++){
		let row = rows[i];
		let cell = row.cells.find(o=>o.c==1);
		if (cell?.v){
			let member = find_member(cell.v);
			m.push({name:cell.v,member,row});
		}
	}
	console.log(m);
	console.log(m.filter(o=>!o.member));
}
window.addEventListener("builderready",async ()=>{
	App.run();
	await Member.load();
	await Group.load();
	await App.data.get("data/app-menu.json")?.json().then(async data=>{
		data[0].childs[2].childs=Group.all.map(o=>({"caption":o.name,"hash":"#groups/"+o.id}));
		App.menu.load(data);
		routes.force().run();
		console.log(`photos: %c ${Member.all.filter(o=>o.image).length}/${Member.all.length} (${Member.all.filter(o=>o.image).length*100/Member.all.length|0}%) `,`background-color:#ccc;color:#777`)
		//import_S21();
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

// https://bano.openstreetmap.fr/data/
async function import_bano(){
	let bano75 = await builder.get("data/bano-75.json").text();
	bano75 = bano75.split`\n`; bano75.pop();

	let bano93 = await builder.get("data/bano-93.json").text();
	bano93 = bano93.split`\n`; bano93.pop();

	let bano94 = await builder.get("data/bano-94.json").text();
	bano94 = bano94.split`\n`; bano94.pop();

	let data = [bano75,bano93,bano94].flat().map(json=>json=JSON.parse(json));
	data.forEach(o=>{
		o.normalize = Z.Tools.normalize(o.name).split(/[ -]/).filter(o=>o);
	});
	console.log(data);
	return data;
}

function find_address(bano,street,postcode,member){

	//---------------------------------------------------------------------------------------------------------
	// Update address
	//---------------------------------------------------------------------------------------------------------

	if (member.name=="FAHY Rébecca") {
		street = "8 place Robert Belvaux";
		postcode = 94170;
	}
	if (member.name=="GUZMAN Marleni") {
		street = "9 Rue Jacques Hillairet";
		postcode = 75012;
	}
	if (member.name=="MAURER Chloé") {
		street = "190 bis Boulevard de Charonne";
		postcode = 75020;
	}

	street = {
		"7 rue Georges Gershwin":"7 rue George Gershwin", // KIBIKULA
		"32 rue Baron Leroy":"32 rue baron le roy", // VALIER
		"6 rue Fernand Fourreau":"6 rue Fernand Foureau", // DURIMEL
		"7-9 rue Ernest Lefébure":"7 rue Ernest Lefébure", //DESNOS
		"184 rue du Faubourg St-Antoine":"182 rue du Faubourg St-Antoine", //MEDINA (absent de la base)
		"70bis Bd Diderot":"70 bis Bd Diderot", //N'SANGU
		"5 avenue Charles De Foucault":"5 avenue Charles De Foucauld", //OBERLIN
		"41 av Saint Mandé":"41 avenue de Saint-Mandé", //SORAIS
		"4 B de la Bastille":"4 Bd de la Bastille", //VOYAU
		"Rue du Sahel":"1 Rue du Sahel", //NATCHIMIE
	}[street] || street;

	postcode = {
		"8, place Robert Belvaux, 94130":94170, //FAHY
		"193 rue du Fb Saint Antoine, 75012":75011 //FLAVIANO
	}[street+", "+postcode] || postcode;

	//---------------------------------------------------------------------------------------------------------

	street = Z.Tools.normalize(street.trim());
	let change = {
		"desgranges":"desgrange",
		"av":"avenue",
		"av.":"avenue",
		"av,":"avenue",
		"dr":"docteur",
		"fb":"faubourg",
		"gal":"general",
		"gnl":"general",
		"bd":"boulevard",
		"st":"saint"
	};
	let s = street.split(/[ -]/).filter(o=>o).map(o=>{
		o = change[o] || o;
		return o.replace(/,/g,'')
	});
	street = s.join` `;
	let sn = [];
	if (s[1]=="bis") sn.push(s[0]+"b");
	if (s[1]=="ter") sn.push(s[0]+"t");
	let a;
	bano.forEach(o=>{
		if (o.postcode!=postcode) return;
		if (o.normalize.some(a=>!s.includes(a))) return;
		if (!o.housenumbers) return;
		Object.entries(o.housenumbers).forEach(([number,position])=>{
			if (street.startsWith(Z.Tools.normalize(number)+" ") || sn.includes(number)){
				let address = number+" "+o.name+", "+o.postcode+" "+o.city[0];
				if (!a || number.length>a.number.length) a = {address,number,position,bano:o};
			}
		});
	});
	return a;
}

async function import_S21(){
	let bano = await import_bano();
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

	// address
	m.forEach(m=>{
		street = m.row.cells.find(o=>o.c==4)?.v || "";
		postcode = m.row.cells.find(o=>o.c==5)?.v || "";
		town = m.row.cells.find(o=>o.c==6)?.v || "";
		b = find_address(bano,street,postcode,m);
		m.address = {street,postcode,town,bano:b};
	});

	console.log(m);
	console.log(m.filter(o=>!o.member));
	console.log(m.filter(o=>o.address.bano).map(o=>({name:o.name,street:o.address.street+", "+o.address.postcode+" "+o.address.town,bano:o.address.bano.address})));
	console.log(m.filter(o=>!o.address.bano));

	// add address info
	m.forEach(m=>{
		if (!m.member) return;
		if (!m.address?.bano?.position) return;
		let {street,postcode,town,bano} = m.address;
		m.member.data.address = {street,postcode,town,position:bano.position};
	});

	// export
	let json = "[\n"+Member.all.sort((a,b)=>a.id-b.id).map(m=>{
		data = JSON.parse(JSON.stringify(m.data));
		delete data.image;
		return "\t"+JSON.stringify(data);
	}).join`,\n`+"\n]";
	console.log(json);
}


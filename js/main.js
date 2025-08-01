window.addEventListener("builderready",async ()=>{
	App.run();
	await Member.load();
	await Group.load();
	await App.data.get("data/app-menu.json")?.json().then(async data=>{
		data[0].childs[2].childs=Group.all.map(o=>({"caption":o.name,"hash":"#groups/"+o.id}));
		App.menu.load(data);
		routes.force().run();
		console.log(`photos: %c ${Member.all.filter(o=>o.image).length}/${Member.all.length} (${Member.all.filter(o=>o.image).length*100/Member.all.length|0}%) `,`background-color:#ccc;color:#777`)
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

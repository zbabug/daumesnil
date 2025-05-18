routes.on("#",async()=>{
	let el=document.querySelector("#groups");
	dom({el,childs:Group.all
		.map(o=>({type:"a",inner:o.name,attributes:{href:"#groups/"+o.id}}))});
});

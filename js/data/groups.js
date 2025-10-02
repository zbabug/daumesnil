class Group{
	static #all = [];
	static async load(){
		Group.#all = [];
		let a = await builder.get("data/groups.json").json();
		if (!(a instanceof Array)) throw new Error("[groups] bad groups data");
		for (let data of a){
			let o = new Group(data);
			if (o.id<1) throw new Error("[group] bad group id");
			if (Group.get(o.id)) throw new Error(`[group] id ${o.id} already exist`);
            if (!o.overseer) throw new Error(`[group] id ${o.id} overseer not found`);
            if (!o.assistant) throw new Error(`[group] id ${o.id} assistant not found`);
			Group.#all.push(o);
		}
		Group.#all.sort((a,b)=>a.name.localeCompare(b.name));
	}
	static get all(){return Group.#all}
	static get(id){return Group.#all.find(o=>o.id==id)}
	#data
	constructor(data){
		if (!(data instanceof Object)) throw new Error("[group] invalid data object");
		this.#data = data;
	}
	get id(){return +this.#data.id}

	get name(){return this.#data.name||""}

	get overseer(){return Member.get(this.#data.overseer)}
	get assistant(){return Member.get(this.#data.assistant)}
}
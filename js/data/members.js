class Member{
	static #all = [];
	static async load(){
		Member.#all = [];
		let a = await builder.get("data/members.json").json();
		if (!(a instanceof Array)) throw new Error("[member] bad members data");
		for (let data of a){
			let m = new Member(data);
			if (m.id<1) throw new Error("[member] bad member id");
			if (Member.get(m.id)) throw new Error(`[member] id ${m.id} already exist`);
			Member.#all.push(m);
		}
		Member.#all.sort((a,b)=>a.sortname.localeCompare(b.sortname));
	}
	static get all(){return [...Member.#all]}
	static get(id){return Member.#all.find(o=>o.id==id)}
	#data
	constructor(data){
		if (!(data instanceof Object)) throw new Error("[member] invalid data object");
		this.#data = data;
	}
	get id(){return +this.#data.id}

	get lastname(){return this.#data.lastname||""}
	get firstname(){return this.#data.firstname||""}
	get fullname(){return [this.lastname,this.firstname].filter(o=>o).join` `}
	get sortname(){return [this.lastname,this.firstname].join`|`}

	get elder(){return !!this.#data.elder}
	get servant(){return !!this.#data.servant}
	get pioneer(){return !!this.#data.pioneer}

	get group(){return +this.#data.group}
}
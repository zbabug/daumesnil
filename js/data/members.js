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
		// images
		for (let m of Member.#all) {
			let bf = builder.get("images/members/"+m.id+".jpg");
			if (bf) m.data.image = {bf,url:await bf.url()};
		}
		//
		Member.#all.forEach(m=>{
			// auto spouse
			let ms = m.spouse; if (ms) {
				let mss = ms.spouse;
				if (!mss) ms.data.spouse = m.id;
				mss = ms.spouse;
				if (mss!=m) throw new Error(`[member] id ${ms.id} invalid spouse`);
				if (ms.lastname!=m.lastname) console.warn(`[member] id ${m.id}/${ms.id} "${m.lastname}/${ms.lastname}" spouse lastname`);
			}
		});
		Member.#all.forEach(m=>{
			// spouse
			let ms = m.spouse;
			// search for spouse
			if (!ms && m.gender==1) {
				let parent = m.parent;
				let sibling = m.sibling;
				let a = Member.#all.filter(o=>o.lastname==m.lastname&&o.gender!=m.gender&&!o.spouse&&!sibling.includes(o)&&!parent.includes(o));
				a.forEach(ms=>console.info(`[member] SPOUSE id=${m.id} "${m.fullname}" => id=${ms.id} "${ms.fullname}"`))
			}
			{
				// search for family
				let parent = m.parent;
				let children = [m.children,m.spouse?.children].flat(3);
				let sibling = [m.sibling,parent.map(p=>p.children)].flat(3);
				let spouse = [m.spouse,...sibling.filter(o=>o.gender==1).map(o=>o.spouse),...parent.map(o=>o.spouse)];
				Member.#all.forEach(o=>{
					if (o==m) return;
					if (o.lastname!=m.lastname) return;
					if (sibling.includes(o) || parent.includes(o) || children.includes(o) || spouse.includes(o)) return;
					console.info(`[member] FAMILY id=${m.id} "${m.fullname}" => id=${o.id} "${o.fullname}"`)
				});
			}
		});
		//
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
	get data(){return this.#data}

	get disabled(){return !!this.#data.disabled}
	get lastname(){return this.#data.lastname||""}
	get firstname(){return this.#data.firstname||""}

	get fullname(){return [this.lastname,this.firstname].filter(o=>o).join` `}
	get revers_fullname(){return [this.firstname,this.lastname].filter(o=>o).join` `}
	get sortname(){return [this.lastname,this.firstname].join`|`}

	get elder(){return !!this.#data.elder}
	get servant(){return !!this.#data.servant}
	get pioneer(){return !!this.#data.pioneer}
	get publisher(){return this.#data.publisher!==false}
	get active(){return this.#data.active!==false}

	get position(){return this.#data.address?.position}

	get group(){return +this.#data.group}
	get newgroup(){return +this.#data.newgroup}
	get gender(){return +this.#data.gender||0}

	get image(){return this.#data.image}

	get spouse(){return Member.get(this.#data.spouse)}
	get children(){return (this.#data.children||[]).map(id=>Member.get(id))}
	get parent(){return Member.all.filter(o=>o.children.includes(this))}
	get sibling(){
		let a = [];
		this.parent.forEach(p=>p.children.forEach(m=>{
			if (!a.includes(m)) a.push(m);
		}));
		return a;
	}
}
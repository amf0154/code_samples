export class BasicList {
	private _name:string;
	last:any;
	picker:string;

	dragStart:boolean;
	dragOver:boolean;

	pick:Array<any>;
	list:Array<any>;
	sift:Array<any>;

	constructor(name:string) {
		this._name = name;
		this.last = null;
		this.picker = '';
		this.dragStart = false;
		this.dragOver = false;

		this.pick = [];
		this.list = [];
		this.sift = [];
	}

	get name() : string {
		return this._name;
	}
}
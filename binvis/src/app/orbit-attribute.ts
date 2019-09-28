
export class OrbitAttribute {
  name : string;
  value : number;
  hasRange : boolean = false;
  min : number = 0;
  max : number = 0;
  units : string = '';

  constructor(name: string,   value : number, units : string,
  	hasRange = false, min = 0,  max = 0) {
  	this.name = name;
  	this.value = value;
    this.units = units;
  	this.hasRange = hasRange;
  	this.min = min;
  	this.max = max;
  }
}
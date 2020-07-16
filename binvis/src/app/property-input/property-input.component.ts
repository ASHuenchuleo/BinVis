import { Component, OnInit, Input} from '@angular/core';
import {OrbitAttribute} from '../orbit-attribute'
import {TypeEnum} from '../type-enum';

@Component({
  selector: 'app-property-input',
  templateUrl: './property-input.component.html',
  styleUrls: ['./property-input.component.css']
})
export class PropertyInputComponent implements OnInit {

  
  omega : OrbitAttribute = new OrbitAttribute('&#969;', 86.65, '[°]', true, 0, 360); // deg
  Omega : OrbitAttribute = new OrbitAttribute('&#937;', 51.2, '[°]', true, 0, 360); // deg
  i : OrbitAttribute = new OrbitAttribute('i',  146.2, '[°]', true, -180, 180); // deg
  T : OrbitAttribute = new OrbitAttribute('T', 1990.675, '[yr]'); // yr
  P : OrbitAttribute = new OrbitAttribute('P', 0.546643, '[yr]', true, 0); // yr
  a : OrbitAttribute = new OrbitAttribute('a', 0.019, '["]', true, 0); // arcsec
  e : OrbitAttribute = new OrbitAttribute('e', 0.302, '', true, .0, 0.95);
  q : OrbitAttribute = new OrbitAttribute('q', 0.956, '', true, .0, 1.0);
  plx : OrbitAttribute = new OrbitAttribute('π', 21.31, '[mas]', true, 0); // mas
  v0 : OrbitAttribute = new OrbitAttribute('V<sub>0</sub>', -14.131, '[<sup>km</sup>&frasl;<sub>s</sub>]'); // km/s


  physicalAttributes : OrbitAttribute[] = 
  [
  	this.P,
  	this.a,
  	this.e,
  	this.q
  ];

  measuredAttributes : OrbitAttribute[]=
  [
    this.plx,
    this.v0
  ];


  visualAttributes : OrbitAttribute[] =
  [
  this.omega,
  this.Omega,
  this.i,
  this.T
  ]; 


  typeOptions = [
    {id: TypeEnum.PrimaryCentered, name: "A"},
    {id: TypeEnum.CMCentered, name: "The CM's orbit"},
    {id: TypeEnum.SecondaryCentered, name: "B's orbit"}
  ];

  @Input('systemOptions') systemOptions : any[]; // Options for the father system

  @Input('isHierarchical') isHierarchical : boolean = false;


  @Input('systemIndex') systemIndex : number = 0;


  centerIndex = {id: 0, name: 'dummy'};
  type = this.typeOptions[1];

  /*
  * Validates the input to the range specified
  */
  validateRange(evt, obj, min = -Number.MAX_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER)
  {
    if(obj.value > max)
      obj.value = max
    if(obj.value < min)
      obj.value = min
  }
  constructor() {
  }

  ngOnInit() {
  }

}

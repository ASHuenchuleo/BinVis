import { Component, OnInit } from '@angular/core';
import {OrbitAttribute} from '../orbit-attribute'

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
  P : OrbitAttribute = new OrbitAttribute('P', 0.546643, '[yr]'); // yr
  a : OrbitAttribute = new OrbitAttribute('a', 0.019, '["]'); // arcsec
  e : OrbitAttribute = new OrbitAttribute('e', 0.302, '', true, .0, 1.0);
  q : OrbitAttribute = new OrbitAttribute('q', 0.956, '', true, .0, 1.0);
  plx : OrbitAttribute = new OrbitAttribute('π', 21.31, '[mas]'); // mas
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

  constructor() { }

  ngOnInit() {
  }

}

import { Component, Input} from '@angular/core';
import {OrbitAttribute} from '../orbit-attribute'
import { ConfigService} from '../config.service';

import {ViewWindow} from '../view-window';


@Component({
  selector: 'app-prop-input',
  templateUrl: './prop-input.component.html',
  styleUrls: ['./prop-input.component.css']
})
/**
* Handles all inputs and sends a message to update the parameters and do the
* calculations, and then calls the selected views to be shown
*/
export class PropInputComponent {

  omega : OrbitAttribute = new OrbitAttribute('&#969;[°]', 60, true, 0, 360); // deg
  Omega : OrbitAttribute = new OrbitAttribute('&#937; [°]', 50.36, true, 0, 360); // deg
  i : OrbitAttribute = new OrbitAttribute('i [°]', 60, true, -180, 180); // deg
  T : OrbitAttribute = new OrbitAttribute('T [yr]', 2000); // yr
  P : OrbitAttribute = new OrbitAttribute('P [yr]', 20); // yr
  a : OrbitAttribute = new OrbitAttribute('a ["]', 0.1280); // arcsec
  e : OrbitAttribute = new OrbitAttribute('e', 0.7, true, .0, 1.0);
  q : OrbitAttribute = new OrbitAttribute('q', 0.5, true, .0, 1.0);
  plx : OrbitAttribute = new OrbitAttribute('π [mas]', 0.8); // mas
  v0 : OrbitAttribute = new OrbitAttribute('V<sub>0</sub> [<sup>km</sup>&frasl;<sub>s</sub>]', 200); // km/s

  viewOptions = [
    {id: ViewWindow.Main, name: "Primary Component "},
    {id: ViewWindow.CM, name: "Centre of Mass"},
    {id: ViewWindow.Vel, name: "Velocity Graph"}
  ];

  leftView = this.viewOptions[0];
  rightView = this.viewOptions[2];


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


  visualAttributes: OrbitAttribute[] =
  [
  this.omega,
  this.Omega,
  this.i,
  this.T
  ]; 


  constructor(private config : ConfigService) {

  }

  updateViews() {
    let attributes = this.visualAttributes.concat(this.physicalAttributes.concat(this.visualAttributes));
    this.config.updateSceneAttr(attributes, this.leftView.id, this.rightView.id);
  }

}

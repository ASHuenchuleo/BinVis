import { Component, AfterViewInit, Input} from '@angular/core';
import {OrbitAttribute} from '../orbit-attribute'
import { ConfigService} from '../config.service';



@Component({
  selector: 'app-prop-input',
  templateUrl: './prop-input.component.html',
  styleUrls: ['./prop-input.component.css']
})
export class PropInputComponent implements AfterViewInit {

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

  attributes : OrbitAttribute[] = 
  [
  	this.omega,
  	this.Omega,
  	this.i,
  	this.T,
  	this.P,
  	this.a,
  	this.e,
  	this.q,
  	this.plx,
  	this.v0
  ]; 


  constructor(private config : ConfigService) {

  }

  ngAfterViewInit() {
    this.updateViews();
  }

  updateViews() {
    this.config.updateSceneAttr(this.attributes);
  }

}

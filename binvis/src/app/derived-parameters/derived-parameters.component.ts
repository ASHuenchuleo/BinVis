import { Component } from '@angular/core';

import { PosManagerService } from './../pos-manager.service';
import { ConfigService} from './../config.service';
import {OrbitAttribute} from '../orbit-attribute'


@Component({
  selector: 'app-derived-parameters',
  templateUrl: './derived-parameters.component.html',
  styleUrls: ['./derived-parameters.component.css']
})
export class DerivedParametersComponent{

  M : OrbitAttribute = new OrbitAttribute('M<sub>p</sub>:', 0, '[M<sub>☉</sub>]'); // Mass of primary
  m : OrbitAttribute = new OrbitAttribute('m<sub>s</sub>:', 0, '[M<sub>☉</sub>]'); // Mass of secondary

  periDis : OrbitAttribute = new OrbitAttribute('Periastron:', 0, '[AU]'); // Periastrum
  apoDis : OrbitAttribute = new OrbitAttribute('Apoastron:', 0, '[AU]'); // Apoastrum

  derivedParameters : OrbitAttribute[] =
  [
  	this.M,
  	this.m,
  	this.periDis,
  	this.apoDis
  ];

  constructor(private manager : PosManagerService, private config : ConfigService){
    config.derivedParametersUpdate$.subscribe(
      () => {
        this.update();
      });
	}


  update() {	

    let [M, m] = this.manager.getStarMasses();

    this.M.value = parseFloat(M.toPrecision(3));
    this.m.value = parseFloat(m.toPrecision(3));

    let [peri, apo] = this.manager.getPeriApoMainUA();

  	this.periDis.value = Math.sqrt(Math.pow(peri[0], 2) + Math.pow(peri[1], 2) + Math.pow(peri[2], 2));
  	this.apoDis.value = Math.sqrt(Math.pow(apo[0], 2) + Math.pow(apo[1], 2) + Math.pow(apo[2], 2));

  	this.periDis.value = parseFloat(this.periDis.value.toPrecision(3));
  	this.apoDis.value = parseFloat(this.apoDis.value.toPrecision(3));
  }

}

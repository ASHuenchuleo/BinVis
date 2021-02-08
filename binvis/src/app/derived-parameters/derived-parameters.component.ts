import { Component } from '@angular/core';
import { PosManager } from './../pos-manager';
import { ConfigService} from './../config.service';
import {OrbitAttribute} from '../orbit-attribute'


@Component({
  selector: 'app-derived-parameters',
  templateUrl: './derived-parameters.component.html',
  styleUrls: ['./derived-parameters.component.css']
})
export class DerivedParametersComponent{

  derivedParametersArray : OrbitAttribute[][];

  // Managers for the orbit in analysis
  managers : PosManager[];


  constructor(public config : ConfigService){
    config.derivedParametersUpdate$.subscribe(
      () => {
        this.managers = config.managers; // Update the managers
        this.derivedParametersArray = new Array(this.managers.length);
        this.update();
      });
	}


  update() {	
    this.managers.forEach((manager, index) => {
      let M, m, peri, apo;
      [M, m] = manager.getStarMasses();

      M = parseFloat(M.toPrecision(3));
      m = parseFloat(m.toPrecision(3));

      [peri, apo] = manager.getPeriApoMainUA();

      peri = Math.sqrt(Math.pow(peri[0], 2) + Math.pow(peri[1], 2) + Math.pow(peri[2], 2));
      apo = Math.sqrt(Math.pow(apo[0], 2) + Math.pow(apo[1], 2) + Math.pow(apo[2], 2));

      peri = parseFloat(peri.toPrecision(3));
      apo = parseFloat(apo.toPrecision(3));

      this.derivedParametersArray[index] =
      [
        new OrbitAttribute('M<sub>p</sub>:', M, '[M<sub>☉</sub>]'),
        new OrbitAttribute('M<sub>s</sub>:', m, '[M<sub>☉</sub>]'),
        new OrbitAttribute('Periastron:', peri, '[AU]'),
        new OrbitAttribute('Apoastron:', apo, '[AU]')
      ];
    });
  }

}

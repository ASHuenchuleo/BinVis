import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { PosManager } from './../pos-manager';
import { ConfigService} from './../config.service';
import {VelocityRecord} from './../csv-parser';

import {TwoDView} from './../two-d-view';

const AxisEnum = {
  TIMES: 1,
  PHASE: 2
};

import Two from 'two.js';

@Component({
  selector: 'app-velocity-view-hierarchical',
  templateUrl: './velocity-view-hierarchical.component.html',
  styleUrls: ['./velocity-view-hierarchical.component.css']
})
export class VelocityViewHierarchicalComponent extends TwoDView implements AfterViewInit, OnDestroy {
  // Velocity markers
  markersArray;

  // Managers for the orbits
  managers : PosManager[];

  constructor(private config : ConfigService) {
  	super(config,  'velocity-time-hierarchical');
    this.managers = config.managers;
  }

  /**
  * Executed once the calculations are done
  */
  ngAfterViewInit() {
    this.divName = this.divName  + '-' + this.cardClass;
    this.elem = document.getElementById(this.divName);


    this.params = {
      type: Two.Types['svg'],
      width: this.width,
      height: this.height
    };

    this.two = new Two(this.params).appendTo(this.elem);





    let nSystems = this.managers.length;



    /* Animation */
  	this.two.bind('update', this.update).play();
  }

  moveFrames(frames : number) : void
  {
  	this.managers.forEach((manager, i)=>
  	{	
  		this.index = (this.index + frames) % this.Xaxis.length;
  		if(this.index < 0)
  		  this.index = this.Xaxis.length + this.index;

  		let vel = this.velsPrimary[this.index];

  		let time = this.Xaxis[this.index];
  		this.markersArray[i].translation.set(time, vel);
  	});

  }


}

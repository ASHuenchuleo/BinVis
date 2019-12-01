import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { PosManagerService } from './../pos-manager.service';
import { ConfigService} from './../config.service';
import {VelocityRecord} from './../csv-parser';

import {TwoDView} from './../two-d-view';

const AxisEnum = {
  TIMES: 1,
  PHASE: 2
};

import Two from 'two.js';

@Component({
  selector: 'app-velocity-view',
  templateUrl: './velocity-view.component.html',
  styleUrls: ['./velocity-view.component.css']
})
export class VelocityViewComponent extends TwoDView implements AfterViewInit, OnDestroy{

  /* Primary and secondary velocity markers */
  primaryCurrent;
  secondaryCurrent;

  constructor(private manager : PosManagerService,
              private config : ConfigService) {
    super(manager, config,  'velocity-time');
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

    this.manager.buildCMRadialVelocities();
  	this.velsPrimary = this.manager.getPrimaryCMVelocities(this.nT);
    this.velsSecondary = this.manager.getSecondaryCMVelocities(this.nT);

    this.parametrization = AxisEnum.PHASE;
    if(this.parametrization == AxisEnum.TIMES)
    {
      this.Xaxis = this.manager.getTimes(this.nT);
      this.xLabel = 'T[yr]';
    }
    else if(this.parametrization == AxisEnum.PHASE)
    {
      this.Xaxis = this.manager.getPhases(this.nT);
      this.xLabel = 'Phase';
    }

    /** Scaling */
    this.buildScaling();

    let velocityScaling = (v) => {
      return -this.scaleY * (v - this.minVel) + this.finalYpixel;};
    this.velsPrimary = this.velsPrimary.map(velocityScaling);
    this.velsSecondary = this.velsSecondary.map(velocityScaling);

    let xAxisScaling = (t)=> {return this.scaleX * (t - this.initXval) + this.initXpixel;};
    this.Xaxis = this.Xaxis.map(xAxisScaling);
    
    /** Axis */
    let fontsize = 11;
    this.drawAxis(10, this.nT,
      this.xLabel, 'V [km/s]',
      this.initXpixel, this.finalXpixel,
      this.initYpixel, this.finalYpixel,
      this.scaleX, this.scaleY,
      this.initXval, this.finalXval,
      this.minVel, this.maxVel,
      fontsize, this.two);

    /** Drawing graphs */
    this.primaryCurrent = this.makeVelocityCurve(
      this.width, this.height, this.Xaxis, this.velsPrimary, this.two, 'blue');
    this.secondaryCurrent = this.makeVelocityCurve(
      this.width, this.height, this.Xaxis, this.velsSecondary, this.two, 'orange');

    this.drawCMVelLine(this.manager.getCMVel(),
      this.initXpixel, this.finalXpixel,
      this.initYpixel, this.finalYpixel,
      this.scaleX, this.scaleY,
      this.initXval, this.finalXval,
      this.minVel, this.maxVel,
      fontsize, this.two);

    /* Animation */
  	this.two.bind('update', this.update).play();
  }

  /**
  * Draws the loaded records into the canvas as points.
  * @param {VelocityRecord[]} An array of velocity records
  * with the information ready to be displayed.
  */
  drawData(records : VelocityRecord[]){     

    let xAxisScaling = (t)=> {
      return this.scaleX * (t - this.initXval) + this.initXpixel;};
    let velocityScaling = (v) => {
      return -this.scaleY * (v - this.minVel) + this.finalYpixel;};


    for(let i = 0; i < this.nT; i++)
    {
      for(let record of records){
        let xVal = record.epoch;

        switch(this.config.dataInputSettings.dateVelocity) // convert to julian years
        {
          case 0: // julian days is -2,400,000.0
            xVal = 2000 + (xVal - 51545) / 365.25;
            break;
          case 1:
            break;
          case 2:
            xVal = (xVal - 1900) * 365.242198781 +  15020.31352;
            xVal = 2000 + (xVal - 51545) / 365.25;
            break;

        }

        if(this.parametrization == AxisEnum.PHASE)// Convert to phase
        {
          xVal = this.manager.toPhase(xVal)
          xVal = xAxisScaling(xVal + i);
        }

        let yVal = record.vel; // in km/s
        yVal = velocityScaling(yVal);

        var marker = this.two.makeCircle(xVal, yVal, 2);

        if(record.comp == 'Va') marker.stroke = 'blue';
        if(record.comp == 'Vb') marker.stroke = 'orange';

        this.update(0);
        console.log(document.querySelector('#two-107'));

        break;

        var handler = (e) => {marker.fill = 'black';};
        console.log('#' + marker.id);
        marker.domElement = document.querySelector('#' + marker.id);
        marker.domElement.addEventListener('click', handler, false);
        marker.domElement.style.cursor = 'pointer';
      }
    }


  }


  moveFrames(frames : number) : void
  {
    this.index = (this.index + frames) % this.Xaxis.length;
    if(this.index < 0)
      this.index = this.Xaxis.length + this.index;

    let velPrim = this.velsPrimary[this.index];
    let velSec = this.velsSecondary[this.index];

    let time = this.Xaxis[this.index];


    this.primaryCurrent.translation.set(time, velPrim);
    this.secondaryCurrent.translation.set(time, velSec);
  }



}

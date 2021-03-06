import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { PosManager } from './../pos-manager';
import { ConfigService} from './../config.service';
import {VelocityRecord} from './../csv-parser';

import {TwoDView} from './../two-d-view';
import {repeat} from './../utils'

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


  // Manager for the orbit in the view
  manager : PosManager;

  constructor(private config : ConfigService) {
    super(config,  'velocity-time');
    this.manager = config.managers[0];
    this.manager.initTimes(this.manager.T, this.manager.T + this.nT * this.manager.P);


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

    let xUnits = this.config.scalingSettings['velocityScale'].name;
    let CMVel = this.manager.getCMVel();
    // Get the paths and the graph path
    this.velsPrimaryPath = this.manager.getPrimaryCMVelocities(this.manager.pathTimes);
    this.velsSecondaryPath = this.manager.getSecondaryCMVelocities(this.manager.pathTimes);

  	this.velsPrimary = this.manager.getPrimaryCMVelocities();
    this.velsSecondary = this.manager.getSecondaryCMVelocities();

    if(xUnits == 'm/s')
    {
      CMVel = 1000 * CMVel;
      this.velsPrimary = this.velsPrimary.map((x) => 1000*x);
      this.velsSecondary = this.velsSecondary.map((x) => 1000*x);

      this.velsPrimaryPath = this.velsPrimaryPath.map((x) => 1000*x);
      this.velsSecondaryPath = this.velsSecondaryPath.map((x) => 1000*x);
    }

    let XaxisPath = this.manager.pathTimes;
    this.Xaxis = this.manager.getTimes();

    this.parametrization = AxisEnum.PHASE;
    if(this.parametrization == AxisEnum.TIMES)
    {
      this.xLabel = 'T[yr]';
    }
    else if(this.parametrization == AxisEnum.PHASE)
    {
      this.Xaxis = this.manager.getPhases(this.Xaxis);
      XaxisPath = this.manager.getPhases(XaxisPath);
      this.xLabel = 'Phase';
    }

    /** Scaling */
    // For the animation
    this.buildScaling(this.velsPrimary, this.velsSecondary, this.Xaxis);

    let velocityScaling = (v) => {
      return -this.scaleY * (v - this.minVel) + this.finalYpixel;};
    let xAxisScaling = (t)=> {return this.scaleX * (t - this.initXval) + this.initXpixel;};

    this.velsPrimary = this.velsPrimary.map(velocityScaling);
    this.velsSecondary = this.velsSecondary.map(velocityScaling);

    this.Xaxis = this.Xaxis.map(xAxisScaling);

    // For the path
    this.buildScaling(this.velsPrimaryPath, this.velsSecondaryPath, XaxisPath);

    velocityScaling = (v) => {
      return -this.scaleY * (v - this.minVel) + this.finalYpixel;};
    xAxisScaling = (t)=> {return this.scaleX * (t - this.initXval) + this.initXpixel;};

    this.velsPrimaryPath = this.velsPrimaryPath.map(velocityScaling);
    this.velsSecondaryPath = this.velsSecondaryPath.map(velocityScaling);

    XaxisPath = XaxisPath.map(xAxisScaling);

    /** Axis */
    let fontsize = 11;
    this.yLabel = 'V ' + xUnits;
    this.drawAxis(10, fontsize);

    /** Drawing graphs */
    let primarySize = this.config.starViewSettings['primarySize'];
    let secondarySize = primarySize * this.config.starViewSettings['starScalingFun'](this.manager.getMassRatio());
    
    this.primaryCurrent = this.makeVelocityCurve(
      primarySize, XaxisPath, this.velsPrimaryPath, this.two, 'blue');
    this.secondaryCurrent = this.makeVelocityCurve(
      secondarySize, XaxisPath, this.velsSecondaryPath, this.two, 'orange');


    this.drawCMVelLine(CMVel, 'VCM = ' + CMVel + ' ' +
      xUnits, fontsize);

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
        let epoch = xVal;
        let phase = this.manager.toPhase(xVal);

        if(this.parametrization == AxisEnum.PHASE)// Convert to phase
          xVal = xAxisScaling(phase + i);

        let yVal = record.vel; // in km/s
        let vel = yVal;
        yVal = velocityScaling(yVal);

        let marker = this.two.makeCircle(xVal, yVal, 2);

        let component = record.comp;
        let markerColor = 'black';
        if(component == 'Va' || component == 'a') markerColor = this.dataColor1;
        if(component == 'Vb' || component == 'b') markerColor = this.dataColor2;
        marker.stroke = markerColor;

        this.two.update(0);

        let clickHandler = (e) => { 
          this.selectedData = 
          {
            'Component' : component,
            'Phase' : String(this.toFixed(phase, 3)),
            'Epoch' : String(this.toFixed(+epoch, 6)),
            'Velocity' : String(this.toFixed(+vel, 3))
          }
          let infocard =  <HTMLElement>document.querySelector('#selected-info-' + this.cardClass);
          infocard.style.display = "block";

          // Deselect previous
          if(this.selectedObj)
            this.selectedObj.noFill();

          // Select current
          this.selectedObj = marker;
          this.selectedObj.fill = markerColor;

        };

        marker.domElement = document.querySelector('#' + marker.id);
        marker.domElement.addEventListener('click', clickHandler, false);
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

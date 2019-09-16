import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { PosManagerService } from './../pos-manager.service';
import { VelocityManagerService } from './../velocity-manager.service';


import Two from 'two.js';

let AxisEnum = {
  TIMES: 1,
  PHASE: 2
};

@Component({
  selector: 'app-velocity-view',
  templateUrl: './velocity-view.component.html',
  styleUrls: ['./velocity-view.component.css']
})
export class VelocityViewComponent implements AfterViewInit, OnDestroy{
  /** Speed factor of the orbit */
  private speed : number = 5.0;
  /** Current index of the animation */
  private index : number = 0;
  /** Numero de periodos en el gráfico */
  private nT : number = 3;


  private width : number = 600;
  private height : number = 400;


  /** Portion of the canvas used for graph */
  private portionX : number = 0.7;
  private portionY : number = 0.8;
  /* Starting x pixel for graph */
  private initX : number = this.width * (1 - this.portionX) / 2;;
  /* Final x pixel for graph */
  private finalX : number = this.width * (1 + this.portionX) / 2;
  /* Starting y pixel for graph */
  private initY : number = this.height * (1 - this.portionY) / 2;;
  /* Final y pixel for graph */
  private finalY : number = this.height * (1 + this.portionY) / 2;

  /** Scale of the vertical axis */
  private scaleY : number;
  /** Scale of the horizontal axis */
  private scaleX : number;

  /** Velocities of primary and secondary */
  private velsPrimary : number[];
  private velsSecondary : number[];

  /** Values for the x axis */
  private Xaxis : number[];
  private initialXaxis : number;
  private finalXaxis : number;

  /** Extremes for the velocity */
  private minVel : number;
  private maxVel : number;

  /** Parametrization */
  private parametrization = AxisEnum.PHASE;

  /** Two.js scene */
  private two : Two;

  private elem;
  private params;



  constructor(private manager : PosManagerService,
    private graphDrawer : VelocityManagerService) {

  }
  
  /**
  * Executed once the calculations are done
  */
  ngAfterViewInit() {

    this.elem = document.getElementById('velocity-time');
    this.params = { width: this.width, height: this.height };
    this.two = new Two(this.params).appendTo(this.elem);

    this.manager.buildCMRadialVelocities();
  	this.velsPrimary = this.manager.getPrimaryCMVelocities(this.nT);
    this.velsSecondary = this.manager.getSecondaryCMVelocities(this.nT);

    if(this.parametrization == AxisEnum.TIMES)
    {
      this.Xaxis = this.manager.getTimes(this.nT);
      var xLabel = 'T[yr]';
    }
    else if(this.parametrization == AxisEnum.PHASE)
    {
      this.Xaxis = this.manager.getPhases(this.nT);
      var xLabel = 'Phase';
    }

    /** Scaling */
    this.buildScaling();

    let velocityScaling = (v) => {
      return -this.scaleY * (v - this.minVel) + this.finalY;};
    this.velsPrimary = this.velsPrimary.map(velocityScaling);
    this.velsSecondary = this.velsSecondary.map(velocityScaling);

    let xAxisScaling = (t)=> {return this.scaleX * (t - this.initialXaxis) + this.initX;};
    this.Xaxis = this.Xaxis.map(xAxisScaling);
    
    /** Axis */
    let fontsize = 11;
    this.graphDrawer.drawAxis(10, this.nT,
      xLabel, 'V [km/s]',
      this.initX, this.finalX,
      this.initY, this.finalY,
      this.scaleX, this.scaleY,
      this.initialXaxis, this.finalXaxis,
      this.minVel, this.maxVel,
      fontsize, this.two);

    /** Drawing graphs */
    let primaryCurrent = this.graphDrawer.makeVelocityCurve(
      this.width, this.height, this.Xaxis, this.velsPrimary, this.two, 'orange');
    let secondaryCurrent = this.graphDrawer.makeVelocityCurve(
      this.width, this.height, this.Xaxis, this.velsSecondary, this.two, 'blue');

    this.graphDrawer.drawCMVelLine(this.manager.getCMVel(),
      this.initX, this.finalX,
      this.initY, this.finalY,
      this.scaleX, this.scaleY,
      this.initialXaxis, this.finalXaxis,
      this.minVel, this.maxVel,
      fontsize, this.two);

    /* Animation */
  	this.two.bind('update', (frameCount) => {
  	  let velPrim = this.velsPrimary[this.index];
      let velSec = this.velsSecondary[this.index];

  	  let time = this.Xaxis[this.index];

  	  this.index = (this.index + this.speed) % this.Xaxis.length;

  	  primaryCurrent.translation.set(time, velPrim);
      secondaryCurrent.translation.set(time, velSec)
  	}).play();
  }
  

  /** Sets up the scaling for both axis, given the values */
  buildScaling() : void
  {
    this.maxVel =  Math.max(...this.velsPrimary, ...this.velsSecondary);
    this.minVel =  Math.min(...this.velsPrimary, ...this.velsSecondary);

    let sizeY = this.finalY - this.initY;
    this.scaleY =  sizeY / (this.maxVel - this.minVel);


    this.finalXaxis = this.Xaxis[this.Xaxis.length - 1];
    this.initialXaxis = this.Xaxis[0];

    let sizeX = this.finalX - this.initX;
    this.scaleX =  sizeX / (this.finalXaxis -  this.initialXaxis);
  }

  ngOnDestroy() : void
  {
    this.two.clear();
  }


}

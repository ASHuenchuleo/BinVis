import { Injectable } from '@angular/core';
import { KeplerSolverService } from './kepler-solver.service';
import { ConfigService} from './config.service';
import {OrbitAttribute} from './orbit-attribute'


@Injectable({
  providedIn: 'root'
})
/**Handles and stores all calculations, ready to be fetched by view components. */
export class PosManagerService {
  /** Initial time for the orbit */
  initT : number;
  /** Number of steps for orbit*/
  step : number = 500;
  /** Times for the orbit, in years */
  times : number[];
  /** Timestep for the orbit */
  timeStep : number;

  /** Trayectory for projection orbit */
  projectionPath : number[][];
  /** Trayectories relative to the centre of masss */
  primaryPath : number[][];
  secondaryPath : number[][];

  /** Values for the radial velocity */
  radialVelocities : number[];

  /** Values for primary radial velocities */
  primaryCMVelocities : number[];
  /** Values for the secondary radial velocites */
  secondaryCMVelocities : number[];

  attributes : OrbitAttribute[];

  constructor(private solver : KeplerSolverService, private config : ConfigService){
    config.posManagerUpdate$.subscribe(
      attributes => {
        this.attributes = attributes;
        this.init();
      });
  }

  /**
  * Initializes the service for given orbit
  */
  init() : void
  {
    let omega : number = this.attributes[0].value;
    let Omega : number = this.attributes[1].value;
    let i : number = this.attributes[2].value;
    let T : number = this.attributes[3].value;
    let P : number = this.attributes[4].value;
    let a : number = this.attributes[5].value;
    let e : number = this.attributes[6].value;
    let q : number = this.attributes[7].value;
    let plx : number = this.attributes[8].value;
    let v0 : number = this.attributes[9].value;
    let fact = Math.PI/180;
    

  	this.solver.init(omega * fact, Omega * fact, i * fact, T, P, a, e, q, plx, v0);
  	this.timeStep = P / this.step;

  	this.times = [];
    this.initT = T;
  	let currentTime = this.initT;
  	for(var j = 0; j < this.step; j++)
  	{
  		this.times.push(currentTime);
  		currentTime += this.timeStep;
    }
    this.solver.solveEVals(this.times);


  }
  /**
  * Returns the velocity of the centre of mass
  */
  getCMVel(){
    return this.solver.getCMVel();
  }



  /*
  * Returns an array with the mass of each star in an array [primary, secondary],
  * in solar masses
  */
  getStarMasses()
  {
    return this.solver.getStarMasses();
  }


  /**
  * Returns the mass ratio of the stars
  */
  getMassRatio(){
    return this.solver.getMassRatio();
  }

  /**
  * Returns the ascending and descending nodes in the main view
  */
  getNodesMain(){
    return this.solver.getNodesMain();
  }

  /**
  * Returns the periastrum and the periastrum in the main view, in arcseconds
  */
  getPeriApoMain(){
    return this.solver.getPeriApoMain();
  }

  /**
  * Returns the periastrum and the periastrum in the main view, in UA
  */
  getPeriApoMainUA()
  {
    return this.solver.getPeriApoMainUA();
  }


  /**
  * Returns the path for the projection orbit
  */
  getProjectionPath() : number[][]
  {

  	return this.projectionPath;
  }

  /**
  * Returns the path for the primary relative to the centre of mass
  */
  getPrimaryPath() : number[][]
  {

    return this.primaryPath;
  }

  /**
  * Returns the path for the secondary relative to the centre of mass
  */
  getSecondaryPath() : number[][]
  {

    return this.secondaryPath;
  }


  /**
  * Returns the values for the time steps
  * @param {number} nT The number of periods to be returned
  * @return {number[]} array of values of time, in years
  */
  getTimes(nT : number = 1) : number[]
  {
    this.times = [];
    let currentTime = this.initT;
    for(var i = 0; i < this.step * nT; i++)
    {
      this.times.push(currentTime);
      currentTime += this.timeStep;
    }
  	return this.times;
  }

  /**
  * Returns the values for the time steps
  * @param {number} nT The number of periods to be returned
  * @return {number[]} array of values of the phase, in years
  */
  getPhases(nT : number = 1) : number[]
  {
    let phases = [];
    let currentPhase = 0;
    for(var i = 0; i < this.step * nT; i++)
    {
      phases.push(currentPhase);
      currentPhase += 1 / this.step;
    }
    return phases;
  }

  /**
  * Returns the values for the radial velocity of the secondary 
  * relative to the primary's radial velocity
  * @param {number} nT The number of periods to be returned
  * @return {number[]} array of values for the radial velocity, in km/s
  */
  getRadialVelocities(nT : number = 1) : number[]
  {
  	return this.buildPeriodic(this.radialVelocities, nT);
  }

  /**
  * Returns the primary's radial velocity array relative to the observer
  * @param {number} nT The number of periods to be returned
  */
  getPrimaryCMVelocities(nT : number = 1) : number[]
  {
    return this.buildPeriodic(this.primaryCMVelocities, nT);
  }

  /**
  * Returns the secondary's radial velocity array relative to the observer
  * @param {number} nT The number of periods to be returned
  */
  getSecondaryCMVelocities(nT : number = 1) : number[]
  {
    return this.buildPeriodic(this.secondaryCMVelocities, nT); 
  }

  /**
  * Builds the projection path and readies it to be fetched
  */
  buildProjectionPath() : void {
  	this.projectionPath = [];
    let xarray = [];
    let yarray = [];
    let zarray = [];
  	for(var i = 0; i < this.step; i++)
  	{
      let sol = this.solver.apparentPosition(i);
      xarray.push(sol[0])
      yarray.push(sol[1])
      zarray.push(sol[2])
  	}
    this.projectionPath.push(xarray);
    this.projectionPath.push(yarray);
    this.projectionPath.push(zarray);

  }

  /**
  * Builds the primary's path relative to the centre of mass
  * and readies it to be fetched
  */
  buildPrimaryPath() : void {
    this.primaryPath = [];
    let xarray = [];
    let yarray = [];
    let zarray = [];
    for(var i = 0; i < this.step; i++)
    {
      let sol = this.solver.primaryPosition(i);
      xarray.push(sol[0])
      yarray.push(sol[1])
      zarray.push(sol[2])
    }
    this.primaryPath.push(xarray);
    this.primaryPath.push(yarray);
    this.primaryPath.push(zarray);

  }

  /**
  * Builds the secondary's path relative to the centre of mass
  * and readies it to be fetched
  */
  buildSecondaryPath() : void {
    this.secondaryPath = [];
    let xarray = [];
    let yarray = [];
    let zarray = [];
    for(var i = 0; i < this.step; i++)
    {
      let sol = this.solver.secondaryPosition(i);
      xarray.push(sol[0])
      yarray.push(sol[1])
      zarray.push(sol[2])
    }
    this.secondaryPath.push(xarray);
    this.secondaryPath.push(yarray);
    this.secondaryPath.push(zarray);

  }

  /**
  * Builds the radial velocity curve of the secondary relative to
  * the primary
  */
  buildRadialVelocities() : void {
  	this.radialVelocities = [];

  	for(var i = 0; i < this.step; i++)
  	{
      this.radialVelocities.push(this.solver.radialVelocity(i));
  	}
  }

  /**
  * Builds the radial velocity for the primary and secondary respect to the CM
  */
  buildCMRadialVelocities() : void{
    this.primaryCMVelocities = [];
    this.secondaryCMVelocities = [];

    for(var i = 0; i < this.step; i++)
    {
      this.primaryCMVelocities.push(this.solver.primaryCMVelocity(i));
      this.secondaryCMVelocities.push(this.solver.secondaryCMVelocity(i));
    }
  }

  /**
  * Builds the periodic array for nT number of periods
  * @param {number[]} array The array to be repeated
  * @param {number} nT Number of this.times of repetition
  * @param {number[]} Array repeated nT this.times
  */
  buildPeriodic(array, nT)
  {
    return [].concat.apply([], Array(nT).fill(array));
  }

}


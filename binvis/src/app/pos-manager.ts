import { ConfigService} from './config.service';
import {OrbitAttribute} from './orbit-attribute'
import {TypeEnum} from './type-enum';

import { throwError } from 'rxjs'; 

const kmUA = 1.496 * Math.pow(10, 8); // kilometers in an UA
const secYr = 3.15 * Math.pow(10, 7); // Number of seconds in year
const UApc = 206265; // Number of UA in a parsec
let Gtemp = 4.3 * Math.pow(10, -3) ; // pc / Ms * (km/s)^2
const G = Gtemp * Math.pow(secYr, 2) / Math.pow(kmUA, 2) * UApc;  // UA * (UA/yr)^2/ Ms



/**Handles and stores all calculations, ready to be fetched by view components. */
export class PosManager {


  /** Initial time for the orbit */
  initT : number;

  /** Times for the orbit, in years */
  animationTimes : number[];
  pathTimes : number[];

  /** Number of steps for orbit*/
  steps : number = 3000;
  animationSteps : number;

  /** How many years does a single step last */
  timeStep : number;
  animationTimeStep : number;




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


  omega : number; // rad
  Omega : number; // rad
  i : number; // rad
  T : number; // yr
  P : number; // yr
  a : number; // ''
  e : number; 
  q : number;
  plx : number; // mas


  A : number;
  B : number;
  F : number;
  G : number;

  C : number;
  H : number;

  Kp;
  Ks;

  /**
  * Velocity of centre of mass
  */
  v0 : number;
  /**
  * Semi amplitude of the radial velocity curve, in km/s
  */
  Kl : number;

  /**
  * The manager for the system this system is currently orbiting
  */
  fatherManager : PosManager;
  /**
  * The type of orbit, either orbiting A, the CM or B
  */
  type : TypeEnum;


  arcsecToAU = (x) => {
    let plxArcSec = this.plx / 1000;

    return x / plxArcSec; // x was in arcsec
  }

  framerate;
  realSecondsPerSimYear;

  /**
  * Initializator for the manager class.
  * @param {OrbitAttribute[]} attributes Attributes for the orbit to be managed
  */
  constructor(attributes : OrbitAttribute[], realSecondsPerSimYear : number, framerate : number){

    let omega : number = attributes[0].value;
    let Omega : number = attributes[1].value;
    let i : number = attributes[2].value;
    let T : number = attributes[3].value;
    let P : number = attributes[4].value;
    let a : number = attributes[5].value;
    let e : number = attributes[6].value;
    let q : number = attributes[7].value;
    let plx : number = attributes[8].value;
    let v0 : number = attributes[9].value;
    let fact = Math.PI/180;
    this.omega = omega * fact; // Convert to rad
    this.Omega = Omega * fact; // Convert to rad
    this.i = i * fact; // Convert to rad
    this.T = T;
    this.P = P;
    this.a = a;
    this.e = e;
    this.q = q;
    this.plx = plx;
    this.v0 = v0;

    this.findConstants();

    this.framerate = framerate;
    this.realSecondsPerSimYear = realSecondsPerSimYear;
   
  }

  /**
  * Precalculates the values 
  */
  initTimes(initT = this.T, finalT = this.T  + this.P)
  {

    this.animationSteps = +Math.round(((finalT - initT) / this.realSecondsPerSimYear) * this.framerate);


    // Inits the times
    this.animationTimeStep = (finalT - initT) / this.animationSteps;
    this.initT = initT;

    this.animationTimes = [];
    let currentTime = this.initT;
    for(var j = 0; j < this.animationSteps; j++)
    {
      this.animationTimes.push(currentTime);
      currentTime += this.animationTimeStep;
    }

    this.pathTimes = [];
    this.timeStep = (finalT - initT) / this.steps;
    currentTime = this.initT;
    for(var j = 0; j < this.steps; j++)
    {
      this.pathTimes.push(currentTime);
      currentTime += this.timeStep;
    }
  }



  /**
  * Calculates the Thiele-Innes constants, and other neccesary constants for calculation.
  */
  findConstants() : void{
    
    var cosom = Math.cos(this.omega);
    var cosOm = Math.cos(this.Omega);

    var sinom = Math.sin(this.omega);
    var sinOm = Math.sin(this.Omega);

    var cosi = Math.cos(this.i);
    var sini = Math.sin(this.i);

    this.A = this.a * (cosom * cosOm - sinom * sinOm * cosi);
    this.B = this.a * (cosom * sinOm + sinom * cosOm * cosi);
    this.F = this.a * (-sinom * cosOm - cosom * sinOm * cosi);
    this.G = this.a * (-sinom * sinOm + cosom * cosOm * cosi);

    this.C = this.a * sinom * sini;
    this.H = this.a * cosom * sini;

    let scale_fact =   kmUA / secYr; // UA/yr to km/s
    let a_p = 1000 * this.a / this.plx * this.q / (1 + this.q); // converted plx from mas to as
    let a_s = 1000 * this.a / this.plx * 1 / (1 + this.q);
    let fact = 2 * Math.PI * sini / (this.P * Math.sqrt(1 - Math.pow(this.e, 2)));
    this.Kp =  scale_fact * a_p * fact;
    this.Ks = scale_fact * a_s * fact;
  }

  solveEFromTime(tau : number) : number
  {
    const kepler = (E) => {
      return 2 * Math.PI * (tau - this.T) / this.P - (E - this.e * Math.sin(E));
    };
    let E0;
    if(this.e < 0.8){
      E0 = 2 * Math.PI * (tau - this.T) / this.P
    }
    else{
      E0 = Math.PI;
    }
    var Esol = this.newtonRaphson(E0, 0.01, 100, 0.001, kepler);
    return Esol;
  }

  /**
  * Calculates the position of the secondary in the main view
  * given the value of the true anomaly. In arcseconds.
  */

  apparentPositionFromTrueAnomaly(nu : number){


      /* Since atan only returns from -pi/2 to pi/2
      * we must make adjustments
      */
      while(nu < -Math.PI){
        nu =  nu + 2 * Math.PI;
      }
      while(nu > Math.PI){
        nu = nu - 2 * Math.PI;
      }

      const trueAnomalyRelation = (E) => {
        return 2  * Math.atan(
      Math.sqrt((1 + this.e) / (1 - this.e)) * Math.tan(E/2)) - nu;
      };

      var Esol = this.newtonRaphson(nu, 0.01, 100, 0.01, trueAnomalyRelation);
      return this.getPositionFromE(Esol);
  }

  /**
  * Calculates the apparent position of the secondary given a certain index,
  * relative to the primary
  * @return {number[number[]]} Array with triads (x, y, z)
  */
  apparentPosition(time  : number)
  {
    let Esol = this.solveEFromTime(time);
    return this.getPositionFromE(Esol);
  }

  /**
  * Returns the position of the secondary star relative to the primary
  * given a date in julian years
  * @param {number} tau Time in julian years
  */
  secondaryPositionFromTime(tau : number) : number[]
  {
    return this.getPositionFromE(this.solveEFromTime(tau));
  }

  /**
  * Returns the position of the primary star relative to the secondary
  * given a date in julian years
  * @param {number} tau Time in julian years
  */
  primaryPositionFromTime(tau : number) : number[]
  {
    let fact = - this.q / (1 + this.q);
    return this.getPositionFromE(this.solveEFromTime(tau)).map((x) => {return x * fact});
  }


  /**
  * Calculates the radial velocity for a given instant of time in km/s
  * @param {number} time Time, interpreted in the same units as the period
  * @return {number} The radial velocity in km/s;
  */
  radialVelocity(time : number) : number
  {
    let Esol = this.solveEFromTime(time);;

    var trueAnomaly = 2 * Math.atan(
      Math.sqrt((1 + this.e) / (1 - this.e)) * Math.tan(Esol/2));

    let rvel = this.v0 + this.Kl * (Math.cos(this.omega + trueAnomaly) +
                this.e * Math.cos(this.omega));
    return rvel

  }

  /**
  * Calculates the primary's radial velocity relative to the observer in km/s
  * @param {number} time Time, interpreted in the same units as the period
  * @return {number} The radial velocity in km/s
  */
  primaryCMVelocity(time : number) : number
  {
    let Esol = this.solveEFromTime(time);

    var trueAnomaly = 2 * Math.atan(
      Math.sqrt((1 + this.e) / (1 - this.e)) * Math.tan(Esol/2));

    let rvel = this.v0 + this.Kp * (Math.cos(this.omega + trueAnomaly) +
                this.e * Math.cos(this.omega));
    return rvel
  }

  /**
  * Calculates the secondary's radial velocity relative to the observer in km/s
  * @param {number} time Time, interpreted in the same units as the period
  * @return {number} The radial velocity in km/s
  */
  secondaryCMVelocity(time : number) : number
  {
    let Esol = this.solveEFromTime(time);

    let trueAnomaly = 2 * Math.atan(
      Math.sqrt((1 + this.e) / (1 - this.e)) * Math.tan(Esol/2));

    // The formula is inverted since the velocity must be a maximum for trueanomaly=-omega
    let rvel = this.v0 - this.Ks * (Math.cos(this.omega + trueAnomaly) +
                this.e * Math.cos(this.omega));
    return rvel
  }

  newtonRaphson(guess, increment, iteration, eps, f) : number
  {
    let rootFound = false;

    for (let i = 0; i < iteration + 1; i++) {
        let fPrime = (f(guess + increment / 2) - f(guess - increment / 2)) / increment;
        guess += -f(guess) / fPrime;
        if (Math.abs(f(guess)) <= eps) {
            rootFound = true;
            break;
        }
    }
    
    if (rootFound) {
        return guess;
    } else {
      var e = new Error("Can't calculate position!");
      e.name = "NumericalError";
      throw(e);
    }
  }


  /*
  * Returns the ascending and descening nodes of the orbit, in the main view
  */
  getNodesMain()
  {
    let ascending = this.apparentPositionFromTrueAnomaly(-this.omega);
    let descending = this.apparentPositionFromTrueAnomaly(-this.omega + Math.PI);
    return [ascending, descending];
  }

  /**
  * Returns the periastron and the periastron in the main view, in arcseconds
  */
  getPeriApoMain()
  {
    let peri = this.apparentPositionFromTrueAnomaly(0);
    let apo = this.apparentPositionFromTrueAnomaly(Math.PI);
    return [peri, apo];
  }

    /**
  * Returns the periastrum and the periastrum in the main view, in UA
  */
  getPeriApoMainUA()
  {

    let peri = this.apparentPositionFromTrueAnomaly(0).map(this.arcsecToAU);
    let apo = this.apparentPositionFromTrueAnomaly(Math.PI).map(this.arcsecToAU);
    return [peri, apo];
  }
  /**
  * @return The mass ratio of the system
  */
  getMassRatio()
  {
    return this.q;
  }
  /*
  * Returns an array with the mass of each star in an array [primary, secondary],
  * in solar masses
  */
  getStarMasses()
  {
    let M = Math.pow(1000 * this.a/this.plx, 3) / (G * Math.pow(this.P/(2 * Math.PI), 2)) / (1 + this.q);
    let m = M * this.q;
    return [M, m];
  }

  /*
  * Returns the velocity of the centre of mass
  */
  getCMVel(){
    return this.v0;
  }
  /**
  * Returns the secondary position relative to the primary given the value for E
  */
  getPositionFromE(E : number){
    var x = Math.cos(E) - this.e;
    var y = Math.sqrt(1-Math.pow(this.e, 2)) * Math.sin(E);

    var X = this.B * x + this.G * y;
    var Y = this.A * x + this.F * y;
    var Z = this.C * x + this.H * y;

    var position = [-X, Y, -Z]; // The x coord is inverted
    return position;
  }

  /**
  * Returns the path for the secondary orbit relative to the primary given the time array,
  *  or the manager times if not given.
  * @param {number[]} timeArray The optional array of times for the path generation
  */
  getProjectionPath(timeArray : number[] = undefined) : number[][]
  {
    timeArray = timeArray || this.animationTimes;
    this.projectionPath = [];
    let xarray = [];
    let yarray = [];
    let zarray = [];
    timeArray.forEach((t) =>
    {
      let sol = this.getPositionFromE(this.solveEFromTime(t));
      xarray.push(sol[0])
      yarray.push(sol[1])
      zarray.push(sol[2])
    });
    this.projectionPath.push(xarray);
    this.projectionPath.push(yarray);
    this.projectionPath.push(zarray);


    return this.projectionPath;
  }

  /**
  * Returns the path for the primary relative to the centre of mass for the given times, or the manager times if
  * not given.
  * @param {number[]} timeArray The optional array of times for the path generation.
  */
  getPrimaryPath(timeArray : number[] = undefined) : number[][]
  {
    timeArray = timeArray || this.animationTimes;
    this.primaryPath = [];
    let xarray = [];
    let yarray = [];
    let zarray = [];
    timeArray.forEach((t) =>
    {
      let sol = this.primaryPositionFromTime(t);
      xarray.push(sol[0])
      yarray.push(sol[1])
      zarray.push(sol[2])
    });
    this.primaryPath.push(xarray);
    this.primaryPath.push(yarray);
    this.primaryPath.push(zarray);
    return this.primaryPath;
  }

  /**
  * Returns the path for the secondary relative to the centre of mass  
  */
  getSecondaryPath(timeArray : number[] = undefined) : number[][]
  {
    timeArray = timeArray || this.animationTimes;
    this.secondaryPath = [];
    let xarray = [];
    let yarray = [];
    let zarray = [];
    timeArray.forEach((t) =>
    {
      let sol = this.secondaryPositionFromTime(t);
      xarray.push(sol[0])
      yarray.push(sol[1])
      zarray.push(sol[2])
    });
    this.secondaryPath.push(xarray);
    this.secondaryPath.push(yarray);
    this.secondaryPath.push(zarray);
    return this.secondaryPath;
  }


  /**
  * Returns the values for the time steps
  * @return {number[]} array of values of time, in years
  */
  getTimes() : number[]
  {
    return this.animationTimes;
  }

  /**
  * Returns the values for the phase steps
  * @return {number[]} array of values of the phase, between 0 and 1
  */
  getPhases() : number[]
  {
    let phases = [];
    let currentPhase = 0;
    for(var i = 0; i < this.animationTimes.length; i++)
    {
      phases.push(currentPhase);
      currentPhase = (this.animationTimes[i] - this.T)/this.P;
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

    this.radialVelocities = [];

    for(var i = 0; i < this.animationSteps; i++)
    {
      this.radialVelocities.push(this.radialVelocity(i));
    }
    return this.buildPeriodic(this.radialVelocities, nT);
  }

  /**
  * Returns the primary's radial velocity array relative to the observer
  */
  getPrimaryCMVelocities() : number[]
  {
    return this.primaryCMVelocities;
  }

  /**
  * Returns the secondary's radial velocity array relative to the observer
  * @return {number[]} radial velocities for the secondary
  */
  getSecondaryCMVelocities() : number[]
  {
    return this.secondaryCMVelocities; 
  }

  /**
  * Returns the path of CM relative to the primary star on the given times, or the manager times if
  * not given.
  * @param {number[]} timeArray The optional array of times for the path generation.
  */
  getCMPath(times : number[] = undefined) : number[][]{
    times = times || this.animationTimes;
    let positions = [];
    let xarray = [];
    let yarray = [];
    let zarray = [];
    times.forEach((t) => {
      let sol = this.primaryPositionFromTime(t).map(val => -val);
      xarray.push(sol[0])
      yarray.push(sol[1])
      zarray.push(sol[2])
    });

    positions.push(xarray);
    positions.push(yarray);
    positions.push(zarray);

    return positions;
  }

  /** 
  *  Returns the path of the rotation center for heirarchical systems
  * @param {number[]} times Time array for the positions to be calculated.
  */
  getRotationCenterPath(times : number[] = undefined) : number[][]
  {
    times = times || this.animationTimes;
    let positions = [];
    let xarray = [];
    let yarray = [];
    let zarray = [];
    if(this.fatherManager)
    {
      switch(this.type)
      {
        case TypeEnum.CMCentered:
          positions = this.fatherManager.getCMPath(times);
        break;

        case TypeEnum.PrimaryCentered:
          positions = this.fatherManager.getRotationCenterPath(times);
        break;

        case TypeEnum.SecondaryCentered:
          positions = this.fatherManager.getProjectionPath(times);
        break;
      }
    }
    else
      positions = new Array(3).fill(new Array(this.animationSteps).fill(0));

    return positions;
  }

  /**
  * Builds the radial velocity for the primary and secondary respect to the CM
  * @param {number[]} times Time array for the positions to be calculated.
  */
  buildCMRadialVelocities(times : number[] = undefined) : void{
    times = times || this.animationTimes;

    this.primaryCMVelocities = [];
    this.secondaryCMVelocities = [];

    for(var i = 0; i < this.animationTimes.length; i++)
    {
      this.primaryCMVelocities.push(this.primaryCMVelocity(times[i]));
      this.secondaryCMVelocities.push(this.secondaryCMVelocity(times[i]));
    }
  }

  /**
  * Builds the periodic array for nT number of periods
  * @param {number[]} array The array to be repeated
  * @param {number} nT Number of this.animationTimes of repetition
  * @param {number[]} Array repeated nT this.animationTimes
  */
  buildPeriodic(array, nT)
  {
    return [].concat.apply([], Array(nT).fill(array));
  }


  /**
  * Converts the epoch value to phase
  * @param The epoch to be converted
  * @return The equivalent phase, in [0, 1]
  */
  toPhase(epoch : number){
    let prop = (epoch - this.T)/this.P;
    prop = prop - Math.floor(prop);
    let phase;
    return prop;
  }





}


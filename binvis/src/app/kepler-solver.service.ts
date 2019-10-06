import {Injectable } from '@angular/core';
import { throwError } from 'rxjs'; 
import Victor from 'victor';

const kmUA = 1.496 * Math.pow(10, 8); // kilometers in an UA
const secYr = 3.15 * Math.pow(10, 7); // Number of seconds in year
const UApc = 206265; // Number of UA in a parsec
let Gtemp = 4.3 * Math.pow(10, -3) ; // pc / Ms * (km/s)^2
const G = Gtemp * Math.pow(secYr, 2) / Math.pow(kmUA, 2) * UApc;  // UA * (UA/yr)^2/ Ms

@Injectable({
  providedIn: 'root'
})
export class KeplerSolverService {
  private omega : number; // rad
  private Omega : number; // rad
  private i : number; // rad
  private T : number; // yr
  private P : number; // yr
  private a : number; // ''
  private e : number; 
  private q : number;
  private plx : number; // mas

  private A : number;
  private B : number;
  private F : number;
  private G : number;

  private C : number;
  private H : number;

  private Kp;
  private Ks;

  /**
  * Velocity of centre of mass
  */
  private v0 : number;
  /**
  * Semi amplitude of the radial velocity curve, in km/s
  */
  private Kl : number;
  /**
  *Values for E
  */
  private EVals : number[];



  constructor() {}

  /**
  * Initializator for the solver class, responsible for 
  * finding the value of a parameter given an instant of time.
  * @param {number} omega argument of periastrum
  * @param {number} Omega Positional angle of ascending node
  * @param {number} i inclination
  * @param {number} T Date of periastrum passage
  * @param {number} P period
  * @param {number} a semi-major axis
  * @param {number} e excentriccity
  * @param {number} plx parallax of the system
  * @param {number} v0 Velocity of the centre of mass
  */
  init(omega : number, Omega : number, i : number, T : number,
         P : number, a : number, e : number, q : number, plx : number, v0 : number) : void{
    this.omega = omega;
    this.Omega = Omega;
    this.i = i;
    this.T = T;
    this.P = P;
    this.a = a;
    this.e = e;
    this.q = q;
    this.plx = plx;
    this.v0 = v0;
    this.findConstants();
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
  * Returns the periastrum and the periastrum in the main view, in arcseconds
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

  arcsecToAU = (x) => {
    let plxArcSec = this.plx / 1000;

    return x / plxArcSec; // x was in arcsec
  }

  /**
  * @return The mass ratio of the system
  */
  getMassRatio()
  {
    return this.q;
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
  * Solves for E on given times
  */
  solveEVals(times) : void{
    this.EVals = []
    for(var i = 0; i < times.length; i++)
    {
      let currentTime = times[i];
      try
      {
        this.EVals.push(this.findEsol(currentTime));
      }
      catch(e)
      {
        throw e;
      }
      finally
      {
        continue;
      }
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

  private findEsol(tau : number) : number
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

  private apparentPositionFromTrueAnomaly(nu : number){


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
      var x = Math.cos(Esol) - this.e;
      var y = Math.sqrt(1-Math.pow(this.e, 2)) * Math.sin(Esol);

      var X = this.B * x + this.G * y;
      var Y = this.A * x + this.F * y;
      var Z = (this.C * x + this.H * y);

      var position = [X, Y, Z];
      return position;
  }

  /**
  * Calculates the apparent position of the secondary given a certain index,
  * relative to the primary
  * @return {number[number[]]} Array with triads (x, y, z)
  */
  apparentPosition(index  : number)
  {
  	let Esol = this.EVals[index]
    var x = Math.cos(Esol) - this.e;
    var y = Math.sqrt(1-Math.pow(this.e, 2)) * Math.sin(Esol);

    var X = this.B * x + this.G * y;
    var Y = this.A * x + this.F * y;
    var Z = (this.C * x + this.H * y);

    var position = [X, Y, Z];
    return position;
  }

  /**
  * Calculates the secondary's position relative to the centre of mass
  * @return {number[number[]]} Array with triads (x, y, z)
  */
  secondaryPosition(index  : number)
  {
    let fact = 1 / (1 + this.q);
    return this.apparentPosition(index).map((x) => {return x * fact});
  }

  /**
  * Calculates the primary's position relative to the centre of mass
  * @return {number[number[]]} Array with triads (x, y, z)
  */
  primaryPosition(index  : number)
  {
    let fact = - this.q / (1 + this.q);
    return this.apparentPosition(index).map((x) => {return x * fact});
  }


  /**
  * Calculates the radial velocity for a given instant of time in km/s
  * @param {number} tau Time, interpreted in the same units as the period
  * @return {number} The radial velocity in km/s;
  */
  radialVelocity(index : number) : number
  {
  	let Esol = this.EVals[index];

  	var trueAnomaly = 2 * Math.atan(
  		Math.sqrt((1 + this.e) / (1 - this.e)) * Math.tan(Esol/2));

  	let rvel = this.v0 + this.Kl * (Math.cos(this.omega + trueAnomaly) +
  							this.e * Math.cos(this.omega));
  	return rvel

  }

  /**
  * Calculates the primary's radial velocity relative to the observer in km/s
  * @param {number} tau Time, interpreted in the same units as the period
  * @return {number} The radial velocity in km/s
  */
  primaryCMVelocity(index : number) : number
  {
    let Esol = this.EVals[index];

    var trueAnomaly = 2 * Math.atan(
      Math.sqrt((1 + this.e) / (1 - this.e)) * Math.tan(Esol/2));

    let rvel = this.v0 + this.Kp * (Math.cos(this.omega + trueAnomaly) +
                this.e * Math.cos(this.omega));
    return rvel
  }

  /**
  * Calculates the secondary's radial velocity relative to the observer in km/s
  * @param {number} tau Time, interpreted in the same units as the period
  * @return {number} The radial velocity in km/s
  */
  secondaryCMVelocity(index : number) : number
  {
    let Esol = this.EVals[index];

    let trueAnomaly = 2 * Math.atan(
      Math.sqrt((1 + this.e) / (1 - this.e)) * Math.tan(Esol/2));

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
}
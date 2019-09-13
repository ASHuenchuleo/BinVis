import {Injectable } from '@angular/core';
import { throwError } from 'rxjs'; 
import Victor from 'victor';

@Injectable({
  providedIn: 'root'
})
export class KeplerSolverService {
  private omega : number;
  private Omega : number;
  private i : number;
  private T : number;
  private P : number;
  private a : number;
  private e : number;
  private q : number;
  private plx : number;

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
  private Kl : number = 100;
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
  * Returns the periastrum and the periastrum in the main view
  */
  getPeriApoMain()
  {
    let peri = this.apparentPositionFromTrueAnomaly(0);
    let apo = this.apparentPositionFromTrueAnomaly(Math.PI);
    return [peri, apo];
  }

  /*
  * Returns the mass ratio of the system
  */
  getMassRatio()
  {
    return this.q;
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

    let scale_fact =   1.496 * Math.pow(10, 8) / (3.154 * Math.pow(10,7)); // UA/yr to km/s
    let a_p = 1000 * this.a / this.plx * this.q / (1 + this.q);
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
  	var Esol = this.newtonRaphson(6.0, 0.01, 100, 0.001, kepler);
  	return Esol;
  }

  /**
  * Calculates the position of the secondary in the main view
  * given the value of the true anomaly
  */

  private apparentPositionFromTrueAnomaly(nu : number){

      const trueAnomalyRelation = (E) => {
        return 2 * Math.atan(
      Math.sqrt((1 + this.e) / (1 - this.e)) * Math.tan(E/2)) - nu;
      };

      var Esol = this.newtonRaphson(0, 0.01, 100, 0.001, trueAnomalyRelation);
      var x = Math.cos(Esol) - this.e;
      var y = Math.sqrt(1-Math.pow(this.e, 2)) * Math.sin(Esol);

      var X = this.B * x + this.G * y;
      var Y = this.A * x + this.F * y;
      var Z = (this.C * x + this.H * y);

      var position = [X, Y, Z];
      return position;
  }

  /**
  * Calculates the apparent position of the secondary given a certain instant of time,
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
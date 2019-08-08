import { Injectable } from '@angular/core';
import Victor from 'victor';


@Injectable({
  providedIn: 'root'
})
export class KeplerSolverService {
  private scale : number = 1.0;
  private omega : number;
  private Omega : number;
  private i : number;
  private T : number;
  private P : number;
  private a : number;
  private e : number;

  private A : number;
  private B : number;
  private F : number;
  private G : number;

  private C : number;
  private H : number;


  constructor() {}

  init(omega : number, Omega : number, i : number, T : number, P : number, a : number, e : number) {
  	 /**
  	* Initializator for the solver class, responsible for 
  	* finding the value of a parameter given an instant of time.
  	* @param {number} omega argument of periastrum
  	* @param {number} Omega Positional angle of ascending node
  	* @param {number} i inclination
	* @param {T} T Date of periastrum passage
	* @param {P} P period
	* @param {a} a semi-major axis
	* @param {e} e excentriccity
  	*/
    this.omega = omega;
    this.Omega = Omega;
    this.i = i;
    this.T = T;
    this.P = P;
    this.a = a;
    this.e = e;
    this.findConstants();
  }

  findConstants(){
  	/**
  	* Calculates the Thiele-Innes constants
  	*/
  	var cosom = Math.cos(this.omega);
  	var cosOm = Math.cos(this.Omega);

  	var sinom = Math.sin(this.omega);
  	var sinOm = Math.sin(this.Omega);

  	var cosi = Math.cos(this.i);
  	var sini = Math.sin(this.i);

  	this.A = this.scale * (cosom * cosOm - sinom * sinOm * cosi);
  	this.B = this.scale * (cosom * sinOm + sinom * cosOm * cosi);
  	this.F = this.scale * (-sinom * cosOm - cosom * sinOm * cosi);
  	this.G = this.scale * (-sinom * sinOm + cosom * cosOm * cosi);

  	this.C = this.scale * sinom * sini;
  	this.H = this.scale * cosom * sini;
  }

  apparentPosition(tau : number) : Victor
  {
  	/**
  	* Calculates the apparent position of the stars given a certain instant of time
  	* @return {position} Victor Position of the relative orbit.
  	*/
  	var kepler = function(E, tau) {
  		return 2 * Math.PI * (tau - this.T) / this.P - (E - this.e * Math.sin(E));
  	}
  	/*var Esol = zero(kepler)*/
  	var Esol = Math.PI/4;

  	var x = Math.cos(Esol) - this.e;
  	var y = Math.sqrt(1-Math.pow(this.e, 2)) * Math.sin(Esol);

  	var X = this.B * x + this.G * y;
  	var Y = this.A * x + this.F * y;

  	var position = new Victor(X, Y);

  	return position;
  }
}

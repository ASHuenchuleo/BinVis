import { Injectable } from '@angular/core';
import {OrbitAttribute} from './orbit-attribute'
import { timer, Subject }    from 'rxjs';
import {ViewWindow} from './view-window';
import {ViewItem} from './view-item';
import { PosManager } from './pos-manager';




@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  /*
  * Current number of systems
  */
  nSystems : number;


  /*
  * Position managers for all the systems
  */
  managers : PosManager[];

  /*
  * Data input settings dict
  */
  dataInputSettings : {[type : string] : any};

  /*
  * View settings
  */
  // Timescale for the orbit as in [s in real time]/[yr in simulation], greater means faster
  realSecondsPerSimYear : number;
  frameRate : number = 60;
  starViewSettings : {[id : string] : any} = {
    'primarySize' : 5,
    'starScalingFun' : (x) => x ** (1/3)
  };

  // Whether a hierarchical system is being displayed
  isHierarchical : boolean = false;

  // The types of orbits for every subsystem
  systemTypeArray : {[id : string] : number}[];


  /*
  *  Time settings dict for the hierarchical orbits, it does not matter for simple binary systems
  */
  timeSettings : {[id : string] : any} = {
    'initT' : 1990,
    'finalT' : 2020,
    'orbitDependant' : true, // Does the time period depend on the outer orbit?
    'nPeriods' : 3 // If so, how many periods are displayed
  };

  /*
  * Observable string sources
  */
  private derivedParametersUpdateSource = new Subject<any>();

  private viewCardLeftUpdateSource = new Subject<ViewWindow>();
  private viewCardLeftAnimUpdateSource = new Subject<any>();
  private viewCardLeftDataUpdateSource = new Subject<any>();

  private viewCardRightUpdateSource = new Subject<ViewWindow>();
  private viewCardRightAnimUpdateSource = new Subject<any>();
  private viewCardRightDataUpdateSource = new Subject<any>();

  // Observable string streams
  derivedParametersUpdate$ = this.derivedParametersUpdateSource.asObservable();

  viewCardLeftUpdate$ = this.viewCardLeftUpdateSource.asObservable();
  viewCardLeftAnimUpdate$ = this.viewCardLeftAnimUpdateSource.asObservable();
  viewCardLeftDataUpdate$ = this.viewCardLeftDataUpdateSource.asObservable();

  viewCardRightUpdate$ = this.viewCardRightUpdateSource.asObservable();
  viewCardRightAnimUpdate$ = this.viewCardRightAnimUpdateSource.asObservable();
  viewCardRightDataUpdate$ = this.viewCardRightDataUpdateSource.asObservable();

                       
  /**
  * Sends messages to the respective components to update the data and display
  * the selected views
  * @param {OrbitAttribute[][]} attributes List with the numeric attributes of each orbit
  * @param {ViewWindow} leftView The selected view window for the left view
  * @param {ViewWindow} leftView The selected view window for the right view
  * @param {number} realSecondsPerSimYear Timescale for the orbit as in [s in real time]/[yr in simulation], greater means faster
  * @param {[id : string] : number}[] systemTypeArray The way the systems interact with the others.
  */
  updateSceneAttr(attributeList : OrbitAttribute[][], leftView : ViewWindow, rightView : ViewWindow,
    realSecondsPerSimYear : number, systemTypeArray : {[id : string] : number}[])
  {
    this.nSystems = attributeList.length;
    this.managers = new Array(this.nSystems);
    this.realSecondsPerSimYear = realSecondsPerSimYear;
    this.systemTypeArray = systemTypeArray;

    attributeList.forEach((attributes, i) =>
    {
      this.managers[i] = new PosManager(attributes, this.realSecondsPerSimYear, this.frameRate); // Do calculations
    });
    this.derivedParametersUpdateSource.next(); // Update derived parameters
    this.viewCardLeftUpdateSource.next(leftView); // Update left viewcard
    this.viewCardRightUpdateSource.next(rightView); // Update right viewcard

  }	

  /**
  * Sends a message to set the animation state to state
  * @param Dictionary with the animation commands
  */
  updateAnimationState(animCom){
    this.viewCardRightAnimUpdateSource.next(animCom);
    this.viewCardLeftAnimUpdateSource.next(animCom);
  }

  /**
  * Sends the file dictionary to both viewcards so they can be displayed
  * @param {[type : string] : File | undefined} dataInput Dictionary with both files
  * @param {[type : string] : any} settings Dictionary for data settings
  */
  passFileInput(dataInput : {[type : string] : File | undefined},
                      settings : {[type : string] : any}){
    this.dataInputSettings = settings;
    this.viewCardRightDataUpdateSource.next(dataInput);
    this.viewCardLeftDataUpdateSource.next(dataInput);

  }

}

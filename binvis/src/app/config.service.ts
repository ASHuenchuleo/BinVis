import { Injectable } from '@angular/core';
import {OrbitAttribute} from './orbit-attribute'
import { timer, Subject }    from 'rxjs';
import {ViewWindow} from './view-window';
import {ViewItem} from './view-item';
import { PosManager } from './pos-manager';




@Injectable({
  providedIn: 'root'
})
/*
* Contains all the settings and starts up the simulations with those settings
*/
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
  * Whether a hierarchical system is being displayed
  */
  isHierarchical : boolean = false;


  /*
  * View settings for the stars
  */
  starViewSettings : {[id : string] : any};

  /*
  *  Time settings dictionary for the periodic simulations
  */
  timeSettings : {[id : string] : any};

  /*
  *  Animation and time scale settings dictionary
  */
  animationSettings : {[id : string] : any};

  /*
  * Scaling settings for the axes
  */
  scalingSettings : {[id : string] : any};

  /*
  * Array that describes each system's relations to its parent
  */
  systemRelations : {[id : string] : any}[] = [];

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
  */
  updateSceneAttr(attributeList : OrbitAttribute[][], leftView : ViewWindow, rightView : ViewWindow)
  {
    this.nSystems = attributeList.length;
    this.managers = new Array(this.nSystems);

    attributeList.forEach((attributes, i) =>
    {
      this.managers[i] = new PosManager(attributes, this); // Do calculations
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

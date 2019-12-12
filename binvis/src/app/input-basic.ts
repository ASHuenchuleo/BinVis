import { Component, ViewChild, ViewChildren, Input, QueryList} from '@angular/core';

import {OrbitAttribute} from './orbit-attribute';
import {ConfigService} from './config.service';
import {ViewWindow} from './view-window';

import {PropertyInputComponent} from './property-input/property-input.component';
import {ViewSelectionComponent} from './view-selection/view-selection.component';
import { FileInputComponent } from './file-input/file-input.component';

/**
* Handles all inputs and sends a message to update the parameters and do the
* calculations, and then calls the selected views to be shown
*/
export class InputBasic{

  @ViewChildren(PropertyInputComponent) propertyInputChildren : QueryList<PropertyInputComponent>;
  @ViewChildren(FileInputComponent) fileInputChildren : QueryList<FileInputComponent>;

  @ViewChild(ViewSelectionComponent, {static : false}) viewSelectionChild : ViewSelectionComponent;

  /* Wether the animation is running */
  running : boolean = true;

  /* Frames moved per arrow button click */
  framesMoved : number = 5;

  /* Frames to be moved next */
  framesToMove : number = 0;

  /* Seconds per simulation year time scale */
  realSecondsPerSimYear : number = 0.5;

  
  /** Properties for system type selection */
  systemOptions;

  /** Function for input updating */
  private _nSystems : number = 1;
  get nSystems(): any {
    return this._nSystems;
  }
  
  @Input()
  set nSystems(val: any) {
    this._nSystems = val;
    this.systemEnumerator = new Array(this._nSystems).fill(0).map((x, i) => i);
    this.config.isHierarchical = this.nSystems > 1;
    this.systemOptions = new Array(this._nSystems).fill(0).map((x, i) =>  {
          return {id : i, name: String(i)};
        })
  }

  systemEnumerator = new Array(this._nSystems).fill(0).map((x, i) => i);


  constructor(protected config : ConfigService) {
  }

  /**
  * Changes the current animation state to stop/play, and send
  * an animation command to update the value
  */
  setAnimationState(event : any){
    if(this.running){
      event.currentTarget.innerHTML = "Resume Animation";
    }
    else{
      event.currentTarget.innerHTML = "Pause Animation";
    }

    this.running = !this.running;

    this.sendAnimationCommand();
  }

  /**
  * If it's not running, send a command to move this.framesMoved frames
  * in the specified direction.
  */
  moveSingle(event : any, direction : number){

    if(!this.running){
      this.framesToMove = direction == 1 ? this.framesMoved : -this.framesMoved;
      this.sendAnimationCommand();
      this.framesToMove = 0;
    }
  }

  /*
  * Sends a command with instructions for the running animation
  */
  sendAnimationCommand(){
    this.config.updateAnimationState(
      {
        'running' : this.running,
        'toMove' : this.framesToMove
      });
  }

  updateViews() {
    let attributeList : OrbitAttribute[][] = [];
    let systemTypeArray : {[id : string] : number}[] = [];

    this.propertyInputChildren.forEach((inputChild) => 
      {
        let attributes = inputChild.visualAttributes.concat(
          inputChild.physicalAttributes.concat(
            inputChild.measuredAttributes));
        attributeList.push(attributes);

        let typeDict = {};
        typeDict['type'] = inputChild.type.id;
        typeDict['center'] = inputChild.centerIndex.id;

        systemTypeArray.push(typeDict);

      });

    this.config.updateSceneAttr(attributeList, this.viewSelectionChild.leftView.id, this.viewSelectionChild.rightView.id,
      this.realSecondsPerSimYear, systemTypeArray);
    this.sendAnimationCommand(); // Start animation
    this.sendFileInput(); // sends the files to be displayed


    
  }

  sendFileInput(){
    this.fileInputChildren.forEach((fileInputChild) =>
    {
      this.config.passFileInput(
      {
        'astrometry' : fileInputChild.astrometryFile,
        'velocity' : fileInputChild.velocityFile
      },
      {
        'dateVelocity' : fileInputChild.dateVelocity.id
      });
    });

  }
   
}

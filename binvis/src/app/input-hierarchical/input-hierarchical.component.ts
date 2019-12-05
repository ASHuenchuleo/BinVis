import { Component, ViewChild, ViewChildren, Input, QueryList, ComponentFactoryResolver} from '@angular/core';

import {OrbitAttribute} from '../orbit-attribute'
import {ConfigService} from '../config.service';
import {ViewWindow} from '../view-window';

import {PropertyInputComponent} from '../property-input/property-input.component';
import {ViewSelectionComponent} from '../view-selection/view-selection.component';
import { FileInputComponent } from '../file-input/file-input.component';

@Component({
  selector: 'app-input-hierarchical',
  templateUrl: './input-hierarchical.component.html',
  styleUrls: ['./input-hierarchical.component.css']
})
/**
* Handles all inputs and sends a message to update the parameters and do the
* calculations, and then calls the selected views to be shown
*/
export class InputHierarchicalComponent {

  @ViewChildren(PropertyInputComponent) propertyInputChildren : QueryList<PropertyInputComponent>;
  @ViewChildren(FileInputComponent) fileInputChildren : QueryList<FileInputComponent>;

  @ViewChild(ViewSelectionComponent, {static : false}) viewSelectionChild : ViewSelectionComponent;



  /* Wether the animation is running */
  running : boolean = true;

  /* Frames moved per arrow button click */
  framesMoved : number = 5;

  /* Frames to be moved next */
  framesToMove : number = 0;

  /** Component management */
  nComp : number = 5;


  constructor(private config : ConfigService) {

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
    this.propertyInputChildren.forEach((inputChild) => 
      {
        let attributes = inputChild.visualAttributes.concat(
          inputChild.physicalAttributes.concat(
            inputChild.measuredAttributes));
        this.config.updateSceneAttr(attributes, this.viewSelectionChild.leftView.id, this.viewSelectionChild.rightView.id);
        this.sendAnimationCommand(); // Start animation
        //this.sendFileInput(); // sends the files to be displayed

      });
    
  }

  sendFileInput(){
    /*
    this.config.passFileInput(
    {
      'astrometry' : this.fileInputChild.astrometryFile,
      'velocity' : this.fileInputChild.velocityFile
    },
    {
      'dateVelocity' : this.fileInputChild.dateVelocity.id
    });
    */
  }


}

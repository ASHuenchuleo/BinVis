import { Component, Input} from '@angular/core';

import {OrbitAttribute} from '../orbit-attribute'
import {ConfigService} from '../config.service';

import {ViewWindow} from '../view-window';


@Component({
  selector: 'app-prop-input',
  templateUrl: './prop-input.component.html',
  styleUrls: ['./prop-input.component.css']
})
/**
* Handles all inputs and sends a message to update the parameters and do the
* calculations, and then calls the selected views to be shown
*/
export class PropInputComponent {


  omega : OrbitAttribute = new OrbitAttribute('&#969;', 86.65, '[°]', true, 0, 360); // deg
  Omega : OrbitAttribute = new OrbitAttribute('&#937;', 51.2, '[°]', true, 0, 360); // deg
  i : OrbitAttribute = new OrbitAttribute('i',  146.2, '[°]', true, -180, 180); // deg
  T : OrbitAttribute = new OrbitAttribute('T', 1990.675, '[yr]'); // yr
  P : OrbitAttribute = new OrbitAttribute('P', 0.546, '[yr]'); // yr
  a : OrbitAttribute = new OrbitAttribute('a', 0.019, '["]'); // arcsec
  e : OrbitAttribute = new OrbitAttribute('e', 0.302, '', true, .0, 1.0);
  q : OrbitAttribute = new OrbitAttribute('q', 0.956, '', true, .0, 1.0);
  plx : OrbitAttribute = new OrbitAttribute('π', 21.31, '[mas]'); // mas
  v0 : OrbitAttribute = new OrbitAttribute('V<sub>0</sub>', -14.131, '[<sup>km</sup>&frasl;<sub>s</sub>]'); // km/s

  viewOptions = [
    {id: ViewWindow.Main, name: "Primary Component "},
    {id: ViewWindow.CM, name: "Centre of Mass"},
    {id: ViewWindow.Vel, name: "Velocity Graph"}
  ];

  leftView = this.viewOptions[0];
  rightView = this.viewOptions[2];


  physicalAttributes : OrbitAttribute[] = 
  [
  	this.P,
  	this.a,
  	this.e,
  	this.q
  ];

  measuredAttributes : OrbitAttribute[]=
  [
    this.plx,
    this.v0
  ];


  visualAttributes: OrbitAttribute[] =
  [
  this.omega,
  this.Omega,
  this.i,
  this.T
  ]; 

  /* Wether the animation is running */
  running : boolean = true;

  /* Frames moved per arrow button click */
  framesMoved : number = 5;

  /* Frames to be moved next */
  framesToMove : number = 0;

  /* Files to be recieved */
  astrometryFile : File = null;

  velocityFile : File = null;

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
    let attributes = this.visualAttributes.concat(this.physicalAttributes.concat(this.measuredAttributes));
    this.config.updateSceneAttr(attributes, this.leftView.id, this.rightView.id);
    this.sendAnimationCommand(); // Start animation
    this.sendFileInput(); // sends the files to be displayed
    
  }

  handleAstrometricDataInput(files : FileList){
    this.astrometryFile = files.item(0);
  }

  handleVelocityDataInput(files : FileList){
    this.velocityFile = files.item(0);
  }

  sendFileInput(){
    this.config.passFileInput(
    {
      'astrometry' : this.astrometryFile,
      'velocity' : this.velocityFile
    });
  }


}

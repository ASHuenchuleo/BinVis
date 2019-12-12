import { Component, AfterViewInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';

import { PosManager } from './../pos-manager';
import { ConfigService} from './../config.service';
import { ThreeDView} from './../three-d-view';


import * as THREE from 'three'
import SpriteText from 'three-spritetext';
import OrbitControls from 'three-orbitcontrols';

@Component({
  selector: 'app-dual-orbit-view',
  templateUrl: './dual-orbit-view.component.html',
  styleUrls: ['./dual-orbit-view.component.css']
})


export class DualOrbitViewComponent extends ThreeDView
            implements AfterViewInit, OnDestroy{

  /* Paths to be followed */
  private xPathPrimAnimation : number[];
  private yPathPrimAnimation : number[];
  private zPathPrimAnimation : number[];

  private xPathSecAnimation : number[];
  private yPathSecAnimation : number[];
  private zPathSecAnimation : number[];

  private xPathPrimDrawn : number[];
  private yPathPrimDrawn : number[];
  private zPathPrimDrawn : number[];

  private xPathSecDrawn : number[];
  private yPathSecDrawn : number[];
  private zPathSecDrawn : number[];

  /** Meshes for the moving objects */
  secondaryReal : THREE.Mesh;
  secondaryProj : THREE.LineLoop;

  primaryReal : THREE.Mesh;
  primaryProj : THREE.LineLoop;

  // Manager for the orbit in the view
  manager : PosManager;

  constructor(private config : ConfigService) {
   super('dual-orbit-div');
   this.manager = config.managers[0];
   this.manager.initTimes();

  }

  ngOnDestroy() : void{

    this.clean();
    /**
    let test = (obj = this.scene) =>
    {
          if (obj.children !== undefined) {
              while (obj.children.length > 0) {
                  console.log(obj);
                  this.clean(obj.children[0]);
              }
          }
      }
    test();
    */
  }
  
  ngAfterViewInit()
  {
    this.divName = this.divName + '-' + this.cardClass;
    this.initScene();

    [this.xPathPrimAnimation, this.yPathPrimAnimation, this.zPathPrimAnimation] = this.manager.getPrimaryPath(this.manager.animationTimes);

    [this.xPathSecAnimation, this.yPathSecAnimation, this.zPathSecAnimation] = this.manager.getSecondaryPath(this.manager.animationTimes);


    [this.xPathPrimDrawn, this.yPathPrimDrawn, this.zPathPrimDrawn] = this.manager.getPrimaryPath(this.manager.pathTimes);

    [this.xPathSecDrawn, this.yPathSecDrawn, this.zPathSecDrawn] = this.manager.getSecondaryPath(this.manager.pathTimes);


    this.buildScaling(this.xPathSecDrawn, this.yPathSecDrawn, this.zPathSecDrawn);

    this.xPathPrimAnimation = this.xPathPrimAnimation.map(this.scalinFun);
    this.yPathPrimAnimation = this.yPathPrimAnimation.map(this.scalinFun);
    this.zPathPrimAnimation = this.zPathPrimAnimation.map(this.scalinFun);

    this.xPathSecAnimation = this.xPathSecAnimation.map(this.scalinFun);
    this.yPathSecAnimation = this.yPathSecAnimation.map(this.scalinFun);
    this.zPathSecAnimation = this.zPathSecAnimation.map(this.scalinFun);

    this.xPathPrimDrawn = this.xPathPrimDrawn.map(this.scalinFun);
    this.yPathPrimDrawn = this.yPathPrimDrawn.map(this.scalinFun);
    this.zPathPrimDrawn = this.zPathPrimDrawn.map(this.scalinFun);

    this.xPathSecDrawn = this.xPathSecDrawn.map(this.scalinFun);
    this.yPathSecDrawn = this.yPathSecDrawn.map(this.scalinFun);
    this.zPathSecDrawn = this.zPathSecDrawn.map(this.scalinFun);



    /* Primary and secondary in real view*/
    let primarySize = this.config.starViewSettings['primarySize'];
    let secondarySize = primarySize * this.config.starViewSettings['starScalingFun'](this.manager.getMassRatio());

    this.primaryReal = this.drawStar(this.starColorArray[0], primarySize);
    this.secondaryReal = this.drawStar(this.starColorArray[1], secondarySize);

    /* Real orbit line */
    let orbitRealPrim = this.drawOrbitLine(this.xPathPrimDrawn, this.yPathPrimDrawn, this.zPathPrimDrawn);
    let orbitReaSec = this.drawOrbitLine(this.xPathSecDrawn, this.yPathSecDrawn, this.zPathSecDrawn);

    /* Primary and secondary in projected view*/
    this.primaryProj = this.drawStarProjection(this.starColorArray[0], primarySize);
    this.secondaryProj = this.drawStarProjection(this.starColorArray[1], secondarySize);

    /* Projected orbit line */
    let orbitProjPrim = this.drawOrbitLine(this.xPathPrimDrawn, this.yPathPrimDrawn, 0);
    let orbitProjSec = this.drawOrbitLine(this.xPathSecDrawn, this.yPathSecDrawn, 0);

    /* Axis */
    let tickSize = 4;
    let axisLength = 100;
    let axisSteps = 6;
    let planeScale = 5;
    this.drawXYPlane(axisLength, axisSteps);
    this.drawAxisLabels(tickSize, this.scale, axisLength, axisSteps);
    this.renderer.render( this.scene, this.camera );

    this.animate()

  }

  moveFrames(frames : number){
      this.index = (this.index + frames) % this.xPathPrimAnimation.length;
      if(this.index < 0)
        this.index = this.xPathPrimAnimation.length + this.index;

      let xPrim = this.xPathPrimAnimation[this.index];
      let yPrim = this.yPathPrimAnimation[this.index];
      let zPrim = this.zPathPrimAnimation[this.index];

      let xSec = this.xPathSecAnimation[this.index];
      let ySec = this.yPathSecAnimation[this.index];
      let zSec = this.zPathSecAnimation[this.index];


      this.secondaryReal.position.set(xSec, ySec, zSec);
      this.secondaryProj.position.set(xSec, ySec, 0);

      this.primaryReal.position.set(xPrim, yPrim, zPrim);
      this.primaryProj.position.set(xPrim, yPrim, 0);
  }

  updateRotations(){
    this.primaryReal.quaternion.copy( this.camera.quaternion );
    this.secondaryReal.quaternion.copy( this.camera.quaternion );
  }

  
}



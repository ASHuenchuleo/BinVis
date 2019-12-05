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
  private xPathPrim : number[];
  private yPathPrim : number[];
  private zPathPrim : number[];

  private xPathSec : number[];
  private yPathSec : number[];
  private zPathSec : number[];

  /** Meshes for the moving objects */
  secondaryReal : THREE.Mesh;
  secondaryProj : THREE.LineLoop;

  primaryReal : THREE.Mesh;
  primaryProj : THREE.LineLoop;

  // Manager for the orbit in the view
  manager : PosManager;

  constructor(private config : ConfigService) {
   super('dual-orbit-div');
   this.manager = config.posManager;
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

    this.manager.buildPrimaryPath();
    let pathPrim = this.manager.getPrimaryPath();
    this.xPathPrim = pathPrim[0];
    this.yPathPrim = pathPrim[1];
    this.zPathPrim = pathPrim[2];

    this.manager.buildSecondaryPath();
    let pathSec = this.manager.getSecondaryPath();
    this.xPathSec = pathSec[0];
    this.yPathSec = pathSec[1];
    this.zPathSec = pathSec[2];

    this.buildScaling(this.xPathSec, this.yPathSec, this.zPathSec);

    this.xPathPrim = this.xPathPrim.map(this.scalinFun);
    this.yPathPrim = this.yPathPrim.map(this.scalinFun);
    this.zPathPrim = this.zPathPrim.map(this.scalinFun);

    this.xPathSec = this.xPathSec.map(this.scalinFun);
    this.yPathSec = this.yPathSec.map(this.scalinFun);
    this.zPathSec = this.zPathSec.map(this.scalinFun);


    /* Primary and secondary in real view*/
    let primarySize = 5;
    let secondarySize = primarySize * this.manager.getMassRatio();

    this.primaryReal = this.drawStar(this.primaryColor, primarySize);
    this.secondaryReal = this.drawStar(this.secondaryColor, secondarySize);

    /* Real orbit line */
    let orbitRealPrim = this.drawOrbitLine(this.xPathPrim, this.yPathPrim, this.zPathPrim);
    let orbitReaSec = this.drawOrbitLine(this.xPathSec, this.yPathSec, this.zPathSec);

    /* Primary and secondary in projected view*/
    this.primaryProj = this.drawStarProjection(this.primaryColor, primarySize);
    this.secondaryProj = this.drawStarProjection(this.secondaryColor, secondarySize);

    /* Projected orbit line */
    let orbitProjPrim = this.drawOrbitLine(this.xPathPrim, this.yPathPrim, 0);
    let orbitProjSec = this.drawOrbitLine(this.xPathSec, this.yPathSec, 0);

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
      this.index = (this.index + frames) % this.xPathPrim.length;
      if(this.index < 0)
        this.index = this.xPathPrim.length + this.index;

      let xPrim = this.xPathPrim[this.index];
      let yPrim = this.yPathPrim[this.index];
      let zPrim = this.zPathPrim[this.index];

      let xSec = this.xPathSec[this.index];
      let ySec = this.yPathSec[this.index];
      let zSec = this.zPathSec[this.index];


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



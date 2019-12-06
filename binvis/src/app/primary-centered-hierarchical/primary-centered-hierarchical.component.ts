import { Component, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { PosManager } from './../pos-manager';
import { ThreeDView} from './../three-d-view';
import {AstrometryRecord} from './../csv-parser';

import { ConfigService} from './../config.service';

import * as THREE from 'three'
import SpriteText from 'three-spritetext';
import OrbitControls from 'three-orbitcontrols';

@Component({
  selector: 'app-primary-centered-hierarchical',
  templateUrl: './primary-centered-hierarchical.component.html',
  styleUrls: ['./primary-centered-hierarchical.component.css']
})
export class PrimaryCenteredHierarchicalComponent extends ThreeDView
          implements AfterViewInit, OnDestroy {


  /* Paths to be followed */
  private xPathArray : number[][];
  private yPathArray : number[][];
  private zPathArray : number[][];

  primaryMesh : THREE.Mesh;

  /** Meshes for the rest of stars */
  starMeshArray : THREE.Mesh[];
  starProjArray : THREE.LineLoop[];

  /** Array for the indexes of different animations */
  indexArray : number[];

  /** Number of periods for each orbit after the first */
  nPeriods : number = 3;

  /** Color succesion for the orbits */
  orbitColorArray : string[] = [
  'rgb(0, 0, 0)', // black
  'rgb(203, 67, 53)', // dark red
  'rgb(125, 60, 152)', // purple
  'rgb(19, 141, 117)' // dark green
  ];

  /**
  apoMesh : THREE.Mesh;
  periMesh : THREE.Mesh;

  ascMesh : THREE.Mesh;
  descMesh : THREE.Mesh;
  */

  /** Managers for all the orbits */
  managers : PosManager[];


  constructor(private config : ConfigService) {
  	super('primary-centered-hierarchical-div');
    this.managers = this.config.managers;
  }


  ngOnDestroy() : void{
    this.clean();
    /**
    let test = (obj = this.scene) =>
    {
          if (obj.children !== undefined) {
              while (obj.children.length > 0) {
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

    let nSystems = this.managers.length;


    /* Arrays init */
    this.indexArray = new Array(nSystems).fill(0);

    this.xPathArray = new Array(nSystems);
    this.yPathArray = new Array(nSystems);
    this.zPathArray = new Array(nSystems);

    this.starMeshArray = new Array(nSystems);
    this.starProjArray = new Array(nSystems);

    // Loop over and find the value with the smallest scale
    let maxScaleIndex = 0;
    let maxScale =  Number.MAX_SAFE_INTEGER;

    // Initially the previous' system path is just centered on the primary
    let prevScaledCMPath;
    this.managers.forEach((manager, i) =>
    {
      let path;
      if(i > 0)
        path = manager.getProjectionPath(this.managers[i].getTimes(this.nPeriods));
      else
        path = manager.getProjectionPath();

      this.xPathArray[i] = path[0];
      this.yPathArray[i] = path[1];
      this.zPathArray[i] = path[2];

      this.buildScaling(this.xPathArray[i], this.yPathArray[i], this.zPathArray[i]);
      if(this.scale < maxScale)
      {
        maxScaleIndex = i;
        maxScale = this.scale
      }

      // The CM path of the previous system with the current system's time array
      if(i != 0)
        prevScaledCMPath = this.managers[i-1].getCMPath(this.managers[i].getTimes(this.nPeriods));
      else
        prevScaledCMPath = new Array(3).fill(new Array(this.managers[0].steps).fill(0));

      // Add the previous CM
      this.xPathArray[i] = this.xPathArray[i].map((val, j) => val + prevScaledCMPath[0][j]);
      this.yPathArray[i] = this.yPathArray[i].map((val, j) => val + prevScaledCMPath[1][j]);
      this.zPathArray[i] = this.zPathArray[i].map((val, j) => val + prevScaledCMPath[2][j]);

    });

    this.buildScaling(this.xPathArray[maxScaleIndex], this.yPathArray[maxScaleIndex], this.zPathArray[maxScaleIndex]);


    // Draw all the orbits


    this.managers.forEach((manager, i) =>
    {

      /* Primary and secondary of the current system*/
      let primarySize = 5;
      let secondarySize = primarySize * manager.getMassRatio();
      if(i==0)
        this.primaryMesh = this.drawStar(this.primaryColor, primarySize);
      this.starMeshArray[i] = this.drawStar(this.secondaryColor, secondarySize);

      this.starProjArray[i] = this.drawStarProjection(this.secondaryColor, secondarySize);


      // Scale the arrays
      this.xPathArray[i] = this.xPathArray[i].map(this.scalinFun);
      this.yPathArray[i] = this.yPathArray[i].map(this.scalinFun);
      this.zPathArray[i] = this.zPathArray[i].map(this.scalinFun);



      // Color the orbits according to their period
      for(let j = 0; j < this.nPeriods; j++)
      {
        let lower = Math.round(this.managers[i].steps * j);
        let upper = Math.round(this.managers[i].steps * (j + 1));

        let orbitLine = this.drawOrbitLine(this.xPathArray[i].slice(lower, upper), this.yPathArray[i].slice(lower, upper), this.zPathArray[i].slice(lower, upper),
                                             this.orbitColorArray[j]);
        let orbitProj = this.drawOrbitLine(this.xPathArray[i].slice(lower, upper), this.yPathArray[i].slice(lower, upper), 0,
                                             this.orbitColorArray[j]);
        if(i == 0)
          break;
      }



    });


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

    this.managers.forEach((manager, i) =>
    {
      // The first manager only has one period
      if(i > 0)
        this.indexArray[i] = (this.indexArray[i] + frames) % (this.nPeriods * this.managers[i].steps);
      else
        this.indexArray[i] = (this.indexArray[i] + frames) % this.managers[i].steps;

      if(this.indexArray[i] < 0)
        this.indexArray[i] = this.managers[i].steps + this.indexArray[i];

      let x = this.xPathArray[i][this.indexArray[i]];
      let y = this.yPathArray[i][this.indexArray[i]];
      let z = this.zPathArray[i][this.indexArray[i]];

      this.starMeshArray[i].position.set(x, y, z);
      this.starProjArray[i].position.set(x, y, 0);
    });


  }

  updateRotations(){
  	/*
    this.primaryReal.quaternion.copy( this.camera.quaternion );
    this.secondaryReal.quaternion.copy( this.camera.quaternion );

    this.apoMesh.quaternion.copy( this.camera.quaternion );
    this.periMesh.quaternion.copy( this.camera.quaternion );

    this.ascMesh.quaternion.copy( this.camera.quaternion );
    this.descMesh.quaternion.copy( this.camera.quaternion );
    */
  }

}

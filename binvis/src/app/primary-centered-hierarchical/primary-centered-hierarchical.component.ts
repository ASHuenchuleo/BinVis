import { Component, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { PosManager } from './../pos-manager';
import { ThreeDView} from './../three-d-view';
import {AstrometryRecord} from './../csv-parser';
import {TypeEnum} from '../type-enum';


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
  private xPathAnimationArray : number[][];
  private yPathAnimationArray : number[][];
  private zPathAnimationArray : number[][];

  private xPathDrawnArray : number[][];
  private yPathDrawnArray : number[][];
  private zPathDrawnArray : number[][];

  primaryMesh : THREE.Mesh;

  /** Meshes for the rest of stars */
  starMeshArray : THREE.Mesh[];
  starProjArray : THREE.LineLoop[];

  /** Array for the indexes of different animations */
  indexArray : number[];

  /** Color succesion for the orbits */
  orbitColorArray : string[] = [
  'rgb(0, 0, 0)', // black
  'rgb(203, 67, 53)', // dark red
  'rgb(19, 141, 117)', // dark green
  'rgb(125, 60, 152)', // purple
  
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

    this.xPathAnimationArray = new Array(nSystems);
    this.yPathAnimationArray = new Array(nSystems);
    this.zPathAnimationArray = new Array(nSystems);

    this.xPathDrawnArray = new Array(nSystems);
    this.yPathDrawnArray = new Array(nSystems);
    this.zPathDrawnArray = new Array(nSystems);

    this.starMeshArray = new Array(nSystems);
    this.starProjArray = new Array(nSystems);


    // Loop over and find the value with the smallest scale
    let maxScaleIndex = 0;
    let maxScale =  Number.MAX_SAFE_INTEGER;

    // Initially the previous' system path is just centered on the primary
    let initT, finalT;
    this.managers.forEach((manager, i) =>
    {

      // Init the manager with the system settings
      if(this.config.timeSettings['orbitDependant']) 
      {
        let maxPeriod = 0;
        let maxPeriodIndex = 0;
        this.managers.forEach((value: PosManager, index : number) => 
        {
          if(maxPeriod <= value.P)
          {
            maxPeriod = value.P;
            maxPeriodIndex = index;
          }
        });
        initT = this.managers[maxPeriodIndex].T;
        finalT = initT + this.managers[maxPeriodIndex].P * this.config.timeSettings['nPeriods'];
      }
      else // It depends on the settings
      {
        initT = this.config.timeSettings['initT'];
        finalT = this.config.timeSettings['finalT'];
      }

      manager.initTimes(initT, finalT);



      let drawnTimes = this.managers[i].pathTimes;
      let animationTimes = this.managers[i].animationTimes;
      [this.xPathAnimationArray[i], this.yPathAnimationArray[i], this.zPathAnimationArray[i]] = manager.getProjectionPath(animationTimes);
      [this.xPathDrawnArray[i], this.yPathDrawnArray[i], this.zPathDrawnArray[i]] = manager.getProjectionPath(drawnTimes);


      this.buildScaling(this.xPathDrawnArray[i], this.yPathDrawnArray[i], this.zPathDrawnArray[i]);

      if(this.scale < maxScale)
      {
        maxScaleIndex = i;
        maxScale = this.scale
      }



      if(i != 0) // The path of the system for the time window
      {


        // Add the orbit center path
        let fatherIndex = this.config.systemRelations[i]['center'];
        let orbitType = this.config.systemRelations[i]['type'];

        manager.fatherManager = this.managers[fatherIndex];
        manager.type = orbitType;


        let pathToAdd = manager.getRotationCenterPath(animationTimes);

        // Sumar el centro de rotacion
        this.xPathAnimationArray[i] = this.xPathAnimationArray[i].map((val, j) => val + pathToAdd[0][j]);
        this.yPathAnimationArray[i] = this.yPathAnimationArray[i].map((val, j) => val + pathToAdd[1][j]);
        this.zPathAnimationArray[i] = this.zPathAnimationArray[i].map((val, j) => val + pathToAdd[2][j]);

        // lo mismo para el camino
        fatherIndex = this.config.systemRelations[i]['center'];
        orbitType = this.config.systemRelations[i]['type'];

        pathToAdd = manager.getRotationCenterPath(drawnTimes);

        this.xPathDrawnArray[i] = this.xPathDrawnArray[i].map((val, j) => val + pathToAdd[0][j]);
        this.yPathDrawnArray[i] = this.yPathDrawnArray[i].map((val, j) => val + pathToAdd[1][j]);
        this.zPathDrawnArray[i] = this.zPathDrawnArray[i].map((val, j) => val + pathToAdd[2][j]);
      }

    });



    this.buildScaling(this.xPathDrawnArray[maxScaleIndex], this.yPathDrawnArray[maxScaleIndex], 
                        this.zPathDrawnArray[maxScaleIndex]);


    // Draw all the orbits
    let primaryMass, secondarySize;
    this.managers.forEach((manager, i) =>
    {
     /* Primary and secondary of the current system*/
      if(i==0){
        primaryMass = this.managers[i].getStarMasses()[0];
        let primarySize = this.config.starViewSettings['primarySize'];
        secondarySize = primarySize * this.config.starViewSettings['starScalingFun'](this.managers[0].getMassRatio());
        this.primaryMesh = this.drawStar(this.starColorArray[0], primarySize);
      }
      else{

        secondarySize = secondarySize * this.config.starViewSettings['starScalingFun'](
                                                      this.managers[i].getStarMasses()[1]/primaryMass);
      }
      // Secondary star
      this.starMeshArray[i] = this.drawStar(this.starColorArray[(i+1)%this.starColorArray.length], secondarySize);

      this.starProjArray[i] = this.drawStarProjection(this.starColorArray[(i+1)%this.starColorArray.length], secondarySize);


      // Scale the arrays
      this.xPathAnimationArray[i] = this.xPathAnimationArray[i].map(this.scalinFun);
      this.yPathAnimationArray[i] = this.yPathAnimationArray[i].map(this.scalinFun);
      this.zPathAnimationArray[i] = this.zPathAnimationArray[i].map(this.scalinFun);

      console.log(this.xPathAnimationArray[i].length);

      this.xPathDrawnArray[i] = this.xPathDrawnArray[i].map(this.scalinFun);
      this.yPathDrawnArray[i] = this.yPathDrawnArray[i].map(this.scalinFun);
      this.zPathDrawnArray[i] = this.zPathDrawnArray[i].map(this.scalinFun);
      

      // Color the orbits according to their orbit number
      if(i == 0)
      {
        let orbitLine = this.drawOrbitLine(this.xPathDrawnArray[i], this.yPathDrawnArray[i],
                                            this.zPathDrawnArray[i],
                                             this.orbitColorArray[0]);
        let orbitProj = this.drawOrbitLine(this.xPathDrawnArray[i], this.yPathDrawnArray[i], 0,
                                             this.orbitColorArray[0]);
      }
      else // The non primary orbit has a different color per orbit
      {
        let orbitCount = Math.ceil((finalT - initT) / this.managers[i].P);
        for(let j = 0; j < orbitCount; j++)
        {
          let lower = Math.round(this.managers[i].steps / orbitCount * j);
          let upper = Math.round(this.managers[i].steps / orbitCount * (j + 1));

          let orbitLine = this.drawOrbitLine(this.xPathDrawnArray[i].slice(lower, upper),
                                              this.yPathDrawnArray[i].slice(lower, upper), this.zPathDrawnArray[i].slice(lower, upper),
                                               this.orbitColorArray[j]);
          let orbitProj = this.drawOrbitLine(this.xPathDrawnArray[i].slice(lower, upper),
                                              this.yPathDrawnArray[i].slice(lower, upper), 0,
                                               this.orbitColorArray[j]);
          if(i == 0)
            break;
        }

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
      this.indexArray[i] = (this.indexArray[i] + frames) % this.managers[i].animationSteps;

      if(this.indexArray[i] < 0)
        this.indexArray[i] = this.managers[i].animationSteps + this.indexArray[i];


      let x = this.xPathAnimationArray[i][this.indexArray[i]];
      let y = this.yPathAnimationArray[i][this.indexArray[i]];
      let z = this.zPathAnimationArray[i][this.indexArray[i]];

      this.starMeshArray[i].position.set(x, y, z);
      this.starProjArray[i].position.set(x, y, 0);
    });


  }

  updateRotations(){
    this.primaryMesh.quaternion.copy(this.camera.quaternion)

    this.starMeshArray.forEach((starMesh) =>
    {
      starMesh.quaternion.copy(this.camera.quaternion)
    });
  }

}

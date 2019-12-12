import { Component, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { PosManager } from './../pos-manager';
import { ThreeDView} from './../three-d-view';
import {AstrometryRecord} from './../csv-parser';

import { ConfigService} from './../config.service';

import * as THREE from 'three'
import SpriteText from 'three-spritetext';
import OrbitControls from 'three-orbitcontrols';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
/**
* Handles and shows the view for a single system
* centered on the primary component
*/
export class MainViewComponent extends ThreeDView
          implements AfterViewInit, OnDestroy {

  /* Paths to be followed */
  private xPathAnimation : number[];
  private yPathAnimation : number[];
  private zPathAnimation : number[];

  private xPathDrawn : number[];
  private yPathDrawn : number[];
  private zPathDrawn : number[];

  /** Meshes of the moving objects */
  primaryReal : THREE.Mesh;

  secondaryReal : THREE.Mesh;
  secondaryProj : THREE.LineLoop;

  apoMesh : THREE.Mesh;
  periMesh : THREE.Mesh;

  ascMesh : THREE.Mesh;
  descMesh : THREE.Mesh;

  // Manager for the orbit in the view
  manager : PosManager;

  constructor(private config : ConfigService) {
    super('projection-div');
    this.manager = config.managers[0];
    this.manager.initTimes(); // As soon as is created
    
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

    [this.xPathAnimation, this.yPathAnimation, this.zPathAnimation] = this.manager.getProjectionPath();


    [this.xPathDrawn, this.yPathDrawn, this.zPathDrawn] = this.manager.getProjectionPath(this.manager.pathTimes); // For drawing the path


    this.buildScaling(this.xPathAnimation, this.yPathAnimation, this.zPathAnimation);

    this.xPathAnimation = this.xPathAnimation.map(this.scalinFun);
    this.yPathAnimation = this.yPathAnimation.map(this.scalinFun);
    this.zPathAnimation = this.zPathAnimation.map(this.scalinFun);

    this.xPathDrawn = this.xPathDrawn.map(this.scalinFun);
    this.yPathDrawn = this.yPathDrawn.map(this.scalinFun);
    this.zPathDrawn = this.zPathDrawn.map(this.scalinFun);

    /* Primary and secondary in real view*/
    let primarySize = this.config.starViewSettings['primarySize'];
    let secondarySize = primarySize * this.config.starViewSettings['starScalingFun'](this.manager.getMassRatio());
    this.primaryReal = this.drawStar(this.starColorArray[0], primarySize);
    this.secondaryReal = this.drawStar(this.starColorArray[1], secondarySize);

    /* Real orbit line */
    let orbitReal = this.drawOrbitLine(this.xPathDrawn, this.yPathDrawn, this.zPathDrawn);

    /* projected orbit line */
    let orbitProj = this.drawOrbitLine(this.xPathDrawn, this.yPathDrawn, 0);

    /* Secondary in projected view*/
    this.secondaryProj = this.drawStarProjection(this.starColorArray[1], secondarySize);


    /** Size of orbit element indicators */
    let indicatorSize = primarySize * 0.3;

    /* Nodes */
    let [asc, desc] = this.manager.getNodesMain();
    asc = asc.map(this.scalinFun);
    desc = desc.map(this.scalinFun);

    this.ascMesh = this.drawNode('red', indicatorSize);
    this.ascMesh.position.set(asc[0], asc[1], asc[2]);

    this.descMesh = this.drawNode('blue', indicatorSize);
    this.descMesh.position.set(desc[0], desc[1], desc[2]);


    /* Line of nodes */
    let nSteps = 150;
    let nodesLine = this.drawOrbitLine(
      this.linspace(desc[0], asc[0], nSteps),
      this.linspace(desc[1], asc[1], nSteps),
      this.linspace(desc[2], asc[2], nSteps));


    /* periastron and apoastron */
    let [peri, apo] = this.manager.getPeriApoMain();
    peri = peri.map(this.scalinFun);
    apo = apo.map(this.scalinFun);
    this.periMesh = this.drawStar('purple', indicatorSize);
    this.periMesh.position.set(peri[0], peri[1], peri[2])

    this.apoMesh = this.drawStar('green', indicatorSize);
    this.apoMesh.position.set(apo[0], apo[1], apo[2])

    let periProjMesh = this.drawStarProjection('purple', indicatorSize);
    periProjMesh.position.set(peri[0], peri[1], 0)

    let apoProjMesh = this.drawStarProjection('green', indicatorSize);
    apoProjMesh.position.set(apo[0], apo[1], 0)

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

    this.index = (this.index + frames) % this.xPathAnimation.length;
    if(this.index < 0)
      this.index = this.xPathAnimation.length + this.index;

    let x = this.xPathAnimation[this.index];
    let y = this.yPathAnimation[this.index];
    let z = this.zPathAnimation[this.index];

    this.secondaryReal.position.set(x, y, z);
    this.secondaryProj.position.set(x, y, 0);

  }

  updateRotations(){
    this.primaryReal.quaternion.copy( this.camera.quaternion );
    this.secondaryReal.quaternion.copy( this.camera.quaternion );

    this.apoMesh.quaternion.copy( this.camera.quaternion );
    this.periMesh.quaternion.copy( this.camera.quaternion );

    this.ascMesh.quaternion.copy( this.camera.quaternion );
    this.descMesh.quaternion.copy( this.camera.quaternion );
  }

  /**
  * Draws the loaded records into the canvas as points.
  * @param {AstrometryRecord[]} An array of astrometry records
  * with the information ready to be displayed.
  */
  drawData(records : AstrometryRecord[]){ 

    let markersize = 2;
    let c = 0;

    for(let record of records){
      // Position of the marker
      let fact = Math.PI/180;
      let xPos = this.scale * record.rho * Math.cos(fact * record.PA + Math.PI/2);
      let yPos = this.scale * record.rho * Math.sin(fact * record.PA + Math.PI/2);
      let dataMesh = this.drawStarProjection(this.dataColor, markersize);
      dataMesh.position.set(xPos, yPos, 0)

      this.dataGroup.add(dataMesh);

      // Dotted line to actual position
      let posReal = this.manager.secondaryPositionFromTime(record.epoch);
      let [xPosReal, yPosReal, zPosReal] = posReal.map(this.scalinFun);

      //console.log(xPos, yPos, this.scale);
      //console.log(record.PA, record.rho)

 
      // Error bar
      //let eX = this.scale * record.error_rho * Math.cos(fact * record.PA + Math.PI/2);
      //let eY = this.scale * record.error_rho * Math.sin(fact * record.PA + Math.PI/2);

      let nSteps = 50;
      let segLen = 10;
      let diffLinePathX = this.linspace(xPos, xPosReal, nSteps);
      let diffLinePathY = this.linspace(yPos, yPosReal, nSteps);
      let diffLinePathZ = this.linspace(0, 0, nSteps);
      let diffLine = this.drawOrbitLine(diffLinePathX, diffLinePathY, diffLinePathZ,
                                          this.dataColor, segLen);



      let objName = "data-point-" + c;
      c += 1;
      
      dataMesh.name = objName;
      // Add this object's data to the dictionary
      this.objectDataDict[objName] = {
        "Rho ['']" : Number(record.rho).toPrecision(3),
        'Theta [°]' : Number(record.PA).toPrecision(6),
        'Epoch [yr]' : Number(record.epoch).toPrecision(6)
        };

   
    }
    this.scene.add(this.dataGroup);

  }

  
}

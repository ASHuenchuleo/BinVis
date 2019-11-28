import { Component, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { PosManagerService } from './../pos-manager.service';
import { ThreeDView} from './../three-d-view';
import {AstrometryRecord} from './../csv-parser';



import * as THREE from 'three'
import SpriteText from 'three-spritetext';
import OrbitControls from 'three-orbitcontrols';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
/** Handles and shows the velocity graph for the orbit */
export class MainViewComponent extends ThreeDView
          implements AfterViewInit, OnDestroy {

  /* Paths to be followed */
  private xPath : number[];
  private yPath : number[];
  private zPath : number[];

  /** Meshes of the moving objects */
  primaryReal : THREE.Mesh;

  secondaryReal : THREE.Mesh;
  secondaryProj : THREE.LineLoop;

  apoMesh : THREE.Mesh;
  periMesh : THREE.Mesh;

  ascMesh : THREE.Mesh;
  descMesh : THREE.Mesh;


  constructor(private manager : PosManagerService) {
  super('projection-div');
  }

  ngOnDestroy() : void{
    this.clean();
    let test = (obj = this.scene) =>
    {
          if (obj.children !== undefined) {
              while (obj.children.length > 0) {
                  this.clean(obj.children[0]);
              }
          }
      }
    test();
  }


  ngAfterViewInit()
  {
    this.divName = this.divName + '-' + this.cardClass;
    this.initScene();

    this.manager.buildProjectionPath();
    let path = this.manager.getProjectionPath();
    this.xPath = path[0];
    this.yPath = path[1];
    this.zPath = path[2];

    this.buildScaling(this.xPath, this.yPath, this.zPath);

    let scalinFun = (x) => {return this.scale * x;}
    this.xPath = this.xPath.map(scalinFun);
    this.yPath = this.yPath.map(scalinFun);
    this.zPath = this.zPath.map(scalinFun);


    /* Primary and secondary in real view*/
    let primarySize = 5;
    let secondarySize = primarySize * this.manager.getMassRatio();
    this.primaryReal = this.drawStar(this.primaryColor, primarySize);
    this.secondaryReal = this.drawStar(this.secondaryColor, secondarySize);

    /* Real orbit line */
    let orbitReal = this.drawOrbitLine(this.xPath, this.yPath, this.zPath);

    /* Secondary in projected view*/
    this.secondaryProj = this.drawStarProjection(this.secondaryColor, secondarySize);

    /* projected orbit line */
    let orbitProj = this.drawOrbitLine(this.xPath, this.yPath, 0);

    /** Size of orbit element indicators */
    let indicatorSize = primarySize * 0.3;

    /* Nodes */
    let [asc, desc] = this.manager.getNodesMain();
    asc = asc.map(scalinFun);
    desc = desc.map(scalinFun);

    this.ascMesh = this.drawNode('black', indicatorSize);
    this.ascMesh.position.set(asc[0], asc[1], asc[2]);

    this.descMesh = this.drawNode('black', indicatorSize);
    this.descMesh.position.set(desc[0], desc[1], desc[2]);


    /* Line of nodes */
    let nSteps = 150;
    let nodesLine = this.drawOrbitLine(
      this.linspace(desc[0], asc[0], nSteps),
      this.linspace(desc[1], asc[1], nSteps),
      this.linspace(desc[2], asc[2], nSteps));


    /* periastrum and apoastrum */
    let [peri, apo] = this.manager.getPeriApoMain();
    peri = peri.map(scalinFun);
    apo = apo.map(scalinFun);
    this.periMesh = this.drawStar('black', indicatorSize);
    this.periMesh.position.set(peri[0], peri[1], peri[2])

    this.apoMesh = this.drawStar('black', indicatorSize);
    this.apoMesh.position.set(apo[0], apo[1], apo[2])

    let periProjMesh = this.drawStarProjection('black', indicatorSize);
    periProjMesh.position.set(peri[0], peri[1], 0)

    let apoProjMesh = this.drawStarProjection('black', indicatorSize);
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

    this.index = (this.index + frames) % this.xPath.length;

    let x = this.xPath[this.index];
    let y = this.yPath[this.index];
    let z = this.zPath[this.index];

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
    for(let record of records){
      // Position of the marker
      let fact = Math.PI/180;
      let xPos = this.scale * record.rho * Math.cos(fact * record.PA + Math.PI/2);
      let yPos = this.scale * record.rho * Math.sin(fact * record.PA + Math.PI/2);
      let dataMesh = this.drawStarProjection('orange', markersize);
      dataMesh.position.set(xPos, yPos, 0)

      // Error bar
      let eX = this.scale * record.error_rho * Math.cos(fact * record.PA + Math.PI/2);
      let eY = this.scale * record.error_rho * Math.sin(fact * record.PA + Math.PI/2);

      let errorbar = this.drawLine(new THREE.Vector3(xPos + eX, yPos + eY, 0),
                            new THREE.Vector3(xPos - eX, yPos - eY, 0), 'orange');


    }

  }

  
}

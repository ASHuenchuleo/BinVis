import { Component, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { PosManagerService } from './../pos-manager.service';
import { ThreeDView} from './../three-d-view';

import {ViewComponent} from './../view.component';


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
          implements AfterViewInit, OnDestroy, ViewComponent {

  /* Paths to be followed */
  private xPath : number[];
  private yPath : number[];
  private zPath : number[];

  /* css class for the component view card */
  cardClass : string;


  constructor(private manager : PosManagerService) {
  super('projection-div');
  }

  ngOnDestroy() : void{
    this.clean();
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
    let primaryReal = this.drawStar(this.primaryColor, primarySize);
    let secondaryReal = this.drawStar(this.secondaryColor, secondarySize);

    /* Real orbit line */
    let orbitReal = this.drawOrbitLine(this.xPath, this.yPath, this.zPath);

    /* Secondary in projected view*/
    let secondaryProj = this.drawStarProjection(this.secondaryColor, secondarySize);

    /* projected orbit line */
    let orbitProj = this.drawOrbitLine(this.xPath, this.yPath, 0);

    /** Size of orbit element indicators */
    let indicatorSize = primarySize * 0.3;

    /* Nodes */
    let [asc, desc] = this.manager.getNodesMain();
    asc = asc.map(scalinFun);
    desc = desc.map(scalinFun);

    let ascMesh = this.drawNode('black', indicatorSize);
    ascMesh.position.set(asc[0], asc[1], asc[2]);

    let descMesh = this.drawNode('black', indicatorSize);
    descMesh.position.set(desc[0], desc[1], desc[2]);


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
    let periMesh = this.drawStar('black', indicatorSize);
    periMesh.position.set(peri[0], peri[1], peri[2])

    let apoMesh = this.drawStar('black', indicatorSize);
    apoMesh.position.set(apo[0], apo[1], apo[2])

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

    let animate = () => {
      if (!this.isPlay) return;

      this.controls.update();

      primaryReal.quaternion.copy( this.camera.quaternion );
      secondaryReal.quaternion.copy( this.camera.quaternion );

      apoMesh.quaternion.copy( this.camera.quaternion );
      periMesh.quaternion.copy( this.camera.quaternion );

      ascMesh.quaternion.copy( this.camera.quaternion );
      descMesh.quaternion.copy( this.camera.quaternion );


      let x = this.xPath[this.index];
      let y = this.yPath[this.index];
      let z = this.zPath[this.index];

      this.index = (this.index + this.speed) % this.xPath.length;

      secondaryReal.position.set(x, y, z);
      secondaryProj.position.set(x, y, 0);

      this.renderer.render( this.scene, this.camera );
      requestAnimationFrame( animate );

    }
    this.isPlay = true;
    animate()

  }

}

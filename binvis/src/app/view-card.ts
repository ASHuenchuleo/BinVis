import { Component, ViewChild, ComponentFactoryResolver } from '@angular/core';

import {ViewComponent} from './view.component';


import {ViewItem} from './view-item';
import {ViewWindow} from './view-window';
import {ViewDirective} from './view.directive';

import {VelocityViewComponent} from './velocity-view/velocity-view.component';
import {MainViewComponent} from './main-view/main-view.component';
import {DualOrbitViewComponent} from './dual-orbit-view/dual-orbit-view.component';

import { ConfigService} from './config.service';



export class ViewCardComponent{

  /* css class for the view card */
  cardClass : string;

  /* State for animation */
  state : string = "unloaded";

  /* Currently loaded component */
  componentRefInst : ViewComponent;

  /* Lists of views IN THE SAME ORDER AS THE ENUM */
  views = [
    new ViewItem(MainViewComponent),
    new ViewItem(DualOrbitViewComponent),
  	new ViewItem(VelocityViewComponent)
  	];

  @ViewChild(ViewDirective, {static: true}) viewHost : ViewDirective;

  constructor(protected config : ConfigService, protected componentFactoryResolver: ComponentFactoryResolver,
    update, animUpdate, dataUpdate, cardClass : string)
  {
    this.cardClass = cardClass;
    update.subscribe(
      selected => {
        this.loadComponent(selected);
      });
    animUpdate.subscribe(
      animComm => {
        this.componentRefInst.isRunning = animComm['running'];
        if(animComm['toMove'] != 0)
          this.componentRefInst.moveFrames(animComm['toMove']);
      });

    dataUpdate.subscribe(
      dataInput => {
          this.componentRefInst.showData(dataInput);
      });

  }

  loadComponent(selected : ViewWindow) {
    this.state = "unloaded";
    

    const viewItem = this.views[selected];
    
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(viewItem.component);
    
    const viewContainerRef = this.viewHost.viewContainerRef;
    
    viewContainerRef.clear();
    
    const componentRef = viewContainerRef.createComponent(componentFactory);

    this.componentRefInst = (<ViewComponent>componentRef.instance);

    this.componentRefInst.cardClass = this.cardClass;

    this.state = "loaded";
   }
}

import { Component, ViewChild, ComponentFactoryResolver } from '@angular/core';

import {ViewComponent} from './view.component';


import {ViewItem} from './view-item';
import {ViewWindow} from './view-window';
import {ViewDirective} from './view.directive';

import {VelocityViewComponent} from './velocity-view/velocity-view.component';
import {MainViewComponent} from './main-view/main-view.component';
import {DualOrbitViewComponent} from './dual-orbit-view/dual-orbit-view.component';
import {PrimaryCenteredHierarchicalComponent} from './primary-centered-hierarchical/primary-centered-hierarchical.component';


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
  	new ViewItem(VelocityViewComponent),
    new ViewItem(PrimaryCenteredHierarchicalComponent)
  	];

  @ViewChild(ViewDirective, {static: true}) viewHost : ViewDirective;

  constructor(protected config : ConfigService, protected componentFactoryResolver: ComponentFactoryResolver,
    update, animUpdate, dataUpdate, cardClass : string)
  {
    this.cardClass = cardClass;
    update.subscribe(
      selectedView => {
        this.loadComponent(selectedView);
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

  /**
  * Loads and selected view and inserts it in the DOM
  * @param {ViewWindow} selectedView The selected view in an enum to be loaded.
  */
  loadComponent(selectedView : ViewWindow) {
    this.state = "unloaded";
    
    const viewItem = this.views[selectedView];
    
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(viewItem.component);
    
    const viewContainerRef = this.viewHost.viewContainerRef;
    
    viewContainerRef.clear();
    
    const componentRef = viewContainerRef.createComponent(componentFactory);

    this.componentRefInst = (<ViewComponent>componentRef.instance); //Instance of the allocated component

    this.componentRefInst.cardClass = this.cardClass;

    this.state = "loaded";
   }
}

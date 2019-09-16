import { Component, ViewChild, ComponentFactoryResolver } from '@angular/core';


import {ViewItem} from './view-item';
import {ViewWindow} from './view-window';
import {ViewDirective} from './view.directive';

import {VelocityViewComponent} from './velocity-view/velocity-view.component';
import {MainViewComponent} from './main-view/main-view.component';
import {DualOrbitViewComponent} from './dual-orbit-view/dual-orbit-view.component';

import { ConfigService} from './config.service';


export class ViewCardComponent{

  views = [
    new ViewItem(MainViewComponent),
    new ViewItem(DualOrbitViewComponent),
  	new ViewItem(VelocityViewComponent)
  	];

  @ViewChild(ViewDirective, {static: true}) viewHost : ViewDirective;

  constructor(protected config : ConfigService, protected componentFactoryResolver: ComponentFactoryResolver)
  {

  }

  loadComponent(selected : ViewWindow) {
    

    const viewItem = this.views[selected];
    
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(viewItem.component);
    
    const viewContainerRef = this.viewHost.viewContainerRef;
    
    viewContainerRef.clear();
    
    const componentRef = viewContainerRef.createComponent(componentFactory);
   }

}

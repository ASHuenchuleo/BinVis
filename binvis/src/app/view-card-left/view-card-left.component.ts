import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

import { ConfigService} from '../config.service';
import {ViewCardComponent} from '../view-card'

@Component({
  selector: 'app-view-card-left',
  templateUrl: './view-card-left.component.html',
  styleUrls: ['./view-card-left.component.css'],
  animations : [
  trigger('balloonEffect', [
    state('unloaded', style({ opacity: 0})),
    state('loaded', style({ opacity: 1})),
     transition('loaded=>unloaded',[
          animate('1000ms')
          ]),
     transition('unloaded=>loaded',[
          animate('1000ms')
          ])
     ])]
})
/**
* Component for the left view card
*/
export class ViewCardLeftComponent extends ViewCardComponent {

  constructor(protected config : ConfigService, protected componentFactoryResolver: ComponentFactoryResolver) {
  	super(config, componentFactoryResolver);
    this.cardClass = 'view-card-left';
  	config.viewCardLeftUpdate$.subscribe(
  	  selected => {
  	    this.loadComponent(selected);
  	  });
  }

}

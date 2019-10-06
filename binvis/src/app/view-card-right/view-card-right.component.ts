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
  selector: 'app-view-card-right',
  templateUrl: './view-card-right.component.html',
  styleUrls: ['./view-card-right.component.css'],
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
* Component for the right view card
*/
export class ViewCardRightComponent extends ViewCardComponent {

	constructor(protected config : ConfigService, protected componentFactoryResolver: ComponentFactoryResolver) {
		super(config, componentFactoryResolver,
      config.viewCardRightUpdate$, config.viewCardRightAnimUpdate$,
      config.viewCardRightDataUpdate$, 'view-card-right');
	}



}

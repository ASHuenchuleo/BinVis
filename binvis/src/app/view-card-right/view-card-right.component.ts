import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { ConfigService} from '../config.service';

import {ViewCardComponent} from '../view-card'

@Component({
  selector: 'app-view-card-right',
  templateUrl: './view-card-right.component.html',
  styleUrls: ['./view-card-right.component.css']
})
/**
* Component for the right view card
*/
export class ViewCardRightComponent extends ViewCardComponent {

	constructor(protected config : ConfigService, protected componentFactoryResolver: ComponentFactoryResolver) {
		super(config, componentFactoryResolver);
		config.viewCardRightUpdate$.subscribe(
		  selected => {
		    this.loadComponent(selected);
        	console.log('Right component called with ' + selected);

		  });

	}



}

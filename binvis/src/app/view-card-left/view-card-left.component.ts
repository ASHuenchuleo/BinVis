import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { ConfigService} from '../config.service';


import {ViewCardComponent} from '../view-card'

@Component({
  selector: 'app-view-card-left',
  templateUrl: './view-card-left.component.html',
  styleUrls: ['./view-card-left.component.css']
})
/**
* Component for the left view card
*/
export class ViewCardLeftComponent extends ViewCardComponent {

  constructor(protected config : ConfigService, protected componentFactoryResolver: ComponentFactoryResolver) {
  	super(config, componentFactoryResolver);
  	config.viewCardLeftUpdate$.subscribe(
  	  selected => {
  	    this.loadComponent(selected);
        console.log('Left component called with ' + selected);
  	  });
  }

}

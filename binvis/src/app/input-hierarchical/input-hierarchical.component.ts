import { Component, ViewChild, ViewChildren, Input, QueryList} from '@angular/core';

import {OrbitAttribute} from '../orbit-attribute'
import {ConfigService} from '../config.service';
import {ViewWindow} from '../view-window';

import {PropertyInputComponent} from '../property-input/property-input.component';
import {ViewSelectionComponent} from '../view-selection/view-selection.component';
import { FileInputComponent } from '../file-input/file-input.component';

import {InputBasic} from '../input-basic';

@Component({
  selector: 'app-input-hierarchical',
  templateUrl: './input-hierarchical.component.html',
  styleUrls: ['./input-hierarchical.component.css']
})
/**
* Handles all inputs and sends a message to update the parameters and do the
* calculations, and then calls the selected views to be shown
*/
export class InputHierarchicalComponent extends InputBasic{

	/**
	* Contains the options to be displayed
	*/

	viewOptions = [
	  {id: ViewWindow.PrimaryHierarchy, name: "Relative to A"},
	  {id: ViewWindow.CMHierarchy, name: "Relative to AB CM"}
	];

	leftView = this.viewOptions[0];
	rightView = this.viewOptions[0];

	
	constructor(protected config : ConfigService) {
		super(config);
	}

}

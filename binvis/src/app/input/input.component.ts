import { Component, ViewChild, Input} from '@angular/core';

import {OrbitAttribute} from '../orbit-attribute'
import {ConfigService} from '../config.service';
import {ViewWindow} from '../view-window';
import {InputBasic} from '../input-basic';


import {PropertyInputComponent} from '../property-input/property-input.component';
import {ViewSelectionComponent} from '../view-selection/view-selection.component';
import { FileInputComponent } from '../file-input/file-input.component';



@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
/**
* Handles all inputs and sends a message to update the parameters and do the
* calculations, and then calls the selected views to be shown
*/
export class InputComponent extends InputBasic{

	/**
	* Contains the options to be displayed
	*/
	viewOptions = [
	  {id: ViewWindow.Main, name: "3D Relative to A"},
	  {id: ViewWindow.CM, name: "3D Relative to CM"},
	  {id: ViewWindow.Vel, name: "Velocity Graph"},
	];


	leftView = this.viewOptions[0];
	rightView = this.viewOptions[2];
	
	constructor(protected config : ConfigService) {
		super(config);
	}
}

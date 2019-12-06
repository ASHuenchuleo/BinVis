import { Component, OnInit, Input } from '@angular/core';
import {ViewWindow} from '../view-window';

@Component({
  selector: 'app-view-selection',
  templateUrl: './view-selection.component.html',
  styleUrls: ['./view-selection.component.css']
})
export class ViewSelectionComponent implements OnInit {

  /**
  * Contains the options to be displayed
  */
  @Input('viewOptions') viewOptions;

  @Input('leftView') leftView;
  @Input('rightView') rightView;
  
  constructor() { }

  ngOnInit() {

  }

}

import { Component, OnInit } from '@angular/core';
import {ViewWindow} from '../view-window';

@Component({
  selector: 'app-view-selection',
  templateUrl: './view-selection.component.html',
  styleUrls: ['./view-selection.component.css']
})
export class ViewSelectionComponent implements OnInit {

  viewOptions = [
    {id: ViewWindow.Main, name: "Primary Component"},
    {id: ViewWindow.CM, name: "Centre of Mass"},
    {id: ViewWindow.Vel, name: "Velocity Graph"}
  ];

  leftView = this.viewOptions[0];
  rightView = this.viewOptions[2];
  
  constructor() { }

  ngOnInit() {
  }

}

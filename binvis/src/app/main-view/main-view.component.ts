import { Component, OnInit } from '@angular/core';
import { KeplerSolverService } from './../kepler-solver.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewComponent implements OnInit {
  test : number = 10;

  constructor(private solver : KeplerSolverService) {

  }
  //constructor(){}

  ngOnInit() {
  	var solver = new KeplerSolverService();
  	solver.init(1 , 2, 3, 4, 5, 6, 0.5);
  	var pos = solver.apparentPosition(100);
  	this.test = pos;
  }

}

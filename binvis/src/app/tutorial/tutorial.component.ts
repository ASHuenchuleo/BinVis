import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})
export class TutorialComponent implements OnInit {

  primary_mass_formula = 'M_\\odot = \\large{\\left(\\frac{a}{\\Pi}\\right)^3 \\left(\\frac{2\\pi}{P}\\right)^2 \\frac{1}{G(1 + q)}}';
  primary_mass_formula_prop = {displayMode: true};

  pi_eq = '\\pi';
  Pi_eq = '\\Pi';
  constructor() { }

  ngOnInit() {
  }

}

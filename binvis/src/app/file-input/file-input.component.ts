import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.css']
})
export class FileInputComponent implements OnInit {

  /* Date type for the velocity data */
  dateVelocityOptions = [
  {id: 0, name: "Julian Days"},
  {id: 1, name: "Julian Years"},
  {id: 2, name: "Besselian Years"},
  ];

  dateVelocity = this.dateVelocityOptions[1];

  /* Files to be recieved */
  astrometryFile : File = null;

  velocityFile : File = null;
  
  
  constructor() { }

  ngOnInit() {
  }

  handleAstrometricDataInput(files : FileList){
      this.astrometryFile = files.item(0);
  }

  handleVelocityDataInput(files : FileList){
      this.velocityFile = files.item(0);
  }


}

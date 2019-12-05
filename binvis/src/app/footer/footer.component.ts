import { Component, OnInit } from '@angular/core';
/**
* WORKAROUND, service is not initialized before the first
* message is sent because the components that inyect it
* don't exist before the message
*/


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

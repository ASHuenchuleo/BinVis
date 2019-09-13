import { Injectable } from '@angular/core';
import {OrbitAttribute} from './orbit-attribute'
import { Subject }    from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  /*
  * Class responsible for recieving parameter inputs and updating the logic and every view
  */

  // Observable string sources
  private posManagerUpdateSource = new Subject<OrbitAttribute[]>();
  private mainViewUpdateSource = new Subject<OrbitAttribute[]>();
  private dualOrbitViewUpdateSource = new Subject<OrbitAttribute[]>();
  private velocityViewUpdateSource = new Subject<OrbitAttribute[]>();

  // Observable string streams
  posManagerUpdate$ = this.posManagerUpdateSource.asObservable();
  mainViewUpdate$ = this.mainViewUpdateSource.asObservable();
  dualOrbitViewUpdate$ = this.dualOrbitViewUpdateSource.asObservable();
  velocityViewUpdate$ = this.velocityViewUpdateSource.asObservable();

  constructor() { }


  updateSceneAttr(attributes : OrbitAttribute[])
  {
  	this.posManagerUpdateSource.next(attributes);
  	this.mainViewUpdateSource.next();
  	this.dualOrbitViewUpdateSource.next();
  	this.velocityViewUpdateSource.next();
  }	
}

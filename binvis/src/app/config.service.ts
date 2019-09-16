import { Injectable } from '@angular/core';
import {OrbitAttribute} from './orbit-attribute'
import { timer, Subject }    from 'rxjs';

import {ViewWindow} from './view-window';
import {ViewItem} from './view-item';



@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  /*
  * Class responsible for recieving parameter inputs and updating the logic and every view
  */

  // Observable string sources
  private posManagerUpdateSource = new Subject<OrbitAttribute[]>();
  private viewCardLeftUpdateSource = new Subject<ViewWindow>();
  private viewCardRightUpdateSource = new Subject<ViewWindow>();

  // Observable string streams
  posManagerUpdate$ = this.posManagerUpdateSource.asObservable();
  viewCardLeftUpdate$ = this.viewCardLeftUpdateSource.asObservable();
  viewCardRightUpdate$ = this.viewCardRightUpdateSource.asObservable();

  loading;

  constructor() {}


                                      
  /**
  * Sends messages to the respective components to update the data and display
  * the selected views
  * @param {OrbitAttribute[]} attributes The numeric attributes for the orbit
  * @param {ViewWindow} leftView The selected view window for the left view
  * @param {ViewWindow} leftView The selected view window for the right view
  */
  updateSceneAttr(attributes : OrbitAttribute[], leftView : ViewWindow, rightView : ViewWindow)
  {

    console.log('Called to update the posmanager');
    this.posManagerUpdateSource.next(attributes);
    this.viewCardLeftUpdateSource.next(leftView);
    this.viewCardRightUpdateSource.next(rightView);

  }	
}

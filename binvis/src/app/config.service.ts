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
  * Class responsible for recieving parameter inputs and updating the logic, every view
  * and the derived parameteers
  */

  // Observable string sources
  private posManagerUpdateSource = new Subject<OrbitAttribute[]>();
  private derivedParametersUpdateSource = new Subject<any>();
  private viewCardLeftUpdateSource = new Subject<ViewWindow>();
  private viewCardRightUpdateSource = new Subject<ViewWindow>();

  // Observable string streams
  posManagerUpdate$ = this.posManagerUpdateSource.asObservable();
  derivedParametersUpdate$ = this.derivedParametersUpdateSource.asObservable();
  viewCardLeftUpdate$ = this.viewCardLeftUpdateSource.asObservable();
  viewCardRightUpdate$ = this.viewCardRightUpdateSource.asObservable();

                                      
  /**
  * Sends messages to the respective components to update the data and display
  * the selected views
  * @param {OrbitAttribute[]} attributes The numeric attributes for the orbit
  * @param {ViewWindow} leftView The selected view window for the left view
  * @param {ViewWindow} leftView The selected view window for the right view
  */
  updateSceneAttr(attributes : OrbitAttribute[], leftView : ViewWindow, rightView : ViewWindow)
  {
    this.posManagerUpdateSource.next(attributes); // Do calculations
    this.derivedParametersUpdateSource.next(); // Update derived parameters
    this.viewCardLeftUpdateSource.next(leftView); // Update left viewcard
    this.viewCardRightUpdateSource.next(rightView); // Update right viewcard

  }	
}

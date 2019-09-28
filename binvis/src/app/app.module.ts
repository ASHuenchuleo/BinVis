import { BrowserModule, } from '@angular/platform-browser';
import { NgModule, ErrorHandler, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MainViewComponent } from './main-view/main-view.component';

import { GlobalErrorHandlerService } from './error-handler';
import { VelocityViewComponent } from './velocity-view/velocity-view.component';
import { DualOrbitViewComponent } from './dual-orbit-view/dual-orbit-view.component';
import { PropInputComponent } from './prop-input/prop-input.component';
import { FooterComponent } from './footer/footer.component';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { ViewDirective } from './view.directive';
import { ViewCardLeftComponent } from './view-card-left/view-card-left.component';
import { ViewCardRightComponent } from './view-card-right/view-card-right.component';
import { DerivedParametersComponent } from './derived-parameters/derived-parameters.component';


@NgModule({
  entryComponents: [
    MainViewComponent,
    VelocityViewComponent,
    DualOrbitViewComponent],
  declarations: [
    AppComponent,
    MainViewComponent,
    VelocityViewComponent,
    DualOrbitViewComponent,
    PropInputComponent,
    FooterComponent,
    ViewDirective,
    ViewCardLeftComponent,
    ViewCardRightComponent,
    DerivedParametersComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MDBBootstrapModule.forRoot()
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  providers: [{
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }

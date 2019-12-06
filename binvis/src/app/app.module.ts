import { BrowserModule, } from '@angular/platform-browser';
import { NgModule, ErrorHandler, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MainViewComponent } from './main-view/main-view.component';

import { GlobalErrorHandlerService } from './error-handler';
import { VelocityViewComponent } from './velocity-view/velocity-view.component';
import { DualOrbitViewComponent } from './dual-orbit-view/dual-orbit-view.component';
import { InputComponent } from './input/input.component';
import { FooterComponent } from './footer/footer.component';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { ViewDirective } from './view.directive';
import { ViewCardLeftComponent } from './view-card-left/view-card-left.component';
import { ViewCardRightComponent } from './view-card-right/view-card-right.component';
import { DerivedParametersComponent } from './derived-parameters/derived-parameters.component';
import { AboutComponent } from './about/about.component';
import { BinaryComponent } from './binary/binary.component';
import { AppRoutingModule } from './app-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { HierarchicComponent } from './hierarchic/hierarchic.component';
import { PropertyInputComponent } from './property-input/property-input.component';
import { ViewSelectionComponent } from './view-selection/view-selection.component';
import { FileInputComponent } from './file-input/file-input.component';
import { InputHierarchicalComponent } from './input-hierarchical/input-hierarchical.component';

import {MatExpansionModule} from '@angular/material/expansion';
import { PrimaryCenteredHierarchicalComponent } from './primary-centered-hierarchical/primary-centered-hierarchical.component';


@NgModule({
  entryComponents: [
    MainViewComponent,
    VelocityViewComponent,
    DualOrbitViewComponent,
    PrimaryCenteredHierarchicalComponent],
  declarations: [
    AppComponent,
    MainViewComponent,
    VelocityViewComponent,
    DualOrbitViewComponent,
    InputComponent,
    FooterComponent,
    ViewDirective,
    ViewCardLeftComponent,
    ViewCardRightComponent,
    DerivedParametersComponent,
    AboutComponent,
    BinaryComponent,
    NavbarComponent,
    HierarchicComponent,
    PropertyInputComponent,
    ViewSelectionComponent,
    FileInputComponent,
    InputHierarchicalComponent,
    PrimaryCenteredHierarchicalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MDBBootstrapModule.forRoot(),
    AppRoutingModule,
    MatExpansionModule
  ],
  exports : [
   MatExpansionModule
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  providers: [{
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule, } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MainViewComponent } from './main-view/main-view.component';

import { GlobalErrorHandlerService } from './error-handler';
import { VelocityViewComponent } from './velocity-view/velocity-view.component';
import { DualOrbitViewComponent } from './dual-orbit-view/dual-orbit-view.component';
import { PropInputComponent } from './prop-input/prop-input.component';

import {MathJaxModule} from 'ngx-mathjax';
import { FooterComponent } from './footer/footer.component';


@NgModule({
  declarations: [
    AppComponent,
    MainViewComponent,
    VelocityViewComponent,
    DualOrbitViewComponent,
    PropInputComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MathJaxModule.forRoot({
          version: '2.7.5',
          config: 'TeX-AMS_HTML',
          hostname: 'cdnjs.cloudflare.com'
        })
  ],
  providers: [{
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }

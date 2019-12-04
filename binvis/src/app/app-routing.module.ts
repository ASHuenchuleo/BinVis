import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BinaryComponent } from './binary/binary.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  { path: 'binary', component: BinaryComponent },
  { path: 'about', component: AboutComponent },
  { path: '', redirectTo: '/binary', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

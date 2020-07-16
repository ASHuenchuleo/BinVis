import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BinaryComponent } from './binary/binary.component';
import { HierarchicComponent } from './hierarchic/hierarchic.component';
import { AboutComponent } from './about/about.component';
import { TutorialComponent } from './tutorial/tutorial.component';

const routes: Routes = [
  { path: 'binary', component: BinaryComponent },
  { path: 'hierarchic', component: HierarchicComponent },
  { path: 'about', component: AboutComponent },
  { path: 'tutorial', component: TutorialComponent },
  { path: '', redirectTo: '/binary', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

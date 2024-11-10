import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GraphComponent } from './components/graph/graph.component';

const routes: Routes = [
  { path: 'graph/:name', component: GraphComponent }, // Route con parametro dinamico "name"
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

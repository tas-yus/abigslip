import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from "./home/home.component";
import { StudentShowComponent } from "./student/student-show/student-show.component";
import { StudentEditComponent } from "./student/student-edit/student-edit.component";
import { OrderEditComponent } from './order/order-edit/order-edit.component';

const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'students/:id', component: StudentShowComponent },
  { path: 'students/edit', component: StudentEditComponent },
  { path: 'orders/:id/edit', component: OrderEditComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}

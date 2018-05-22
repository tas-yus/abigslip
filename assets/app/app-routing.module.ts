import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from "./home/home.component";
import { StudentShowComponent } from "./student/student-show/student-show.component";
import { StudentEditComponent } from "./student/student-edit/student-edit.component";
import { StudentListComponent } from "./student/student-list/student-list.component";
import { BookListComponent } from "./book/book-list/book-list.component";
import { BookShowComponent } from "./book/book-show/book-show.component";
import { OrderEditComponent } from './order/order-edit/order-edit.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { OrderSearchComponent } from './order/order-search/order-search.component';
import { LoginComponent } from './login/login.component';
import { SettingComponent } from './setting/setting.component';
import { SettingCourseComponent } from './setting/setting-course/setting-course.component';
import { SettingCourseEditComponent } from './setting/setting-course-edit/setting-course-edit.component';
import { SettingUserComponent } from './setting/setting-user/setting-user.component';
import { AuthGuard } from './auth-guard.service';

const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'  },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'students', component: StudentListComponent, canActivate: [AuthGuard] },
  { path: 'books', component: BookListComponent, canActivate: [AuthGuard] },
  { path: 'books/:id', component: BookShowComponent, canActivate: [AuthGuard] },
  { path: 'students/:id', component: StudentShowComponent, canActivate: [AuthGuard] },
  { path: 'students/edit', component: StudentEditComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrderListComponent, canActivate: [AuthGuard] },
  { path: 'orders/:id/edit', component: OrderEditComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingComponent, canActivate: [AuthGuard], children: [
    { path: '', redirectTo: 'courses', pathMatch: 'full' },
    { path: 'courses', component: SettingCourseComponent },
    { path: 'courses/:id/edit', component: SettingCourseEditComponent },
    { path: 'users', component: SettingUserComponent },
  ]}
];
@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}

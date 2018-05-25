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
import { SettingGroupComponent } from './setting/setting-group/setting-group.component';
import { SettingCourseEditComponent } from './setting/setting-course-edit/setting-course-edit.component';
import { SettingCourseComponent } from './setting/setting-course/setting-course.component';
import { SettingBookComponent } from './setting/setting-book/setting-book.component';
import { SettingGroupEditComponent } from './setting/setting-group-edit/setting-group-edit.component';
import { SettingUserComponent } from './setting/setting-user/setting-user.component';
import { AuthGuard } from './auth-guard.service';
import { AdminGuard } from './admin-guard.service';
import { SettingGuard } from './setting-guard.service';


const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'  },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'students', component: StudentListComponent, canActivate: [AuthGuard] },
  { path: 'books', component: BookListComponent, canActivate: [AuthGuard] },
  { path: 'books/:id', component: BookShowComponent, canActivate: [AuthGuard] },
  { path: 'students/:id', component: StudentShowComponent, canActivate: [AuthGuard] },
  { path: 'students/edit', component: StudentEditComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrderListComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'orders/:id/edit', component: OrderEditComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'settings', component: SettingComponent, canActivate: [AuthGuard, SettingGuard], children: [
    { path: '', redirectTo: 'groups', pathMatch: 'full' },
    { path: 'groups', component: SettingGroupComponent },
    { path: 'courses', component: SettingCourseComponent },
    { path: 'books', component: SettingBookComponent },
    { path: 'groups/:id/edit', component: SettingGroupEditComponent },
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

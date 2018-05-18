import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { StudentAddComponent } from "./student/student-add/student-add.component";
import { StudentShowComponent } from "./student/student-show/student-show.component";
import { StudentEditComponent } from "./student/student-edit/student-edit.component";
import { StudentListComponent } from "./student/student-list/student-list.component";
import { StudentSearchComponent } from "./student/student-search/student-search.component";
import { OrderEditComponent } from './order/order-edit/order-edit.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { OrderSearchComponent } from './order/order-search/order-search.component';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        StudentAddComponent,
        StudentEditComponent,
        StudentShowComponent,
        StudentSearchComponent,
        OrderEditComponent,
        OrderSearchComponent,
        LoginComponent,
        HeaderComponent,
        StudentListComponent,
        OrderListComponent
    ],
    imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule],
    providers: [AuthService, AuthGuard],
    bootstrap: [AppComponent]
})
export class AppModule {

}

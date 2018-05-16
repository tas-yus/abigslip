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
import { OrderEditComponent } from './order/order-edit/order-edit.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        StudentAddComponent,
        StudentEditComponent,
        StudentShowComponent,
        OrderEditComponent
    ],
    imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule],
    bootstrap: [AppComponent]
})
export class AppModule {

}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';

import { AppComponent } from './app.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { HeaderComponent } from './header/header.component';
import { AuthInterceptor } from './auth/services/auth.interceptor.service';
import { UsersModule } from './user/users.module';
import { MainPageModule } from './main-page/main-page.module';
import { LoansModule } from './loans/loans.module';
import { EditPageComponent } from './edit-page/edit-page.component';
import { AuthorSectionComponent } from './edit-page/author-section/author-section.component';
import { BookSectionComponent } from './edit-page/book-section/book-section.component';
import { DepartmentSectionComponent } from './edit-page/department-section/department-section.component';
import { GenreSectionComponent } from './edit-page/genre-section/genre-section.component';
import { StudentSectionComponent } from './edit-page/student-section/student-section.component';

@NgModule({
    declarations: [AppComponent, ErrorPageComponent, HeaderComponent, EditPageComponent, AuthorSectionComponent, BookSectionComponent, DepartmentSectionComponent, GenreSectionComponent, StudentSectionComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        SharedModule,
        AuthModule,
        UsersModule,
        MainPageModule,
        LoansModule,
        AppRoutingModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}

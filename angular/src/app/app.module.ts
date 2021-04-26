import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from '@shared/shared.module';
import { AuthModule } from './containers/auth/auth.module';

import { AppComponent } from './app.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { HeaderComponent } from './components/header/header.component';
import { EditPageComponent } from './components/edit-page/edit-page.component';
import { AuthorSectionComponent } from './components/edit-page/author-section/author-section.component';
import { BookSectionComponent } from './components/edit-page/book-section/book-section.component';
import { DepartmentSectionComponent } from './components/edit-page/department-section/department-section.component';
import { GenreSectionComponent } from './components/edit-page/genre-section/genre-section.component';
import { StudentSectionComponent } from './components/edit-page/student-section/student-section.component';

import { AuthInterceptor } from './services/auth.interceptor.service';

import { MainPageModule } from './containers/main-page/main-page.module';
import { UsersModule } from './containers/user/users.module';
import { LoansModule } from './containers/loans/loans.module';
import { LibrariansModule } from './containers/librarians/librarians.module';
import { StudentsModule } from './containers/students/students.module';
import { ScheduleSectionComponent } from './components/edit-page/schedule-section/schedule-section.component';
import { PeriodSectionComponent } from './components/edit-page/period-section/period-section.component';
import { MyOrdersModalComponent } from './components/header/my-orders-modal/my-orders-modal.component';
import { LibrarianSectionComponent } from './components/edit-page/librarian-section/librarian-section.component';
import { NgxsModule, NoopNgxsExecutionStrategy } from '@ngxs/store';
import { UserState } from './store/user.state';
import { environment } from '../environments/environment';
import { StudentState } from './store/student.state';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY } from '@angular/material/autocomplete';
import { CloseScrollStrategy, Overlay } from '@angular/cdk/overlay';

export function scrollFactory(overlay: Overlay): () => CloseScrollStrategy {
    return () => overlay.scrollStrategies.close();
}

@NgModule({
    declarations: [
        AppComponent,
        ErrorPageComponent,
        HeaderComponent,
        EditPageComponent,
        AuthorSectionComponent,
        BookSectionComponent,
        DepartmentSectionComponent,
        GenreSectionComponent,
        StudentSectionComponent,
        ScheduleSectionComponent,
        PeriodSectionComponent,
        MyOrdersModalComponent,
        LibrarianSectionComponent
    ],
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
        LibrariansModule,
        StudentsModule,
        AppRoutingModule,
        NgxsModule.forRoot([UserState, StudentState], {
            executionStrategy: NoopNgxsExecutionStrategy,
            developmentMode: !environment.production
        }),
    ],
    providers: [
        {
            provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
            useFactory: scrollFactory,
            deps: [Overlay]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    entryComponents: [MyOrdersModalComponent],
    bootstrap: [AppComponent]
})
export class AppModule {}

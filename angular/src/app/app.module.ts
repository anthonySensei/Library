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
import { GenreSectionComponent } from './components/edit-page/genre-section/genre-section.component';

import { AuthInterceptor } from './services/auth.interceptor.service';

import { MainPageModule } from './containers/main-page/main-page.module';
import { UsersModule } from './containers/user/users.module';
import { LoansModule } from './containers/loans/loans.module';
import { LibrariansModule } from './containers/librarians/librarians.module';
import { StudentsModule } from './containers/students/students.module';
import { ScheduleSectionComponent } from './components/edit-page/schedule-section/schedule-section.component';
import { PeriodSectionComponent } from './components/edit-page/period-section/period-section.component';
import { MyOrdersModalComponent } from './components/header/my-orders-modal/my-orders-modal.component';
import { NgxsModule, NoopNgxsExecutionStrategy } from '@ngxs/store';
import { UserState } from './store/state/user.state';
import { environment } from '../environments/environment';
import { StudentState } from './store/state/student.state';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY } from '@angular/material/autocomplete';
import { CloseScrollStrategy, Overlay } from '@angular/cdk/overlay';
import { LibrarianState } from './store/state/librarian.state';
import { HttpErrorInterceptor } from './interceptors/error.interceptor';
import { GenreState } from './store/state/genre.state';
import { AuthorState } from './store/state/author.state';
import { AuthorPopupComponent } from './components/popups/author-popup/author-popup.component';
import { GenrePopupComponent } from './components/popups/genre-popup/genre-popup.component';
import { BookPopupComponent } from './components/popups/book-popup/book-popup.component';
import { BookState } from './store/state/book.state';
import { DisableFormControlDirective } from './directives/disableFormControl.directive';

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
        GenreSectionComponent,
        ScheduleSectionComponent,
        PeriodSectionComponent,
        MyOrdersModalComponent,
        AuthorPopupComponent,
        GenrePopupComponent,
        BookPopupComponent,
        DisableFormControlDirective
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
        NgxsModule.forRoot([UserState, StudentState, LibrarianState, GenreState, AuthorState, BookState], {
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
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpErrorInterceptor,
            multi: true
        }
    ],
    entryComponents: [MyOrdersModalComponent, AuthorPopupComponent],
    bootstrap: [AppComponent]
})
export class AppModule {}

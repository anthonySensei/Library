import { Component, OnInit } from '@angular/core';
import { Department } from '../main-page/models/department.model';
import { Author } from '../main-page/models/author.model';
import { Genre } from '../main-page/models/genre.model';
import { DepartmentService } from '../main-page/services/department.service';
import { AuthorService } from '../main-page/services/author.service';
import { GenreService } from '../main-page/services/genre.service';
import { BookService } from '../main-page/services/book.service';
import { ResponseService } from '../shared/services/response.service';
import { MaterialService } from '../shared/services/material.service';
import { Subscription } from 'rxjs';
import { Student } from '../user/models/student.model';
import { StudentService } from '../user/services/student.service';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.sass']
})
export class EditPageComponent implements OnInit {
    departments: Department[];
    authors: Author[];
    genres: Genre[];
    students: Student[];

    responseSubscription: Subscription;

    departmentsFetchSubscription: Subscription;
    departmentChangeSubscription: Subscription;
    authorsFetchSubscription: Subscription;
    authorsChangeSubscription: Subscription;
    genresFetchSubscription: Subscription;
    genresChangeSubscription: Subscription;
    studentsSubscription: Subscription;
    studentsChangedSubscription: Subscription;

    departmentSelect = null;
    departmentAddress = null;
    genreSelect = null;
    genreName = null;
    authorSelect = null;
    authorName = null;
    studentSelect = null;
    studentReaderTicket = null;
    studentEmail = null;

    constructor(
        private bookService: BookService,
        private departmentService: DepartmentService,
        private authorService: AuthorService,
        private genreService: GenreService,
        private responseService: ResponseService,
        public materialService: MaterialService,
        private studentService: StudentService
    ) {}

    ngOnInit() {
        this.selectsValuesSubscriptionHandle();
    }

    selectsValuesSubscriptionHandle() {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentChangeSubscription = this.departmentService.departmentsChanged.subscribe(
            departments => {
                this.departments = departments;
            }
        );
        this.authorsFetchSubscription = this.authorService
            .fetchAllAuthorsHttp()
            .subscribe();
        this.authorsChangeSubscription = this.authorService.authorsChanged.subscribe(
            authors => {
                this.authors = authors;
            }
        );
        this.genresFetchSubscription = this.genreService
            .fetchAllGenresHttp()
            .subscribe();
        this.genresChangeSubscription = this.genreService.genresChanged.subscribe(
            genres => {
                this.genres = genres;
            }
        );
        this.studentsSubscription = this.studentService
            .getStudentsHttp()
            .subscribe();
        this.studentsChangedSubscription = this.studentService.studentsChanged.subscribe(
            students => {
                this.students = students;
            }
        );
    }

    setDepartmentAddress() {
        const department = this.departments.find(
            dep => dep.id === this.departmentSelect
        );
        this.departmentAddress = department.address;
    }

    setGenreName() {
        const genre = this.genres.find(gen => gen.id === this.genreSelect);
        this.genreName = genre.name;
    }
    setAuthorName() {
        const author = this.authors.find(aut => aut.id === this.authorSelect);
        this.authorName = author.name;
    }
    setStudentData() {
        const student = this.students.find(st => st.id === this.studentSelect);
        this.studentReaderTicket = student.readerTicket;
        this.studentEmail = student.email;
    }
}

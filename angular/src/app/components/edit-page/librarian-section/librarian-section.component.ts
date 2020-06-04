import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import { ResponseService } from '../../../services/response.service';
import { Librarian } from '../../../models/librarian.model';
import { LibrarianService } from '../../../services/librarian.service';
import { Department } from '../../../models/department.model';
import { Router } from '@angular/router';
import { AngularLinks } from '../../../constants/angularLinks';
import { Subscription } from 'rxjs';
import { ConfirmDeleteModalComponent } from '../../../shared/confirm-delete-modal/confirm-delete-modal.component';
import { ModalWidth } from '../../../constants/modalWidth';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-librarian-section',
    templateUrl: './librarian-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class LibrarianSectionComponent implements OnInit, OnDestroy {
    @Output() nothingToChange = new EventEmitter();
    @Output() setLibrarians = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() librarianService: LibrarianService;
    @Input() librarians: Librarian[];
    @Input() departments: Department[];

    links = AngularLinks;

    librarianEditSubscription: Subscription;
    librarianDeleteSubscription: Subscription;

    librarianSelect: number;
    librarianDepartment: number;
    librarianEmail: string;

    error: string;

    constructor(private router: Router, private dialog: MatDialog) {}

    ngOnInit() {}

    addLibrarian() {
        this.router.navigate(['/', this.links.LIBRARIANS, 'add']);
    }

    getLibrarian(): Librarian {
        return this.librarians.find(
            (lib: Librarian) => lib.id === this.librarianSelect
        );
    }

    setLibrarianData(): void {
        if (this.librarianSelect) {
            this.librarianDepartment = this.getLibrarian().department.id;
            this.librarianEmail = this.getLibrarian().email;
        }
    }

    editLibrarian(): void {
        if (!this.librarianEmail || !this.librarianDepartment) {
            return;
        }
        if (
            this.librarianEmail === this.getLibrarian().email &&
            this.librarianDepartment === this.getLibrarian().department.id
        ) {
            this.nothingToChange.emit();
            return;
        }
        this.librarianEditSubscription = this.librarianService
            .ediLibrarianHttp(
                this.librarianSelect,
                this.librarianEmail,
                this.librarianDepartment
            )
            .subscribe(() => {
                this.librarianResponseHandler();
            });
    }

    deleteLibrarian(): void {
        if (!this.librarianSelect) {
            return;
        }
        this.librarianDeleteSubscription = this.librarianService
            .deleteLibrarianHttp(this.librarianSelect)
            .subscribe(() => {
                this.librarianResponseHandler();
            });
    }

    openConfirmDeleteDialog(): void {
        const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
            width: ModalWidth.W30P
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteLibrarian();
            }
        });
    }

    librarianResponseHandler(): void {
        if (this.responseService.responseHandle()) {
            this.setLibrarians.emit();
            this.librarianSelect = null;
            this.librarianEmail = null;
            this.librarianDepartment = null;
        }
    }

    ngOnDestroy(): void {
        if (this.librarianDeleteSubscription) {
            this.librarianDeleteSubscription.unsubscribe();
        }
        if (this.librarianEditSubscription) {
            this.librarianEditSubscription.unsubscribe();
        }
    }
}

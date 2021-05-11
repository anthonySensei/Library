import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { DeleteLanguage, LanguageState } from '../../../store/state/language.state';
import { Language } from '../../../models/language.model';
import { LanguagePopupComponent } from '../../popups/language-popup/language-popup.component';

@Component({
  selector: 'app-language-section',
  templateUrl: './language-section.component.html',
  styleUrls: ['./language-section.component.scss']
})
export class LanguageSectionComponent implements OnInit, OnDestroy {

  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['englishTitle', 'code', 'actions'];

  @Select(LanguageState.Languages)
  languages$: Observable<Language[]>;

  constructor(
      private store: Store,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getLanguages();
  }

  getLanguages() {
    this.languages$.pipe(untilDestroyed(this)).subscribe(languages => this.dataSource = new MatTableDataSource(languages));
  }

  openConfirmDeleteDialog(): void {
    // const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
    //     width: ModalWidth.W30P
    // });
    //
    // dialogRef.afterClosed().subscribe(result => {
    //     if (result) {
    //         this.onDeleteAuthor();
    //     }
    // });
  }

  openLanguagePopup(data: Language) {
    this.dialog.open(LanguagePopupComponent, {data, disableClose: true, width: `569px`});
  }

  onApplyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onAddLanguage(): void {
    this.openLanguagePopup({} as Language);
  }

  onEditLanguage(language: Language): void {
    this.openLanguagePopup(language);
  }

  onDeleteLanguage(id: string): void {
    this.store.dispatch(new DeleteLanguage(id));
  }

  ngOnDestroy(): void {}

}

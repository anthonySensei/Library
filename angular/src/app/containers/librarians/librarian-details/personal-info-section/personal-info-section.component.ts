import { Component, Input, OnInit } from '@angular/core';
import { Librarian } from '../../../../models/librarian.model';

@Component({
    selector: 'app-personal-info-section',
    templateUrl: './personal-info-section.component.html'
})
export class PersonalInfoSectionComponent implements OnInit {
    @Input() librarian: Librarian;

    constructor() {}

    ngOnInit() {}
}

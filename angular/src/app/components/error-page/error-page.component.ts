import { Component, OnInit } from '@angular/core';

import { PageTitles } from '../../constants/pageTitles';
import { AngularLinks } from '../../constants/angularLinks';

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {
    links = AngularLinks;

    constructor() {}

    ngOnInit() {
        document.title = PageTitles.ERROR;
    }
}

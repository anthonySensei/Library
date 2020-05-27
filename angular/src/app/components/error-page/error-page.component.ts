import { Component, OnInit } from '@angular/core';

import { PageTitles } from '../../constants/pageTitles';

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.sass']
})
export class ErrorPageComponent implements OnInit {
    constructor() {}

    ngOnInit() {
        document.title = PageTitles.ERROR;
    }
}

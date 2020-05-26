import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-menu-links',
    templateUrl: './menu-links.component.html',
    styleUrls: ['../header.component.sass']
})
export class MenuLinksComponent implements OnInit {
    @Input() links;
    @Input() isManager: boolean;
    @Input() isLibrarian: boolean;
    @Input() isStudent: boolean;
    @Input() isSmallScreen: boolean;

    constructor() {}

    ngOnInit() {}
}

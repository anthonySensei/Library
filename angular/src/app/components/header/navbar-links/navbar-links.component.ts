import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar-links',
  templateUrl: './navbar-links.component.html',
  styleUrls: ['../header.component.sass']
})
export class NavbarLinksComponent implements OnInit {
  @Input() links;
  @Input() isManager: boolean;
  @Input() isLibrarian: boolean;
  @Input() isStudent: boolean;

  constructor() { }

  ngOnInit() {
  }

}

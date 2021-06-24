import {Component, OnInit} from '@angular/core';

interface Feature {
    title: string;
    description: string;
    icon: string;
    link: string;
    linkTitle: string;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    features: Feature[] = [
        {
            title: 'Optimize library management',
            description: 'Get the ability to create a work schedule for librarians, create new users, add books, authors, genres, view a variety of statistics, track debts, and more.',
            icon: 'business',
            link: '/login',
            linkTitle: 'Take advantage of this'
        },
        {
            title: 'Convenient interface',
            description: 'Try a clear search, convenient location of elements on the site, fast loading of pages, intuitive navigation, easy registration and easy account recovery.',
            icon: 'stay_primary_portrait',
            link: '/books',
            linkTitle: 'Appreciate it'
        },
        {
            title: 'Remote booking',
            description: 'Take the opportunity to order the right books remotely and quickly receive them in the library, enjoy the convenience and time savings for each user of the system.',
            icon: 'import_contacts',
            link: '/login',
            linkTitle: 'Try it'
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }
}

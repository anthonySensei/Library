import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { Response } from '../../main-page/models/response.model';

@Injectable({
    providedIn: 'root'
})
export class ResponseService {
    responseChanged = new Subject<Response>();
    response: Response;

    constructor() {}

    setResponse(response: Response) {
        this.response = response;
        this.responseChanged.next(this.response);
    }

    getResponse(): Response {
        return this.response;
    }
}

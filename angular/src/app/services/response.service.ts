import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { Response } from '../models/response.model';

@Injectable({
    providedIn: 'root'
})
export class ResponseService {
    response: Response;

    constructor() {}

    setResponse(response: Response) {
        this.response = response;
    }

    getResponse(): Response {
        return this.response;
    }
}

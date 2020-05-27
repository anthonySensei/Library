import { Injectable } from '@angular/core';

import { Response } from '../models/response.model';

import { MaterialService } from './material.service';

import { SnackBarClasses } from '../constants/snackBarClasses';

@Injectable({
    providedIn: 'root'
})
export class ResponseService {
    response: Response;

    constructor(private materialService: MaterialService) {}

    setResponse(response: Response) {
        this.response = response;
    }

    getResponse(): Response {
        return this.response;
    }

    responseHandle(): boolean {
        if (this.response.isSuccessful) {
            this.materialService.openSnackbar(
                this.response.message,
                SnackBarClasses.Success
            );
        } else {
            this.materialService.openSnackbar(
                this.response.message,
                SnackBarClasses.Danger
            );
        }
        return this.response.isSuccessful;
    }
}

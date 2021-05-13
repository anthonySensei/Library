import { Injectable } from '@angular/core';
import { Pagination } from '../models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class HelperService {
    private allItems: number;
    private paginationData: Pagination;

    // @TODO Fix this
    setItemsPerPage(itemsNumber: number) {
        this.allItems = itemsNumber;
    }

    getItemsPerPage(): number {
        return this.allItems;
    }

    constructor() {}

    emptyChartHandle(name: string): any[] {
        return [
            {
                name,
                series: [
                    {
                        name: 'Empty',
                        value: 0
                    }
                ]
            }
        ];
    }
}

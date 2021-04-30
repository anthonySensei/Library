import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
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

    setPaginationData(pagination: Pagination) {
        this.paginationData = pagination;
    }

    getPaginationData(): Pagination {
        return this.paginationData;
    }

    constructor() {}

    unsubscribeHandle(
        mainSubscription: Subscription,
        arrSubscription: Subscription[]
    ) {
        arrSubscription.forEach((subscription: Subscription) => {
            mainSubscription.add(subscription);
        });
        mainSubscription.unsubscribe();
    }

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

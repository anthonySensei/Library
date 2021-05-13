import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HelperService {
    private allItems: number;

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

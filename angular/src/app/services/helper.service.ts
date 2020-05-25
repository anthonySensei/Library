import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HelperService {
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
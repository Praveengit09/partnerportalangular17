
import { NGTableModule } from '../../../../layout/widget/ngtable/ngtable.module';
import { HSDatePickerModule } from '../../../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// import { WidgetModule } from '../../../../layout/widget/widget.module';
import { UtilsModule } from '../../../../layout/utils/utils.module';
import { FormsModule } from '@angular/forms';
import 'rxjs';
// import { AngularMultiSelectModule } from 'angular4-multiselect-dropdown/dist/multiselect.component';
import { MatInputModule } from '@angular/material/input';
import { SassSubscriptionsComponent } from '../../component/saas/saassubscriptions.component';
import { saasSubscriptionsService } from '../../component/saas/saassubscriptions.service';
import { ModifySubscriptionComponent } from './modifysubscription/modifysubscription.component';
import { CancelledSubscriptionsComponent } from './cancelledsubscriptions/cancelledsubscriptions.component';
import { AbandonedSubscriptionsComponent } from './abandonedorders/abandonedorders.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { SubscriptionCartComponent } from './subscriptioncart/cart.component';
import { SubscriptionCheckoutComponent } from './checkout/checkout.component';



export const routes: Routes = [
    { path: '', redirectTo: 'saas', pathMatch: 'full' },
    { path: 'saas', component: SassSubscriptionsComponent },
    { path: 'modifySubscription', component: ModifySubscriptionComponent },
    { path: 'cancelledSubscriptions', component: CancelledSubscriptionsComponent },
    { path: 'abandonedSubscriptions', component: AbandonedSubscriptionsComponent },
    { path: 'checkout', component: SubscriptionCheckoutComponent },
    { path: 'confirmation/:orderId/:invoiceId', component: ConfirmationComponent },
    { path: 'cart', component: SubscriptionCartComponent }
];


@NgModule({

    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        // UtilComponentsModule,

        // WidgetModule,
        FormsModule,
        UtilsModule,
        FormsModule,
        HSDatePickerModule,
        // AngularMultiSelectModule,
        NGTableModule,
        HSDatePickerModule,
        MatInputModule,

    ],

    declarations: [
        SassSubscriptionsComponent,
        ModifySubscriptionComponent,
        CancelledSubscriptionsComponent,
        AbandonedSubscriptionsComponent,
        SubscriptionCheckoutComponent,
        ConfirmationComponent,
        SubscriptionCartComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],


    providers: [
        saasSubscriptionsService
    ]
})
export class SaasModule {
    static routes = routes;
}

import { Injectable } from '@angular/core';
import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild,
    NavigationExtras,
    Route
} from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable()
export class ProductDashboardGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        if (!this.authService.userAuth.hasProductDeliveryRole && this.authService.userAuth.hasDeliveryAgentRole) {
            this.router.navigateByUrl('app/product/productDelivery/orderlist/1')
            console.log('product');
        }
        return this.authService.userAuth.hasProductDeliveryRole;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

}

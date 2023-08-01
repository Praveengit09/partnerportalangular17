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
export class PharmacyDashboardGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        if (!this.authService.userAuth.hasPharmacyRole && this.authService.userAuth.hasDeliveryAgentRole) {
            this.router.navigateByUrl('app/pharmacy/pharmacyDelivery/orderlist/0')
            console.log('pharmacy');
            
        }
        return this.authService.userAuth.hasPharmacyRole;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

}

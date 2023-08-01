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
export class PharmacyGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        return this.authService.userAuth.hasPharmacyRole || this.authService.userAuth.hasDeliveryAgentRole;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

}

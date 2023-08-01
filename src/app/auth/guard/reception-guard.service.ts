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
export class ReceptionGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        return (this.authService.userAuth.hasReceptionRole ||this.authService.userAuth.hasDigiManagerRole|| 
            this.authService.userAuth.hasPrintPrescriptionRole||this.authService.userAuth.hasQueueRole||  this.authService.userAuth.hasPrintPrescriptionRole || this.authService.userAuth.hasQueueRole||this.authService.userAuth.hasCentralHomeCareRole||
            this.authService.userAuth.hasHomeCareAppointmentRole);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

}

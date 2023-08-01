import { Injectable } from '@angular/core';
import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild,
    Route
} from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable()
export class DoctorDashGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        if (!this.authService.userAuth.hasDoctorRole && this.authService.userAuth.hasDigitizationRole) {
            this.router.navigateByUrl('app/doctor/prescriptiondigitizationqueue')
        }
        console.log('doctor-guard',this.authService.userAuth.hasDoctorRole, this.authService.userAuth.hasDigitizationRole);
        return this.authService.userAuth.hasDoctorRole ;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

}
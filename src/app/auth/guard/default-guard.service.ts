import { Injectable } from '@angular/core';
import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild,
    Route
} from '@angular/router';
import { AuthService } from '../auth.service';
import { Config } from './../../base/config';

@Injectable()
export class DefaultGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (Config.portal.doctorOptions && Config.portal.doctorOptions.enableDoctorDefaultDashboard && this.authService.userAuth.hasDoctorRole) {
            this.router.navigate(['/app/doctor']);
        } else {
            return true;
        }
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

}
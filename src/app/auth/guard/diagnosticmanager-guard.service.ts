import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, CanActivate,


    CanActivateChild, Router,

    RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable()
export class DiagnosticManagerGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        return this.authService.userAuth.hasDiagnosticManagerRole;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

}

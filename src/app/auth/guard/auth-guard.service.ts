import { Injectable } from '@angular/core';
import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild,
    NavigationExtras,
    CanLoad, Route
} from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        console.log('In AuthGuard: Checking if canActivate');
        return this.checkLogin(url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

    canLoad(route: Route): boolean {
        let url = `/${route.path}`;

        return this.checkLogin(url);
    }

    checkLogin(url: string): boolean {
        console.log('In AuthGuard: Checking if canActivate'+ this.authService.userAuth.isLoggedIn);
        if (this.authService.userAuth.isLoggedIn) { 
            return true; 
        }
        // Navigate to the login page
        this.router.navigate(['/login']);
        return false;
    }
}

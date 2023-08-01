import { Component, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: 'navigatepage',
    templateUrl: './navigatepage.template.html',
    styleUrls: ['./navigatepage.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})

export class NavigatePageComponent {

    constructor(private router: Router) {
    }

    SkipForNow() {
        this.router.navigate(['./app/dashboard'])
    }
    onAddEmployee() {
        this.router.navigate(['./pocadminEmp/employee/list'])
    }

}
import { Injectable } from '@angular/core';

@Injectable()
export class ToasterService {
    className: string = "";
    message: string = "";

    constructor() { }

    show(message: string, className: string = "", time: number = 2500) {
        let self = this;
        self.message = message;
        self.className = className + " ";
        self.className = self.className + "show ";
        // After 3 seconds, remove the show class 
        if (time > 0)
            setTimeout(function () { self.clear() }, time);
    }
    clear() {
        this.className = "";
        this.message = "";
    }
}
import { Injectable } from '@angular/core';

import { AppConstants } from '../base/appconstants';
import { HttpService } from "../base/http.service";
import { PocDetail } from "./../model/poc/pocDetails";
import { URLStringFormatter } from "./../base/util/url-string-formatter";

@Injectable()
export class POCService {

    urlStringFormatter: URLStringFormatter = new URLStringFormatter();

    constructor(private httpService: HttpService) {

    }

}

import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { Config } from '../../../base/config';
import * as moment from 'moment';
@Pipe({
  name: 'format'
})
export class FormatPipe implements PipeTransform {

  datePipe: DatePipe = new DatePipe("en");
  decimalPipe: DecimalPipe = new DecimalPipe("en");
  currency: CurrencyPipe = new CurrencyPipe("en");

  transform(input: string, args: any): any {
    var format = '';
    var parsedFloat = 0;
    var pipeArgs = args.split(':');
    for (var i = 0; i < pipeArgs.length; i++) {
      pipeArgs[i] = pipeArgs[i].trim(' ');
    }
    // console.log("transform: ", input + ">>>>: ", pipeArgs[0].toLowerCase());

    switch (pipeArgs[0].toLowerCase()) {
      case 'nametitle':
        if (input == undefined || input == null || input == '') {
          return '';
        }
        let name = input.split(' ');
        format = "";
        name.forEach((e, i) => {
          let lowE = e.toLowerCase();
          if (lowE == 'mrs' || lowE == 'mr' || lowE == 'miss' || lowE == 'dr') {
            format = format + e + '. ';
          } else format = format + e + ' ';
        })
        return format;
      case 'text':
        return input;
      case 'decimal':
      case 'number':
        parsedFloat = !isNaN(parseFloat(input)) ? parseFloat(input) : 0;
        format = pipeArgs.length > 1 ? pipeArgs[1] : null;
        return this.decimalPipe.transform(parsedFloat, format);
      case 'percentage':
        parsedFloat = !isNaN(parseFloat(input)) ? parseFloat(input) : 0;
        format = pipeArgs.length > 1 ? pipeArgs[1] : null;
        return this.decimalPipe.transform(parsedFloat, format) + '%';
      case 'date':
        if (input == undefined || input == null || input == '') {
          return '';
        }
        var date = !isNaN(parseInt(input)) ? parseInt(input) : new Date(input);
        format = 'MMM d, y';
        if (pipeArgs.length > 1) {
          format = '';
          for (var i = 1; i < pipeArgs.length; i++) {
            format += pipeArgs[i];
          }
        }
        // console.log('Date in date pipe is ' + date);
        return this.datePipe.transform(date, format);

      case 'time':
        if (input == undefined || input == null || input == '') {
          return '';
        }
        var date = !isNaN(parseInt(input)) ? parseInt(input) : new Date(input);
        format = 'h:mm a';
        if (pipeArgs.length > 1) {
          format = '';
          for (var i = 1; i < pipeArgs.length; i++) {
            format += pipeArgs[i];
          }
        }
        return moment(date).isValid() ? moment(date).format(format) : '';
      // console.log('Date in date pipe is ' + date);
      // return this.datePipe.transform(date, format);
      case 'datemmyy':
        if (!input) {
          return '';
        }
        var date = !isNaN(parseInt(input)) ? parseInt(input) : new Date(input);
        format = 'MMM , y';
        if (pipeArgs.length > 1) {
          format = '';
          for (var i = 1; i < pipeArgs.length; i++) {
            format += pipeArgs[i];
          }
        }
        // console.log('Date in date pipe is ' + date);
        return this.datePipe.transform(date, format);
      case 'datetime':
        if (input == undefined || input == null || input == '') {
          return '';
        }
        var date = !isNaN(parseInt(input)) ? parseInt(input) : new Date(input);
        format = 'MMM d, y h:mm:ss a';
        if (pipeArgs.length > 1) {
          format = '';
          for (var i = 1; i < pipeArgs.length; i++) {
            format += pipeArgs[i];
          }
        }
        // console.log('Date in date pipe is ' + date);
        return this.datePipe.transform(date, format);
      case 'currency':
        if (input == undefined || input == null || input == '') {
          return '';
        }

        format = "`${Config.portal.currencyCode}`:true:'1.2-2'";
        if (pipeArgs.length > 1) {
          format = '';
          for (var i = 1; i < pipeArgs.length; i++) {
            format += pipeArgs[i];
          }
        }
        return this.currency.transform(+input, Config.portal.currencyCode);

      default:
        return input;
      // :'INR':true:'1.2-2'
    }
  }
}
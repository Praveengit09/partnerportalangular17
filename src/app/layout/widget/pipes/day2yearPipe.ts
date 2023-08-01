import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'day2year' })
export class Days2Year implements PipeTransform {
  transform(value: any): string {
    let days = value;
    let month = Math.round(days / 30);
    let year = month / 12;
    let yearsAndMonths = '';
    if (year < 1) {
      yearsAndMonths = month == 1 ? month + '\t' + 'Month' : month + '\t' + 'Months';
    }
    else {
      let y = year == 1 ? year + '\t' + 'year' : year + '\t' + 'Years';
      let m = month % 12 + '\t' + 'Months';
      yearsAndMonths = month % 12 != 0 ? y + '\t' + m : y;
    }
    return yearsAndMonths;
  }
}
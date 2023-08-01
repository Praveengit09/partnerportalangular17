import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'hsdate' })
export class HSDatePipe implements PipeTransform {
  transform(value: any): Date {
    console.log('The date value in pipe is ' + value);
    if (value instanceof Date) {
      console.log('Value is instance of date');
      return value;
    } else if (value instanceof Number) {
      console.log('Value is instance of number');
    } else if (value instanceof String) {
      console.log('Value is instance of string');
    }
    var reg = /^\d+$/;
    if (reg.test(value)) {
      console.log('The date value in if ');
      return new Date(eval(value));
    }
    return new Date();
  }
}
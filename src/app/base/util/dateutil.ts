import { formatDate } from '@angular/common';

export class DateUtil {

    public static getMonthsList(fromYear: number): Array<any> {
        let months: Array<string> = new Array<string>(12);
        months[0] = "January";
        months[1] = "February";
        months[2] = "March";
        months[3] = "April";
        months[4] = "May";
        months[5] = "June";
        months[6] = "July";
        months[7] = "August";
        months[8] = "September";
        months[9] = "October";
        months[10] = "November";
        months[11] = "December";
        let datesList: Array<any> = new Array<any>();
        for (let i = new Date().getFullYear(); i >= fromYear; i--) {
            for (let j = months.length - 1; j >= 0; j--) {
                if (i == new Date().getFullYear() && j > new Date().getMonth()) {
                    continue;
                }
                let element: string = months[j];
                let dateObj: any = {
                    'displayDate': element + ' ' + i,
                    'month': j,
                    'year': i
                };
                datesList.push(dateObj);
            }
        }
        return datesList;
    }

    public static getTimeInMillisFromMonthYear(month: number, year: number): number {
        let dateValue: Date = new Date();
        dateValue.setFullYear(year, month, 1);
        dateValue.setHours(0, 0, 0, 0);
        return dateValue.getTime();
    }

    public static removeTimeInMillis(date: number): number {
        let dateValue: Date = new Date(date);
        dateValue.setHours(0, 0, 0, 0);
        return dateValue.getTime();
    }

    public static removeDateInMillis(date: number): number {
        let dateValue: Date = new Date(date);
        dateValue.setFullYear(1970);
        dateValue.setMonth(0);
        dateValue.setDate(1);
        return dateValue.getTime();
    }

    public static getTimeInHoursMinSeconds(time: number): string {
        if (time != 0) {
            let d = new Date(Date.UTC(0, 0, 0, 0, 0, 0, time));
            // Pull out parts of interest
            let parts = [
                d.getUTCHours(),
                d.getUTCMinutes(),
                d.getUTCSeconds()
            ];
            // Zero-pad
            let stringTime = parts.map(s => String(s).padStart(2, '0')).join(':');
            return stringTime;
        } else {
            return '';
        }
    }

    public static getDateAsFormattedString(date: number) {
        return formatDate(date, 'medium', 'en-US');
    }

}
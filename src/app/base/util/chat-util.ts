export class ChatUtil {
    static getTimeFromNow(time) {
        let milli = new Date().getTime() - time;

        let date = new Date(time);
        let hours = date.getHours() + '';
        let amPm = 'am';
        if (parseInt(hours) > 12) {
            hours = (parseInt(hours) - 12) + '';
            amPm = 'pm';
        }
        if (hours.length == 1) {
            hours = '0' + hours;
        }
        let dd = date.getDate() + '';
        if (dd.length == 1) {
            dd = '0' + dd;
        }
        let mm = date.getMonth() + '';
        if (mm.length == 1) {
            mm = '0' + mm;
        }
        let yy = date.getFullYear() + '';
        let min = date.getMinutes() + '';
        if (min.length == 1) {
            min = '0' + min;
        }

        if (milli < 5000) {
            return hours + ':' + min + ' ' + amPm;
        }
        if (milli < 1000 * 60) {
            return hours + ':' + min + ' ' + amPm;
            // return Math.floor(+milli/1000)+' sec';
        }
        if (milli < 1000 * 60 * 60) {
            return hours + ':' + min + ' ' + amPm;
            // return Math.floor(+milli/60000)+' min';
        }


        return dd + '-' + mm + '-' + yy + ' ' + hours + ':' + min + ' ' + amPm;
    }
}
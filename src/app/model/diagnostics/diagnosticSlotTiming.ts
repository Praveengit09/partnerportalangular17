import { SlotDetail } from './../../model/slotbooking/slotdetails';
import { SlotTiming } from './../../model/slotbooking/slottiming';
import { DiagnosticSlotDetail } from './../../model/diagnostics/diagnosticSlotDetail';

export class DiagnosticSlotTiming {
    timeStamp: number;
    time: string;
    slotList: DiagnosticSlotDetail[];

    constructor(timeInMilli: number, slotDetailsList: DiagnosticSlotDetail[]) {
        this.timeStamp = timeInMilli;
        this.time = this.getTimeInStringFormat(timeInMilli);
        this.slotList = slotDetailsList;
    }

    getTimeInStringFormat(time: number): string {
        var date = new Date(time);
        var hours = date.getHours();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        return hours + ':' + minutes + ' ' + ampm;
    }
}

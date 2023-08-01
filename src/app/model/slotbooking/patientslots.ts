import { BaseResponse } from '../base/baseresponse';
import { SlotTiming } from './slottiming';
export class PatientSlots extends BaseResponse {

    public static VACANT = 0;
    public static BOOKED = PatientSlots.VACANT + 1;
    public static BLOCK = PatientSlots.BOOKED + 1;
    public static SHORT_BLOCK = PatientSlots.BLOCK + 1;
    public static WAITING = PatientSlots.SHORT_BLOCK + 1;
    public static ENGAGED = PatientSlots.WAITING + 1;
    public static CHECKED = PatientSlots.ENGAGED + 1;
    public static IN_PAYMENT = PatientSlots.CHECKED + 1;

    public static TYPE_IN_CLINIC = 0;
    public static TYPE_DIGI = PatientSlots.TYPE_IN_CLINIC + 1;
    public static TYPE_LIVE_NOW = PatientSlots.TYPE_DIGI + 1;


    public patientSlotsId: number;
    public pocId: number;
    public doctorId: number;
    public serviceId: number;
    public slots: Array<SlotTiming>;
    public slotDuration: number;
    public consultationFee: number;
    public currentTime: number;
}
import { LocationModeResponse } from '../common/locationmoderesponse';

export class InvestigationDayTime {
    public days: Array<number> = new Array<number>();
    public startTime: number;
    public endTime: number;
    public slotDuration: number;
    public pplPerSlot: number;

    public areaClusterId: number;
    public areaList: Array<LocationModeResponse> = new Array<LocationModeResponse>();

    public cityDetails: LocationModeResponse;

    /* local Use */
    public startTimeAmPmFormat: string;
    public endTimeAmPmFormat: string;
    // public selectedCity: LocationModeResponse;
}
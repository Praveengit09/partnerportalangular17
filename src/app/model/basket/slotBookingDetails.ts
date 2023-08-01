import { SessionBean } from './../../model/slotbooking/sesssionBean';
import { InvoiceBaseDetails } from './../../model/basket/invoicebasedetails';
import { ProfileVisitedDetails } from './../../model/reception/profilevisitedDetails';
import { ServiceItem } from '../service/serviceItem';
export class SlotBookingDetails extends InvoiceBaseDetails {
    // booking types
    public static BOOKING_TYPE_AUDIO = 0;
    public static BOOKING_TYPE_VIDEO = 1;
    public static BOOKING_TYPE_CALL = 2;
    public static BOOKING_TYPE_DOCTOR_SLOT = 3;
    public static BOOKING_TYPE_WELLNESS = 4;
    public static BOOKING_TYPE_INVESTIGATION = 5;

    // In-person booking sub type
    /* public static SERVICE_TYPE_POC = 0;
    public static SERVICE_TYPE_DIGIROOM = 1;
    public static SERVICE_TYPE_VIDEO_CHAT = 2;
    public static SERVICE_TYPE_WALKIN = 3;
    public static SERVICE_TYPE_HOME_CONSULTATION = 4; */
    public static DOCTOR_SLOT_BOOKING_SUB_TYPE_POC = 0;
    public static DOCTOR_SLOT_BOOKING_SUB_TYPE_DIGIROOM = 1;
    public static DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT = 2;
    public static DOCTOR_SLOT_BOOKING_SUB_TYPE_WALKIN = 3;
    public static DOCTOR_SLOT_BOOKING_SUB_TYPE_HOME = 4;


    public static INVESTIGATION_SUB_TYPE_WALKIN = 0 //for walkin slot
    public static INVESTIGATION_SUB_TYPE_HOME = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN + 1;
    public static INVESTIGATION_SUB_TYPE_WALKIN_BILLING = SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME + 1; //direct walkin
    // Cart Item Types
    public static CART_ITEM_TYPE_PACKAGE = 1;
    public static CART_ITEM_TYPE_INVESTIGATIONS = 2;
    public static CART_ITEM_TYPE_PHARMACY = 3;
    public static CART_ITEM_TYPE_PROCEDURE = 4;
    public static CART_ITEM_TYPE_IMMUNISATION = 5;
    public static CART_ITEM_TYPE_PRODUCT = 6;
    public static CART_ITEM_TYPE_ONBOARDING_PACKAGE = 7;
    public static CART_ITEM_TYPE_APP_INCENTIVE = 21;

    // Delivery type
    public static DELIVERY_TYPE_NONE = 1;
    public static DELIVERY_TYPE_HOME = 2;



    // DIAGNOSTIC BOOKING SUBTYPE
    public static DIAGNOSTICS_BOOKING_SUB_TYPE_POC = 0;
    public static DIAGNOSTICS_BOOKING_SUB_TYPE_HOME = 1;
    public static DIAGNOSTICS_BOOKING_SUB_TYPE_WALK_IN_BILLING = 2;

    public slotStatus: number;
    public slotDate: number;
    public slotTime: number;
    public spotBooking: boolean;
    public ignorePackageTest: boolean;
    public splitForPackage: boolean;
    public packageSplitTest: boolean;
    public splitForPostPrandial: boolean;
    public postPrandialSplitting: boolean;
    public slotExpireTime: number;
    public slotDuration: number;
    public timeZone: string;
    public categoryId: number;
    public bookingType: number;
    public override bookingSubType: number;
    public typeOfAppointment: number;
    public isDigiQueue: boolean;
    public override addToConsultationQueue: boolean;
    public sessionBean: SessionBean;
    public referredByDoctor: any;
    public remarks: string;
    public visitDetail: ProfileVisitedDetails;
    public homeConsultStatus: number;
    public serviceList: ServiceItem[] = new Array<ServiceItem>();
    public couponApplied: boolean;
    public patientInformation: string;
    public age: string;
    public diagnosticSlotStatus: number;
    public videoConsultationSource: number;
    public actionPerformed: number;
    public privilegeCardType: number;
    public appointmentRequestId: string;


    /* //local use //transient variable
    public enableCancel: number; */
    public enableMarkAddressButton: number;
    public isReset: boolean;
    public convertedDocumentUrlList: Array<String>;
    public proofDocumentUrlList: Array<String>;
    public proofs: Array<String>;
    public scheduleId: number;
    public rescheduledOrder: boolean;
    public clientName: string;
    public additionalInfo: string;
    public note: string;
    public slotDate2: number;
    public slotTime2: number;
    public orderRemarks: string;
    public discountRemarks: string;
    public scanDocumentsList: any = [];
    public srfId: string;
    public creditUser: number;

    public static getSlotBookingType(slotBookingType: number): string {
        let slotBookingTypeString: string = "";
        switch (slotBookingType) {

            case SlotBookingDetails.BOOKING_TYPE_AUDIO: {
                slotBookingTypeString = "DOCTOR";
                break;
            }
            case SlotBookingDetails.BOOKING_TYPE_VIDEO: {
                slotBookingTypeString = "DOCTOR";
                break;
            }
            case SlotBookingDetails.BOOKING_TYPE_CALL: {
                slotBookingTypeString = "DOCTOR";
                break;
            }
            case SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT: {
                slotBookingTypeString = "DOCTOR";
                break;
            }
            case SlotBookingDetails.BOOKING_TYPE_WELLNESS: {
                slotBookingTypeString = "WELLNESS";
                break;
            }
            case SlotBookingDetails.BOOKING_TYPE_INVESTIGATION: {
                slotBookingTypeString = "INVESTIGATION";
                break;

            }

        }
        return slotBookingTypeString;

    }

}

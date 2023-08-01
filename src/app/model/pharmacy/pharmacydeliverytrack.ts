export class PharmacyDeliverTrack {

    public static RAISED_ORDER = 1;
    public static MODIFIED_ORDER = PharmacyDeliverTrack.RAISED_ORDER + 1;
    public static COLLECTED_PAYMENT = PharmacyDeliverTrack.MODIFIED_ORDER + 1;
    public static PROCESSED = PharmacyDeliverTrack.COLLECTED_PAYMENT + 1;
    public static PAYMENT_INITIATED = PharmacyDeliverTrack.PROCESSED + 1;


}
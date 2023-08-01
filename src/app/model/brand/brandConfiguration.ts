export class BrandConfiguration {

    public appId: number;
    public brandId: number;

    public smallPlatform: string;
    public capitalPlatform: string;
    public partnerText: string;
    public captionText: string;

    public brandSiteUrl: string;
    public contactEmail: string;
    public supportEmail: string;

    public brandLogoUrl: string;
    public footerImageUrl: string;
    public spriteImageUrl: string;
    public footerText: string;

    public playstoreUrl: string;
    public appstoreUrl: string;

    public deeplink: string;

    public consumerPortalUrl: string;

    public sequenceIdPrefix: string;
    public sequenceCounterPrefix: string;

    public sqsUrl: string;
    public sqsQueueName: string;
    public sqsQueueEnabled: boolean;

    public autoRoutingPrescriptionEnabled: boolean;
    public prescriptionPharmacyHomeDeliveryEnabled: boolean;
    public prescriptionDiagnosticHomeDeliveryEnabled: boolean;
    public prescriptionPharmacyWalkinEnabled: boolean;
    public prescriptionDiagnosticWalkinEnabled: boolean;
}
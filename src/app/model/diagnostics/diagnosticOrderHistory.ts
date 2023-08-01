export class DiagnosticOrderHistory {
    public orderId: string;
    public baseInvoiceId: string;

    public updatedTimestamp: number;

    public actionPerformed: number;

    public bookingEmpId: number;
    public bookingEmpName: string;

    public acceptedEmpId: number;
    public acceptedEmpName: string;

    public vendorPocId: number;
    public vendorPocName: string;

    public vendorEmpId: number;
    public vendorEmpName: string;

    public phleboEmpId: number;
    public phleboEmpName: string;

    public centralEmpId: number;
    public centralEmpName: string;

    public digitizationEmpId: number;
    public digitizationEmpName: string;

    // For vendor
    public vendorOrderStatus: number;

    // For phlebo
    public phleboOrderStatus: number;
    public phleboCashDeliveryStatus: number;
    public consumablesStatus: number;

    // For Digitizer
    public orderDigitizationStatus: number;

    // General
    public orderStatus: number;
    public paymentStatus: number;
    public cancellationStatus: number;

    public remarks: string;

    // Local variable
    public label: string;
    public rowStyle: any;
}
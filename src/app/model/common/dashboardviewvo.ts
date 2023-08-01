export class DashboardViewVo {
    public  brandId :number;
    public  createdTime : any;
    public  onboardingOrderCount :number;
    // this same for onboarding ,doctor,diagnostic
    public  cutomerInteractedWithConsumerCount :number;
    public  cutomerPendingdWithConsumerCount :number;
    public  doctorOrderCount :number;
    // stream 1
    public  doctorOrderCompletedCount :number;
    public  doctorOrderPendingCount :number;
    public  doctorOrderCancelingCount :number;
    // stream 2
    public  cutomerInteractedWithDoctorCount :number;
    public  cutomerPendingdWithDoctorCount :number;
    public  doctorPrescriptionsCount :number;

    public  diagnosticOrderCount :number;
    public  diagnosticOrderCompletedCount :number;
    public  diagnosticOrderPendingCount :number;
    public  diagnosticOrderCancelingCount :number;
    // stream 2
    public  cutomerInteractedWithdiagnosticCount :number;
    public  cutomerPendingdWithdiagnosticCount :number;
    public  diagnosticPrescriptionsCount :number;
    
}

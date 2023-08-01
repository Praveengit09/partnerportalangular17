import { DoctorDashGuard } from './guard/doctor-dash-guard';
import { ProductDashboardGuard } from './guard/product-dash-guard';
import { PharmacyDashboardGuard } from './guard/pharmacy-dash-guard';
import { ProductGuard } from './guard/product-guard.service';
import { CentralProductHomeOrderGuard } from './guard/centralproducthomeorder-guard.service';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AuthService } from './auth.service';
import { AuthGuard } from './guard/auth-guard.service';
import { BusinessAdminGuard } from './guard/businessadmin-guard.service';
import { CentralHomeCareGuard } from './guard/centralhomecare-guard.service';
import { CentralPharmacyHomeOrderGuard } from './guard/centralpharmacyhomeorder-guard.service';
import { DiagnosticAppointmentGuard } from './guard/diagnostic-appointment-guard.service';
import { DiagnosticGuard } from './guard/diagnostic-guard.service';
import { DiagnosticAdminHomeOrderGuard } from './guard/diagnosticadminhomeorder-guard.service';
import { DiagnosticHomeOrderGuard } from './guard/diagnostichomeorder-guard.service';
import { DiagnosticReportGuard } from './guard/diagnosticreport-guard.service';
import { DigiManagerGuard } from "./guard/digimanager-guard.service";
import { DoctorGuard } from './guard/doctor-guard.service';
import { EmployeeAdminGuard } from './guard/employeeadmin-guard.service';
import { HSBusinessAdminGuard } from "./guard/hsbusinessadmin-guard.service";
import { InventoryGuard } from './guard/inventory-guard.service';
import { NurseGuard } from './guard/nurse-guard.service';
import { OnboardingRequestGuard } from './guard/onboardingrequest-guard.service';
import { OrderCancellationGuard } from './guard/ordercancellation-guard.service';
import { PaymentGuard } from './guard/payment-guard.service';
import { PharmacyGuard } from './guard/pharmacy-guard.service';
import { PharmacyHomeOrderGuard } from './guard/pharmacyhomeorder-guard.service';
import { PharmacyReportGuard } from './guard/pharmareport-guard.service';
import { POCAdminGuard } from './guard/pocadmin-guard.service';
import { PrintPrescriptionGuard } from './guard/prescription-guard.service';
import { ProcedureGuard } from "./guard/procedure-guard.service";
import { QueueGuard } from "./guard/queue-guard.service";
import { ReceptionGuard } from './guard/reception-guard.service';
import { ReceptionAppointmentGuard } from './guard/receptionappointment-guard.service';
import { RolesAdminGuard } from './guard/rolesadmin-guard.service';
import { SuperAdminGuard } from "./guard/superadmin-guard.service";
import { WellnessGuard } from './guard/wellness-guard.service';
import { DiagnosticLogisticAdminGuard } from './guard/diagnosticlogisticadmin-guard.service';
import { HomeCareServicesGuard } from './guard/homecareservices-guard.service';
import { DiagnosticOrderDetailGuard } from './guard/diagnosticorderdetail-guard.service';
import { MISGuard } from './guard/mis-guard.service';
import { PrescriptionDigitizerGuard } from './guard/prescriptiondigitizer-guard.service';
import { DiagnosticManagerGuard } from './guard/diagnosticmanager-guard.service';
import { DefaultGuard } from './guard/default-guard.service';
import { CenrralPackageGuard } from './guard/package-guard.service';


@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule
    ],
    providers: [AuthService, AuthGuard, DefaultGuard, ReceptionGuard, NurseGuard,
        PharmacyGuard, PharmacyReportGuard, DiagnosticGuard, DiagnosticReportGuard,
        PaymentGuard, DiagnosticAppointmentGuard, DiagnosticHomeOrderGuard, InventoryGuard,
        PharmacyHomeOrderGuard, OnboardingRequestGuard, OrderCancellationGuard, PharmacyDashboardGuard, ProductDashboardGuard, ProductGuard,
        BusinessAdminGuard, WellnessGuard, PrintPrescriptionGuard, ReceptionAppointmentGuard,
        QueueGuard, ProcedureGuard, HSBusinessAdminGuard, SuperAdminGuard, DigiManagerGuard, DoctorGuard,
        CentralHomeCareGuard, DiagnosticAdminHomeOrderGuard, DiagnosticLogisticAdminGuard,
        POCAdminGuard, EmployeeAdminGuard, RolesAdminGuard, CentralPharmacyHomeOrderGuard,
        HomeCareServicesGuard, DiagnosticOrderDetailGuard, MISGuard, CentralProductHomeOrderGuard,
        PrescriptionDigitizerGuard, DoctorDashGuard, DiagnosticManagerGuard, CenrralPackageGuard]
})

export class AuthModule { }

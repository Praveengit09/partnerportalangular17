import { PreCallTestComponent } from './videocard/precalltest/precalltest.component';
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { WizardComponent } from './wizard/wizard.component';
import { DigitizationQueueComponent } from './digitizationqueue/digitizationqueue.component';
import { PrescriptionDigitizerGuard } from '../../auth/guard/prescriptiondigitizer-guard.service';
import { DigitizationManagerComponent } from './digitizationmanager/digitizationmanager.component';
import { DigitizedPrescriptionComponent } from './digitizedprescription/digitizedprescription.component';
 
export const routes:Routes = [
  { path: '', redirectTo: 'generate/symptomPrescription', pathMatch: 'full' },
  // { path: 'generate', component: WizardComponent },
  { path: 'precalltest', component: PreCallTestComponent },
  { path: 'generate/:wizardView', component: WizardComponent },
  { path: 'prescriptionsummary', component: WizardComponent },
  { path: 'medicalprescription', component: WizardComponent },
  { path: 'prescriptiondigitizationqueue', canActivate: [PrescriptionDigitizerGuard], component: DigitizationQueueComponent },
  {path: 'digitizationmanager', component: DigitizationManagerComponent},
  {path: 'digitizedprescription',component:DigitizedPrescriptionComponent}
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorPrescriptionRoute { }

import { SBRAdviceComponent } from "./SBR/SbrAdvices/SbrAdvice.component";
import { SBRComponent } from "./SBR/Sbr.component";
import { NurseComponent } from "./nurse.component";
import { VitalsreadingComponent } from "./component/vitalsreading/vitalsreading.component";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from '@angular/core';
import { PreConsultationQuestionnaireComponent } from "./component/preconsultationquestionnaire/preconsultationquestionnaire.component";


export const routes: Routes = [
  { path: '', component: NurseComponent, pathMatch: 'full' },
  { path: 'vitalsreading', component: VitalsreadingComponent },
  // { path: 'questionnaire', component: VitalsreadingComponent },
  { path: 'questionnaire', component: PreConsultationQuestionnaireComponent },
  { path: 'SBR', component: SBRComponent },
  { path: 'SbrAdvice', component: SBRAdviceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NurseRoute { }

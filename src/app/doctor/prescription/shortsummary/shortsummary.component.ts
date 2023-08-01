import { Component, EventEmitter, Output, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { AppConfig } from "../../../app.config";
import { AuthService } from "../../../auth/auth.service";
import { CommonUtil } from "../../../base/util/common-util";
import { ToasterService } from '../../../layout/toaster/toaster.service';
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { PatientMedicalAdvise } from "../../../model/advice/patientMedicalAdvise";
import { DoctorService } from '../../doctor.service';
import { InvestigationAdvises } from "./../../../model/advice/investigationAdvises";
import { PharmacyAdvises } from "./../../../model/advice/pharmacyAdvises";
import { Config } from './../../../base/config';
import { AdmissionNote } from "../../../model/advice/admissioNote";



@Component({
  selector: "shortsummary",
  templateUrl: "./shortsummary.template.html",
  styleUrls: ["./shortsummary.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class ShortSummaryComponent {

  patientMedicalAdvise: PatientMedicalAdvise;
  @Output("wizardView") wizardView = new EventEmitter<string>();
  @Output("savePrescription") savePrescription = new EventEmitter<any>();
  enableFixedNextBtn: boolean = false;
  enableInvestigationNotes: boolean = false;
  refer_ToText: boolean = false
  disableImmunization: boolean = false;
  procedurePrescriptionLabel: string = null;
  nonMedicationPrescriptionLabel: string = null;
  admissionNotePrescriptionLabel: string = null;

  constructor(
    config: AppConfig,
    private toast: ToasterService,
    private commonUtil: CommonUtil,
    private spinnerService: SpinnerService,
    private doctorService: DoctorService,
    private router: Router,
    private authService: AuthService
  ) {
    this.patientMedicalAdvise = this.doctorService.patientMedicalAdvise;
    if (Config.portal.specialFeatures.enablePresGenerationChanges) {
      this.refer_ToText = true
    }
    if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableFixedNextBtn) {
      this.enableFixedNextBtn = true;
    }
    this.enableInvestigationNotes = Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableInvestigationNotes ? Config.portal.doctorOptions.enableInvestigationNotes : false;
    this.disableImmunization = Config.portal.doctorOptions && Config.portal.doctorOptions.disableImmunization ? Config.portal.doctorOptions.disableImmunization : false;
    this.procedurePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.procedureLabel && Config.portal.doctorOptions.prescriptionLabels.procedureLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.procedureLabel : null;
    this.nonMedicationPrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel && Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel : null;
    this.admissionNotePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel : null;
  }
  savePrescriptionsOfPatient(autoSave: boolean = false) {
    let tmp = { patientMedicalAdvise: this.doctorService.patientMedicalAdvise, autoSave: autoSave };
    this.savePrescription.emit(tmp);
  }
  nextPageButton() {
    if (this.doctorService.patientMedicalAdvise.admissionNote.procedureList.length > 0) {
      if (this.doctorService.patientMedicalAdvise.admissionNote.admissionDateFrom == null) {
        this.toast.show('Please select the admission date', "bg-danger text-white font-weight-bold", 3000); return;
      }
    }
    if (Config.portal.doctorOptions && Config.portal.doctorOptions.enablePrescriptionAutoSave) {
      this.savePrescriptionsOfPatient(true);
    }
    $('#templete-next-button').click();
  }
  getDate(milli) {
    return this.commonUtil.convertToDate(milli);
  }
  getpatientMedicalAdvise() {
    this.patientMedicalAdvise = this.doctorService.patientMedicalAdvise;
    if (!this.patientMedicalAdvise) this.patientMedicalAdvise = new PatientMedicalAdvise();
    if (!this.patientMedicalAdvise.diagnosisList || !this.patientMedicalAdvise.diagnosisList.length) {
      this.patientMedicalAdvise.diagnosisList = new Array();
    }
    if (!this.patientMedicalAdvise.symptomList || !this.patientMedicalAdvise.symptomList.length) {
      this.patientMedicalAdvise.symptomList = new Array();
    }
    if (!this.patientMedicalAdvise.clinicalExaminationList || !this.patientMedicalAdvise.clinicalExaminationList.length) {
      this.patientMedicalAdvise.clinicalExaminationList = new Array();
    }
    if (!this.patientMedicalAdvise.pharmacyAdvises) {
      this.patientMedicalAdvise.pharmacyAdvises = new PharmacyAdvises();
    }
    if (!this.patientMedicalAdvise.pharmacyAdvises.pharmacyAdviceList || !this.patientMedicalAdvise.pharmacyAdvises.pharmacyAdviceList.length) {
      this.patientMedicalAdvise.pharmacyAdvises.pharmacyAdviceList = [];
    }
    if (!this.patientMedicalAdvise.investigationAdvises) {
      this.patientMedicalAdvise.investigationAdvises = new InvestigationAdvises();
    }
    if (!this.patientMedicalAdvise.investigationAdvises.investigationList || !this.patientMedicalAdvise.investigationAdvises.investigationList.length) {
      this.patientMedicalAdvise.investigationAdvises.investigationList = [];
    }
    if (!this.patientMedicalAdvise.procedureList || !this.patientMedicalAdvise.procedureList.length) {
      this.patientMedicalAdvise.procedureList = new Array();
    }
    if (!this.patientMedicalAdvise.wellnessAdvises || !this.patientMedicalAdvise.wellnessAdvises.length) {
      this.patientMedicalAdvise.wellnessAdvises = new Array();
    }
    if (!this.patientMedicalAdvise.referralDoctorList || !this.patientMedicalAdvise.referralDoctorList.length) {
      this.patientMedicalAdvise.referralDoctorList = new Array();
    }
    if (!this.patientMedicalAdvise.nonMedicationAdvises || !this.patientMedicalAdvise.nonMedicationAdvises.length) {
      this.patientMedicalAdvise.nonMedicationAdvises = new Array();
    }
    if (!this.patientMedicalAdvise.immunizationAdvices || !this.patientMedicalAdvise.immunizationAdvices.length) {
      this.patientMedicalAdvise.immunizationAdvices = new Array();
    }
    if (!this.patientMedicalAdvise.admissionNote || !this.patientMedicalAdvise.admissionNote.procedureList.length) {
      this.patientMedicalAdvise.admissionNote = new AdmissionNote();
    }
    if (!this.patientMedicalAdvise.illnessSymptomList || !this.patientMedicalAdvise.illnessSymptomList.length) {
      this.patientMedicalAdvise.illnessSymptomList = new Array();
    }
    if (!this.patientMedicalAdvise.noteList || !this.patientMedicalAdvise.noteList.length) {
      this.patientMedicalAdvise.noteList = [
        // {
        //   id:undefined,
        //   title:''
        // }
      ];
    }
    return this.patientMedicalAdvise;
  }
}

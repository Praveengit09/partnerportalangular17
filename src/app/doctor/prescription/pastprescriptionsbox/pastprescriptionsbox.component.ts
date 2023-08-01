import {
  Component,
  ViewEncapsulation,
  OnInit,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { Router } from "@angular/router";
import { AppConfig } from "../../../app.config";
import { CommonUtil } from "../../../base/util/common-util";
import { Config } from '../../../base/config';

import { PatientMedicalAdvise } from "../../../model/advice/patientMedicalAdvise";
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { AuthService } from "../../../auth/auth.service";
import { DoctorService } from "../../doctor.service";
import { ConsentRequestConstants } from "../../../constants/doctor/consentrequestconstants";
import { PatientQueue } from "../../../model/reception/patientQueue";
import { CryptoUtil } from "../../../auth/util/cryptoutil";

@Component({
  selector: "pastprescriptionsbox",
  templateUrl: "./pastprescriptionsbox.template.html",
  styleUrls: ["./pastprescriptionsbox.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class PastPrescriptionsBoxComponent implements OnInit {

  @Input() isFromDoctorWizard: boolean = false
  patientMedicalAdvise: PatientMedicalAdvise;
  modelView: string;

  pastPrescriptions: PatientMedicalAdvise[] = [];

  hasPastPrescriptions: boolean;
  isFromWizard: boolean = false;

  requestConsentForPatient: string = '';
  selectedPatient: PatientQueue = new PatientQueue();
  consentOtp: string = '';
  consentVerified: boolean = false;
  showconsentpopup: boolean = false;

  @Output("wizardView")
  wizardView = new EventEmitter<string>();
  @Output("onClickPastPrescription") onClickPastPrescription = new EventEmitter<PatientMedicalAdvise>();
  @Output("onClickTest") onClickTest = new EventEmitter<PatientMedicalAdvise>();

  @Input("isFooterHidden")
  isFooterHidden: boolean = false;

  @Output("pastPrescriptionOutput")
  pastPrescriptionOutput = new EventEmitter();
  pastPrescription: PatientMedicalAdvise = new PatientMedicalAdvise();
  consentOtpVerified: boolean = false;


  pdfUrl: any;

  noOfPatientPastPrescriptionToBeAdded: number = 4;
  patientPastPrescriptionCount: number = 0;
  endOfPastPrescriptions: boolean = false;

  constructor(
    config: AppConfig,
    private commonUtil: CommonUtil,
    private spinnerService: SpinnerService,
    private doctorService: DoctorService,
    private router: Router,
    private authService: AuthService
  ) {
    this.patientMedicalAdvise = this.doctorService.patientMedicalAdvise;
    this.consentOtpVerified = this.doctorService.consentOtpVerified;
  }
  convertToDate(str) {
    return this.commonUtil.convertToDate(str);
  }

  ngOnInit() {

    if (Config.portal.doctorOptions.enableOtpBasedConsent == true && this.isFromDoctorWizard == true) {
      this.checkPatientConsent()
    } else {
      this.consentVerified = true;
      this.getMorePastPrescription()
    }
    let self = this;
    $('#modelIdpastprescription').on('hidden.bs#modelIdpastprescription', (e) => {
      (<any>$("#modelprescriptionsummary")).modal("hide");
      self.modelView = '';
      self.hasPastPrescriptions = false;
    });

    this.pastPrescription = this.doctorService.pastPrescription;
    if (this.pastPrescription)
      if (this.pastPrescription.noteList[0]) {
        $("#prescription_notes").val(
          '' + this.pastPrescription.noteList[0].title
        );
      }

  }



  checkPatientConsent() {
    this.selectedPatient = this.doctorService.patientQueue;
    let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "consentContentType": 0 };
    requestBody.parentProfileId = this.doctorService.patientQueue.parentProfileId;
    requestBody.patientProfileId = this.doctorService.patientQueue.patientProfileId;
    requestBody.empId = this.authService.employeeDetails.empId;
    requestBody.consentContentType = 6;
    this.doctorService.checkConsentStatus(requestBody).then((consentStatus) => {
      if (consentStatus.statusCode == 200 || consentStatus.statusCode == 201) {
        this.consentVerified = true;
        this.getMorePastPrescription();
      }
      else if (consentStatus.statusCode == 412) {
        this.consentVerified = false;
        // this.onConsentRequestClickHandler()
      }

    })
  }

  getMorePastPrescription() {
    this.consentVerified = true;
    let doctorId = 0;
    if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableDoctorIdForPastPrescriptions)
      doctorId = this.authService.userAuth.employeeId;
    this.doctorService
      .getAllPatientConsultation(
        this.doctorService.patientQueue.patientProfileId,
        this.patientPastPrescriptionCount,
        this.noOfPatientPastPrescriptionToBeAdded,
        doctorId,
        this.doctorService.patientQueue.serviceId
      ).then(data => {
        console.log(data);

        let pastPrescriptionData: PatientMedicalAdvise[] = JSON.parse(JSON.stringify(data));
        if (pastPrescriptionData.length == 0) {
          this.endOfPastPrescriptions = true;
        }
        else
          this.patientPastPrescriptionCount += this.noOfPatientPastPrescriptionToBeAdded;
        // this.pastPrescriptions =  JSON.parse(JSON.stringify(data));
        if (pastPrescriptionData.length > 0)
          for (let i = 0; i < pastPrescriptionData.length; i++) {
            this.pastPrescriptions.push(pastPrescriptionData[i]);
          }
      });
  }


  onConsentRequestClickHandler() {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    window.localStorage.setItem("patientQueue", cryptoUtil.encryptData(JSON.stringify(this.doctorService.patientQueue)));
    this.showconsentpopup = true;
    this.isFromWizard = true;
    console.log('onConsentRequestClickHandler', this.showconsentpopup)
  }

  onModalClose(closeModal) {
    if (closeModal == 'true') {
      this.consentVerified = true;
      this.showconsentpopup = true;

      this.getMorePastPrescription();
    }
    else {
      this.consentVerified = false;
      this.showconsentpopup = false;
    }

  }





  hideModel(id: string) {
    this.modelView = '';
    (<any>$(id)).modal('hide');
  }



  openURLInNewTab(url) {
    console.log(url)
    this.authService.openPDF(url);
  }

  getStringValue(id: string): string {
    return ($(id).val() != undefined
      && $(id).val() != null
      && $(id).val().toString() != null
      && $(id).val().toString() != "")
      ? $(id).val().toString()
      : "";
  }

}

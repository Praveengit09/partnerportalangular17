import {
  Component,
  ViewEncapsulation,
  OnInit,
  ViewChild
} from "@angular/core";
import { DoctorService } from '../../doctor.service';
import { AuthService } from '../../../auth/auth.service';
import { CommonUtil } from '../../../base/util/common-util';
import { TestReportDetailsVo } from '../../../model/report/testreportdetailsvo';
import { DashBoardChartResp } from '../../../model/chart/dashboardChartResp';
import { ChartCoordinate } from '../../../model/chart/chartCoordinate';
import { AppConfig } from '../../../app.config';
import { DoctorUtil } from '../../../base/util/doctor-util';
import { PatientQueue } from "../../../model/reception/patientQueue";
import { CryptoUtil } from "../../../auth/util/cryptoutil";
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service"
import { ConsentRequestConstants } from "../../../constants/doctor/consentrequestconstants";
import { ToasterService } from "../../../layout/toaster/toaster.service";
import { NgOtpInputComponent } from "ng-otp-input";
import { Config } from '../../../base/config';



@Component({
  selector: "reports",
  templateUrl: "./reports.template.html",
  styleUrls: ["./reports.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class ReportsComponent implements OnInit {

  reports: Array<TestReportDetailsVo> = new Array<TestReportDetailsVo>();
  noOfReportsPerPage: number = 10;
  indexOfPage: number;
  displayReports: Array<TestReportDetailsVo> = Array<TestReportDetailsVo>();

  toDate: number = new Date().getTime();
  startingDate: number = new Date().getTime() - 1000 * 60 * 60 * 60 * 24 * 6;
  requestConsentForPatient: string = '';
  selectedPatient: PatientQueue = new PatientQueue();
  consentOtp: string = '';
  consentVerified: boolean = false;

  graphIndex: number = -1;

  currentIndex = -1;
  reportId: any;
  @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

  graphIntervalsIndex = 1;
  showModalBody: boolean = false;
  // 1 week, 1 month, 6 months, 1 yr
  // default 1 month
  graphIntervals = [
    {
      label: "1 Week",
      step: 1000 * 60 * 60 * 24,// One Day -- > 6 lines
      startingDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 6 // 6 days ago
    },
    {
      label: "1 Month",
      step: 1000 * 60 * 60 * 24 * 2,// Two Day --> 15 lines
      startingDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 30 // 30 days ago
    },
    {
      label: "6 Months",
      step: 1000 * 60 * 60 * 24 * 30,// One Month --> 6 lines
      startingDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 6 // 6 months ago
    },
    {
      label: "1 Year",
      step: 1000 * 60 * 60 * 24 * 30,// One Month --> 12 lines
      startingDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 12 // 1 year ago
    }
  ];


  reportResponse: any;
  config: any;

  constructor(
    config: AppConfig,
    private authService: AuthService,
    private commonUtil: CommonUtil,
    private doctorService: DoctorService, private spinner: SpinnerService, private toast: ToasterService
  ) {
    this.config = config.getConfig();


  }
  ngOnInit() {
  }

  onReportsclickHandler() {
    this.consentVerified = false;
    (<any>$("#reportsModel")).modal("show");
    if (Config.portal.doctorOptions.enableOtpBasedConsent == true) {
      this.checkConsent();
    }
    else {
      this.consentVerified = true;
      this.getPatientReports();
    }



  }



  async getPatientReports() {
    this.spinner.start();
    this.doctorService.getAllReportsOfPatient(
      await this.doctorService.patientQueue.patientProfileId).then(data => {
        this.spinner.stop()
        this.showModalBody = true; // to avoid layout shift
        if (data && data.length >= 0 && data != undefined && data != null) {
          this.consentVerified = true;
          this.reports = JSON.parse(JSON.stringify(data));
          this.indexOfPage = 1;
          this.displayReports = JSON.parse(JSON.stringify(this.reports.slice(0, this.noOfReportsPerPage)));
        }
        else {
          this.consentVerified == false && this.onConsentRequestClickHandler();

        }

      }).catch(() => {
        this.spinner.stop();
      });
  }

  openURLInNewTab(url) {
    this.authService.openPDF(url);
  }

  getNameFromUrl(url: string) {
    return ('/' + url).split('/').pop().replace(/\%20/gi, ' ').substring(14, 50);
  }
  convertToDate(str) {
    return this.commonUtil.convertToDate(str);
  }
  changePageIndex(index: number) {
    this.graphIndex = -1;
    this.reportResponse = undefined;
    console.log(index)
    if (this.indexOfPage == index) {
      return;
    }
    this.indexOfPage = index;
    this.displayReports = JSON.parse(JSON.stringify(
      this.reports.slice(
        (this.indexOfPage - 1) * this.noOfReportsPerPage, this.indexOfPage * this.noOfReportsPerPage
      )));
  }
  getNumberOfPages() {
    if (this.noOfReportsPerPage == 0) return Array(1).fill(1);
    if (this.reports.length == 0) return Array(1).fill(1);


    return Array(
      Math.ceil(this.reports.length / this.noOfReportsPerPage)
    ).fill(1);
  }

  getPHRGraphplots(reportId: number, index: number) {
    this.currentIndex = index;
    this.reportId = reportId;
    if (this.graphIndex == index) {

      this.graphIndex = -1;
    }
    else {
      this.reportResponse = undefined;
      this.doctorService.getPHRTestReportGraphplots(
        this.doctorService.patientQueue.patientProfileId,
        this.doctorService.patientQueue.parentProfileId,
        reportId, this.graphIntervals[this.graphIntervalsIndex].startingDate, this.toDate
      ).then((data) => {
        if (data) {
          console.log(data);
          this.reportResponse = data;
          this.graphIndex = index;
        }
        else {
          this.reportResponse = new Array();
          this.graphIndex = index;
        }
      }).catch((e) => {
        console.log(e);
        this.reportResponse = new Array();
        this.graphIndex = index;
      });
    }
  }
  getFileExtensionFromUrl(url: string) {
    return DoctorUtil.getFileExtensionFromUrl(url);
  }
  toggleDropdown(id: string) {
    (<any>$(id)).dropdown();
  }


  checkConsent() {
    let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "consentContentType": 0 };
    requestBody.parentProfileId = this.doctorService.patientQueue.parentProfileId;
    requestBody.patientProfileId = this.doctorService.patientQueue.patientProfileId;
    requestBody.empId = this.authService.employeeDetails.empId;
    requestBody.consentContentType = 2;
    this.spinner.start();
    this.doctorService.checkConsentStatus(requestBody).then((consentStatus) => {
      this.spinner.stop();
      if (consentStatus.statusCode == 200 || consentStatus.statusCode == 201) {
        this.consentVerified = true;
        this.getPatientReports();

      }
      else if (consentStatus.statusCode == 412) {
        this.consentVerified = false;
        this.showModalBody = true;
        this.onConsentRequestClickHandler()
      }

    })
  }

  async onConsentRequestClickHandler() {
    let cryptoUtil: CryptoUtil = new CryptoUtil();

    this.selectedPatient = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('patientQueue')));
    this.requestConsentForPatient = `${this.selectedPatient.patientTitle ? this.selectedPatient.patientTitle + '. ' : ''} ${('' + this.selectedPatient.patientFirstName).slice(0, 22)} ${this.selectedPatient.patientLastName ? ('' + this.selectedPatient.patientLastName).slice(0, 22) : ''}`;
    let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0 };
    requestBody.parentProfileId = this.selectedPatient.parentProfileId;
    requestBody.patientProfileId = this.selectedPatient.patientProfileId;
    requestBody.empId = this.authService.employeeDetails.empId;
    await this.doctorService.requestPatientConsent(requestBody).then((response) => {
      if (response.statusCode == 401) {
        this.toast.show("Something went wrong,please try again", "bg-warning text-white font-weight-bold", 3000);
      }

    });

  }


  verifyConsentOtpHandler() {
    let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "otp": '' };
    requestBody.parentProfileId = this.selectedPatient.parentProfileId;
    requestBody.patientProfileId = this.selectedPatient.patientProfileId;
    requestBody.empId = this.authService.employeeDetails.empId;
    requestBody.otp = this.consentOtp;
    this.doctorService.verifyConsentOtp(requestBody).then((response) => {
      if (response.statusCode == 200 || response.statusCode == 201) {
        this.doctorService.consentOtpVerified = true;
        this.consentVerified = true;
        this.toast.show("Consent request succesful", "bg-success text-white font-weight-bold", 3000);
        this.getPatientReports();
      }
      else if (response.statusCode == 401) {
        this.ngOtpInput.setValue('');
        this.consentOtp = '';
        this.toast.show(response.statusMessage, "bg-warning text-white font-weight-bold", 3000);
      }
    }).catch((err) => {
      console.log(err)
    }).finally(() => {

    });;
  }

  onOtpChange(event) {
    console.log('onOtpChange', event)
    this.consentOtp = event;
  }

}

import { BasePocDetails } from './../../../model/reception/basePocDetails';
import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
  EventEmitter,
  Output
} from "@angular/core";
import { Router } from "@angular/router";
import { AppConfig } from "../../../app.config";
import { CommonUtil } from "../../../base/util/common-util";
import { PatientMedicalAdvise } from "../../../model/advice/patientMedicalAdvise";
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { AuthService } from "../../../auth/auth.service";
import { DoctorPrescriptionTemplate } from "../../../model/advice/doctorPrescriptionTemplate";
import { DoctorService } from "../../doctor.service";
import { FavouritePartners } from '../../../model/employee/favouritePartners';
import { PrescriptionConstants } from '../../../constants/doctor/prescriptionConstants';
import { InvestigationAdvises } from '../../../model/advice/investigationAdvises';
import { PharmacyAdvises } from '../../../model/advice/pharmacyAdvises';

@Component({
  selector: "templatesbox",
  templateUrl: "./templatesbox.template.html",
  styleUrls: ["./templatesbox.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class TemplatesBoxComponent implements OnInit, OnChanges {
  templates: DoctorPrescriptionTemplate[] = [];
  patientMedicalAdvise: PatientMedicalAdvise;

  hasPrescriptionTemplates: boolean;
  modelView: string;


  @Output("wizardView") wizardView = new EventEmitter<string>();
  @Output("noOfTemplates") noOfTemplates = new EventEmitter<number>();
  @Output("template") template = new EventEmitter<DoctorPrescriptionTemplate>();


  @Input()
  total: number;


  @Output("onClickTemplateDetails") onClickTemplateDetails = new EventEmitter<DoctorPrescriptionTemplate>();

  @Input("isFooterHidden")
  isFooterHidden: boolean = false;
  templateAdvice: PatientMedicalAdvise = new PatientMedicalAdvise();


  pdfUrl: any;


  constructor(
    config: AppConfig,
    private commonUtil: CommonUtil,
    private spinnerService: SpinnerService,
    private doctorService: DoctorService,
    private router: Router,
    private authService: AuthService
  ) {
    this.patientMedicalAdvise = this.doctorService.patientMedicalAdvise;
  }

  ngOnInit() {
    let self = this;
    $('#modelIdpastprescription').on('hidden.bs#modelIdprescriptiontemplate', (e) => {
      (<any>$("#modelprescriptionsummary")).modal("hide");
      self.modelView = '';
      self.hasPrescriptionTemplates = false;
    });
    // this.prescriptionTemplate = this.doctorService.prescriptionTemplate;
  }

  private getTemplatesForDoctor() {
    this.patientMedicalAdvise = this.doctorService.patientMedicalAdvise;
    let diagnosisIdList = [];
    if (this.patientMedicalAdvise && this.patientMedicalAdvise.diagnosisList && (this.patientMedicalAdvise.diagnosisList.length > 0))
      for (
        let index = 0;
        index < this.patientMedicalAdvise.diagnosisList.length;
        index++
      ) {
        diagnosisIdList.push(
          this.patientMedicalAdvise.diagnosisList[index].id
        );
      }
    let body = {
      diagnosisIdList: diagnosisIdList,
      doctorId: this.authService.userAuth.employeeId
    };
    this.doctorService.getTemplatesForDoctor(body).then(data => {
      if (data.length > 0) this.templates = JSON.parse(JSON.stringify(data));
      else this.templates = [];
      this.noOfTemplates.emit(this.templates.length)
      this.template.emit(this.templates[0])
    });
  }

  convertToDate(str) {
    return this.commonUtil.convertToDate(str);
  }

  // onClickTemplateDetails(template: DoctorPrescriptionTemplate) {
  //   this.templateAdvice.pharmacyAdvises=template.pharmacyAdvises;
  //   this.templateAdvice.investigationAdvises=template.investigationAdvises;
  //   this.templateAdvice.diagnosisList=template.diagnosisList;
  //   this.modelView = "prescriptiontemplate";
  //   this.doctorService.prescriptionTemplate = template;
  //   this.prescriptionTemplate = this.doctorService.prescriptionTemplate;
  //   this.hasPrescriptionTemplates = true;
  //   if (this.doctorService.prescriptionTemplate) {

  //     (<any>$("#modelIdprescriptiontemplate")).modal({
  //       show: true,
  //       escapeClose: false,
  //       clickClose: false,
  //       showClose: false,
  //       backdrop: "static",
  //       keyboard: false
  //     });
  //   }
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['total']) {
      console.log('Changes detected -------');
    }
    this.getTemplatesForDoctor();

  }

  hideModel(id: string) {
    this.modelView = '';
    (<any>$(id)).modal('hide');
  }
}

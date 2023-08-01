import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { Router } from '@angular/router';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from '../../../auth/auth.service';
import { DoctorService } from '../../doctor.service';
import { DoctorPrescriptionTemplate } from '../../../model/advice/doctorPrescriptionTemplate';
import { InvestigationAdvises } from '../../../model/advice/investigationAdvises';

@Component({
  selector: "savedTemplates",
  templateUrl: "./savedtemplates.template.html",
  styleUrls: ["./savedTemplates.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class savedTemplatesComponent implements OnInit, OnDestroy {
  templates: DoctorPrescriptionTemplate[] = [];
  templateIndex:number;
  canDoctorDeleteTemplate:boolean=true;
  templateDetail: DoctorPrescriptionTemplate = new DoctorPrescriptionTemplate();

  //pagination 
  noOfReportsPerPage: number = 10;
  indexOfPage: number;
  displaytemplates: DoctorPrescriptionTemplate[] = [];
  currentIndex=-1;


  constructor(private authService: AuthService,
    private doctorService: DoctorService, private router: Router, private spinnerService: SpinnerService) {

  }


  ngOnInit() {
    this.getTemplatesofDoctor();
  }
  getTemplatesofDoctor() {
    let body = {
      diagnosisIdList: [],
      doctorId: this.authService.userAuth.employeeId
    };
    this.spinnerService.start();
    this.doctorService.getTemplatesForDoctor(body).then(data => {
      this.spinnerService.stop();
      if (data.length > 0)
        this.templates = JSON.parse(JSON.stringify(data));
      else
        this.templates = [];
      //for pagination
      this.templates = JSON.parse(JSON.stringify(data));
      this.indexOfPage = 1;
      this.displaytemplates = JSON.parse(JSON.stringify(this.templates.slice(0, this.noOfReportsPerPage)));
    }).catch((err)=>{
      this.spinnerService.stop();
    });
  }

  ngOnDestroy() {
    console.log(this.templateDetail);
    console.log(this.doctorService.doctorPrescriptionTemplate);
  }

  isDiagnosisListNull(template: DoctorPrescriptionTemplate) {
    if (template.diagnosisList == null || template.diagnosisList == undefined)
      return true;
    if (template.diagnosisList.length == 0)
      return true;
    else return false;
  }
  isPharmacyAdvisesNull(template: DoctorPrescriptionTemplate) {
    if (template.pharmacyAdvises == null || template.pharmacyAdvises == undefined)
      return true;
    if (template.pharmacyAdvises.pharmacyAdviceList == null || template.pharmacyAdvises.pharmacyAdviceList == undefined)
      return true;
    if (template.pharmacyAdvises.pharmacyAdviceList.length == 0)
      return true;
    else
      return false;

  }
  routeToEditTemplate(template: DoctorPrescriptionTemplate) {
    this.templateDetail = template;
    console.log(this.templateDetail);

    (<any>$("#templateViewModel")).modal("hide");
    console.log(this.templateDetail.investigationAdvises);

    this.doctorService.doctorPrescriptionTemplate = new DoctorPrescriptionTemplate();
    console.log(this.templateDetail.investigationAdvises);

    this.doctorService.doctorPrescriptionTemplate.id = this.templateDetail.id;
    this.doctorService.doctorPrescriptionTemplate.title = this.templateDetail.title;
    this.doctorService.doctorPrescriptionTemplate.diagnosisList = this.templateDetail.diagnosisList;
    this.doctorService.doctorPrescriptionTemplate.pharmacyAdvises = this.templateDetail.pharmacyAdvises;

    this.doctorService.doctorPrescriptionTemplate.investigationAdvises = new InvestigationAdvises();
    //  this.doctorService.doctorPrescriptionTemplate.investigationAdvises=this.templateDetail.investigationAdvises;
    console.log(this.templateDetail.investigationAdvises);
    console.log(this.doctorService.doctorPrescriptionTemplate.investigationAdvises);
    if (this.templateDetail.investigationAdvises && this.templateDetail.investigationAdvises.investigationList)
      this.doctorService.doctorPrescriptionTemplate.investigationAdvises.investigationList = this.templateDetail.investigationAdvises.investigationList;

    this.doctorService.doctorPrescriptionTemplate.doctorId = this.templateDetail.doctorId;
    this.doctorService.doctorPrescriptionTemplate.createdTimestamp = this.templateDetail.createdTimestamp;
    this.doctorService.doctorPrescriptionTemplate.updatedTimestamp = this.templateDetail.updatedTimestamp;
    console.log(this.doctorService.doctorPrescriptionTemplate.investigationAdvises);

    this.router.navigate(["./app/doctor/favorites/editTemplate"]);
  }
  addNewTemplate() {
    this.doctorService.doctorPrescriptionTemplate = new DoctorPrescriptionTemplate();
    this.doctorService.doctorPrescriptionTemplate.title = "";
    this.router.navigate(["./app/doctor/favorites/editTemplate"]);
  }
  openTemplateModel(template: DoctorPrescriptionTemplate,index:number) {
    this.templateDetail = template;
    this.templateIndex=index;
    console.log(index);
    console.log(this.templateDetail);
    (<any>$("#templateViewModel")).modal("show");
  }
  deleteTemplateForDoctor(template:DoctorPrescriptionTemplate){
    (<any>$("#deleteAlertmodelId")).modal("hide");
    if(template && template.id){
      this.doctorService.deleteTemplateForDoctor(template.id).then(data => {
        console.log(data);
       if(data.statusCode==200){
        this.getTemplatesofDoctor();
       }
       else {
         alert(data.statusMessage);
       }
      });
    }

  }
  discardDeleteAlert(){
    (<any>$("#deleteAlertmodelId")).modal("hide");
    (<any>$("#templateViewModel")).modal("show");
  }
  openDeleteAlertmodel(){
    (<any>$("#deleteAlertmodelId")).modal("show");
    (<any>$("#templateViewModel")).modal("hide");
  }


  print(p) { console.log(p) }

  changePageIndex(index: number) {
    if (this.indexOfPage == index) {
      return;
    }
    this.indexOfPage = index;
    this.displaytemplates = JSON.parse(JSON.stringify(
      this.templates.slice(
        (this.indexOfPage - 1) * this.noOfReportsPerPage, this.indexOfPage * this.noOfReportsPerPage
      )));
  }
  getNumberOfPages() {
    if (this.noOfReportsPerPage == 0) return Array(1).fill(1);
    if (this.templates.length == 0) return Array(1).fill(1);
    return Array(
      Math.ceil(this.templates.length / this.noOfReportsPerPage)
    ).fill(1);
  }

}

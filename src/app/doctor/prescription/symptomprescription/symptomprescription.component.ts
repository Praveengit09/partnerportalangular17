import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { VideoCardService } from './../videocard/videocard.service';
import { CDSSClinicalAndDiagnosisResponse } from './../../../model/advice/CDSSClinicalAndDiagnosisResponse';
import { GetCDSSClinicalAndDiagnosisListRequest } from './../../../model/advice/CDSSClinicalAndDiagnosisListRequest';
import { Config } from "./../../../base/config";
import { Symptoms } from "./../../../model/advice/symptoms";
import { DoctorService } from "../../doctor.service";
import { AuthService } from "../../../auth/auth.service";
import { PatientMedicalAdvise } from "../../../model/advice/patientMedicalAdvise";
import { BaseDiagnosis } from "../../../model/advice/baseDiagnosis";


@Component({
  selector: "symptomprescription",
  templateUrl: "./symptomprescription.template.html",
  styleUrls: ["./symptomprescription.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class SymptomPrescriptionComponent implements OnInit, OnDestroy {

  symptoms: Symptoms[] = [];
  sympton: Symptoms;
  displaySymptoms: Symptoms[] = [];

  clinicalExaminations: Symptoms[] = [];
  displayClinicalExaminations: Symptoms[] = [];

  diagnoses: BaseDiagnosis[] = [];
  displayDiagnoses: BaseDiagnosis[] = [];
  temporyDiagnosisList = []


  addSuggestedSymptom: string = "";
  addSuggestedClinicalExamination: string = "";
  addSuggestedDiagnoses: string = "";

  daignose: BaseDiagnosis;
  daignoseTestList: Array<any> = new Array();

  enableDiagnosesProvisionalFinal: boolean[] = new Array();
  modelView: string = "";

  patientMedicalAdvise: PatientMedicalAdvise;

  CDSSClinicalExaminationList: Symptoms[] = new Array();
  CDSSDiagnosisList: BaseDiagnosis[] = new Array();

  disablePromotionalDiagnosis: boolean = false;
  enableCheckedSymptomNotes: boolean = false;
  addButtonAtLast: boolean = false;


  provisionalDiagnosis: boolean;
  finalDiagnosis: boolean;
  isProvisionalSelected: boolean;
  isFinalSelected: boolean;
  mandatoryDiagnosisType: boolean = false;

  constructor(
    private doctorService: DoctorService,
    private videoCardService: VideoCardService,
    private authService: AuthService
  ) {
    if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.disablePromotionalDiagnosis) {
      this.disablePromotionalDiagnosis = true;
    }
    if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableCheckedSymptomNotes) {
      this.enableCheckedSymptomNotes = true;
    }
    if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.addButtonAtLast) {
      this.addButtonAtLast = true;
    }
    if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableMandatoryDiagnosisType) {
      this.mandatoryDiagnosisType = true;
    }
  }

  ngOnInit() {
    //  this.diagonsisTypeSubmit()
    this.patientMedicalAdvise = this.doctorService.patientMedicalAdvise;
    if (this.patientMedicalAdvise == undefined || this.patientMedicalAdvise == null) {
      this.patientMedicalAdvise = new PatientMedicalAdvise();
    }

    this.getSuggestedList();
  }


  ngOnDestroy() {
    this.doctorService.patientMedicalAdvise = this.patientMedicalAdvise;
  }

  getSuggestedList() {
    let getSuggestedListBody = {
      doctorId: this.authService.userAuth.employeeId,
      serviceId: this.doctorService.patientQueue.serviceId,
      totalCount: 35
    };
    this.doctorService.getSuggestedSymptom(getSuggestedListBody).then(data => {
      this.symptoms = JSON.parse(JSON.stringify(data));
      this.displaySymptoms = JSON.parse(JSON.stringify(data));
      this.checkAllSelectedSymptoms();
    });
    this.doctorService
      .getSuggestedClinicalExamination(getSuggestedListBody)
      .then(data => {
        this.displayClinicalExaminations = JSON.parse(JSON.stringify(data));
        this.clinicalExaminations = JSON.parse(JSON.stringify(data));
        this.checkAllSelectedClinicalExaminations();
      });
    this.doctorService
      .getSuggestedDaignosis(getSuggestedListBody)
      .then(data => {
        this.displayDiagnoses = JSON.parse(JSON.stringify(data));
        this.diagnoses = JSON.parse(JSON.stringify(data));
        this.checkAllSelectedDiagnoses();
      });
  }

  onClickClinicalExaminations(clinicalExaminations, index): void {
    console.log(clinicalExaminations);
    if ((<any>$("#" + "clinicalExamination" + index + ":checked")).length > 0) {
      this.patientMedicalAdvise.clinicalExaminationList.push(
        clinicalExaminations
      );
      this.getCDSSClinicalAndDiagnosisList();
    } else {
      this.patientMedicalAdvise.clinicalExaminationList.splice(
        this.patientMedicalAdvise.clinicalExaminationList.indexOf(
          clinicalExaminations
        ),
        1
      );
      this.getCDSSClinicalAndDiagnosisList();
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }

  onClickPresentingComplaints(symptom, index): void {
    if ((<any>$("#" + "symptom" + index + ":checked")).length > 0) {
      if ((<any>$("#" + "notes_symp" + ":checked")).length > 0) {
        this.sympton = symptom;
        $("#adviceremarks").val("");
        <any>$("#" + "symptom" + index).prop("checked", false);
        this.modelView = "symptonsNote";
        (<any>$("#symptomprescriptionmodel")).modal("toggle");
      } else {
        this.patientMedicalAdvise.symptomList.push(symptom);
        this.getCDSSClinicalAndDiagnosisList();
      }
    } else {

      this.patientMedicalAdvise.symptomList.splice(
        this.indexOfObjectWithId(
          this.patientMedicalAdvise.symptomList,
          symptom
        ),
        1
      );

      this.getCDSSClinicalAndDiagnosisList();

      <any>$("#" + "symptom" + index).prop("checked", false);

    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }

  onClickSymptonRemarks() {
    let remark: string = $("#adviceremarks").val().toString();
    this.sympton.doctorRemarks = remark;
    this.patientMedicalAdvise.symptomList.push(this.sympton);
    this.getCDSSClinicalAndDiagnosisList();
    let index = this.indexOfObjectWithId(this.displaySymptoms, this.sympton);
    <any>$("#" + "symptom" + index).prop("checked", true);
    console.log(index);
    (<any>$("#symptomprescriptionmodel")).modal("toggle");
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }



  onChangebyService(num, index) {
    if (num == 1) {
      this.daignoseTestList[index].isProvisionalSelected = true;
      this.daignoseTestList[index].isFinalSelected = false;
    }
    else {
      this.daignoseTestList[index].isFinalSelected = true;
      this.daignoseTestList[index].isProvisionalSelected = false;
    }
    this.provisionalDiagnosis = this.finalDiagnosis = true;
    for (var i = 0; i < this.daignoseTestList.length; i++) {
      if (this.provisionalDiagnosis)
        this.provisionalDiagnosis = this.daignoseTestList[i].isProvisionalSelected;
      if (this.finalDiagnosis)
        this.finalDiagnosis = this.daignoseTestList[i].isFinalSelected;
    }
  }

  onClickDiagnosis(isFinal: boolean) {
    console.log("inside onClickDiagnosis");
    this.daignose.finalDiagnosis = isFinal;
    if (isFinal) this.patientMedicalAdvise.finalDiagnosisCount++;
    else this.patientMedicalAdvise.nonFinalDiagnosisCount++;
    this.patientMedicalAdvise.diagnosisList.push(
      this.daignose
    );
    this.getCDSSClinicalAndDiagnosisList();
    console.log(this.patientMedicalAdvise.diagnosisList);
    if (!this.disablePromotionalDiagnosis) {
      (<any>$("#symptomprescriptionmodel")).modal("toggle");
    }
    this.modelView = '';
    let index = this.indexOfObjectWithId(this.displayDiagnoses, this.daignose);
    <any>$("#" + "diagnosis" + index).prop("checked", true);
    console.log(index);
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }

  onClickColumDiagnosisSelect() {

    console.log("---------this.daignose" + JSON.stringify(this.daignoseTestList))
    if (this.daignoseTestList != undefined && this.daignoseTestList != null && this.daignoseTestList.length > 0) {
      (<any>$("#symptomprescriptionmodel")).modal("toggle");

    }
    else if (this.daignoseTestList == undefined || this.daignoseTestList == null || this.daignoseTestList.length == 0) {
      alert("Please select Diagnosis")

    }

  }

  onClickColumDiagnosis(daignose, index) {
    if ((<any>$("#diagnosis" + index + ":checked")).length > 0) {
      this.modelView = "diagnosis";
      this.daignose = daignose;

      if (this.disablePromotionalDiagnosis) {
        this.onClickDiagnosis(true);
      } else {
        (<any>$("#symptomprescriptionmodel")).modal("toggle");
        <any>$("#" + "diagnosis" + index).prop("checked", false);
      }
    } else {

      if (daignose.finalDiagnosis) this.patientMedicalAdvise.finalDiagnosisCount--;
      else this.patientMedicalAdvise.nonFinalDiagnosisCount--;

      this.patientMedicalAdvise.diagnosisList.splice(
        this.indexOfObjectWithId(this.patientMedicalAdvise.diagnosisList, daignose), 1);
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);

  }

  addSuggestedSymptoms() {
    this.doctorService
      .addSuggestedSymptom({
        doctorId: this.authService.userAuth.employeeId,
        categoryId: 0,
        id: 0,
        name: this.addSuggestedSymptom
      })
      .then(data => {
        if (data) {
          this.displaySymptoms.unshift(data);
          this.symptoms.unshift(data);
          this.addSuggestedSymptom = "";
        }
      });
  }
  searchForMoreSymptoms(event) {
    let searchElement = $("#inlineFormInputGroupSymptons").val().toString().trim();
    if (searchElement.length >= 3) {
      this.addSuggestedSymptom = searchElement;
      this.doctorService
        .getSymptomsAndDiagnosisAutocomplete({
          aliasSearchType: 4,
          favPartnerPocId: 0,
          from: 0,
          id: this.authService.userAuth.employeeId,
          searchCriteria: 0,
          searchTerm: searchElement,
          size: 100
        })
        .then(data => {
          if (data.length > -1) {
            this.displaySymptoms = JSON.parse(JSON.stringify(data));
            this.checkAllSelectedSymptoms();
          }
        });
    } else {
      this.addSuggestedSymptom = "";
      this.displaySymptoms = JSON.parse(JSON.stringify(this.symptoms));
      this.checkAllSelectedSymptoms();
    }
  }

  addSuggestedClinicalExaminations() {
    this.doctorService
      .addSuggestedClinicalExamination({
        doctorId: this.authService.userAuth.employeeId,
        id: 0,
        name: this.addSuggestedClinicalExamination,
        status: 0
      })
      .then(data => {
        console.log(data);
        if (data) {
          console.log(data);
          this.displayClinicalExaminations.unshift(data);
          this.clinicalExaminations.unshift(data);
          this.addSuggestedClinicalExamination = "";
        }
      });
  }

  searchForMoreClinicalExaminations(event) {
    let searchElement = $("#inlineFormInputGroupClinicalExamination").val().toString().trim();
    if (searchElement.length >= 3) {
      this.addSuggestedClinicalExamination = searchElement;
      this.doctorService
        .getSymptomsAndDiagnosisAutocomplete({
          aliasSearchType: 6,
          favPartnerPocId: 0,
          from: 0,
          id: this.authService.userAuth.employeeId,
          searchCriteria: 0,
          searchTerm: searchElement,
          size: 100
        })
        .then(data => {
          console.log("Search Data Clinical Examination");
          console.log(data);
          if (data.length > -1) {
            this.displayClinicalExaminations = JSON.parse(JSON.stringify(data));
            this.checkAllSelectedClinicalExaminations();
          }
        });
    } else {
      this.displayClinicalExaminations = JSON.parse(
        JSON.stringify(this.clinicalExaminations)
      );
      this.checkAllSelectedClinicalExaminations();
      this.addSuggestedClinicalExamination = "";
    }
    //  this.checkAllSelectedClinicalExaminations();
  }
  addSuggestedDiagnosess() {
    this.doctorService
      .addSuggestedDaignosis({
        doctorId: this.authService.userAuth.employeeId,
        id: 0,
        finalDiagnosis: false,
        name: this.addSuggestedDiagnoses,
        serviceId: this.doctorService.patientQueue.serviceId
      })
      .then(data => {
        console.log(data);
        if (data) {
          console.log(data);
          this.displayDiagnoses.unshift(data);
          this.diagnoses.unshift(data);
          this.addSuggestedDiagnoses = "";
        }
      });
  }

  searchForMoreDiagnoses(event) {
    let searchElement = $("#inlineFormInputGroupDiagnosis").val().toString().trim();
    if (searchElement.length >= 3) {
      this.addSuggestedDiagnoses = searchElement;
      this.doctorService
        .getSymptomsAndDiagnosisAutocomplete({
          aliasSearchType: 5,
          favPartnerPocId: 0,
          from: 0,
          id: this.authService.userAuth.employeeId,
          searchCriteria: 0,
          searchTerm: searchElement,
          size: 100
        })
        .then(data => {
          console.log(data);
          if (data.length > -1) {
            this.displayDiagnoses = JSON.parse(JSON.stringify(data));
            this.checkAllSelectedDiagnoses();
          }
        });
    } else {
      this.addSuggestedDiagnoses = "";
      this.displayDiagnoses = JSON.parse(JSON.stringify(this.diagnoses));
      this.checkAllSelectedDiagnoses();
    }
  }

  checkAllSelectedSymptoms() {
    for (
      let i = 0;
      i < this.patientMedicalAdvise.symptomList.length;
      i++
    ) {
      let index = this.indexOfObjectWithId(
        this.displaySymptoms,
        this.patientMedicalAdvise.symptomList[i]
      );
      if (
        index >= 0
      ) {

        this.displaySymptoms.splice(index, 1);
        this.displaySymptoms.unshift(
          this.patientMedicalAdvise.symptomList[i]
        );
        index = 0;
        this.displaySymptoms[index].isSelected = true;
        (<any>$("#symptom" + index)).checked = true;
      } else {
        this.displaySymptoms.unshift(
          this.patientMedicalAdvise.symptomList[i]
        );
        let index = 0;
        this.displaySymptoms[index].isSelected = true;
        (<any>$("#symptom" + index)).checked = true;
      }
    }
  }
  checkAllSelectedClinicalExaminations() {
    for (
      let i = 0;
      i <
      this.patientMedicalAdvise.clinicalExaminationList.length;
      i++
    ) {
      let index = this.indexOfObjectWithId(
        this.displayClinicalExaminations,
        this.patientMedicalAdvise.clinicalExaminationList[i]
      );
      if (
        index >= 0
      ) {
        this.displayClinicalExaminations.splice(index, 1);
        this.displayClinicalExaminations.unshift(
          this.patientMedicalAdvise.clinicalExaminationList[i]
        );
        index = 0;
        this.displayClinicalExaminations[index].isSelected = true;
        (<any>$("#clinicalExamination" + index)).checked = true;
      } else {
        this.displayClinicalExaminations.unshift(
          this.patientMedicalAdvise.clinicalExaminationList[i]
        );
        let index = 0;
        this.displayClinicalExaminations[index].isSelected = true;
        (<any>$("#clinicalExamination" + index)).checked = true;
      }
    }
  }

  checkAllSelectedDiagnoses() {
    for (
      let i = 0;
      i < this.patientMedicalAdvise.diagnosisList.length;
      i++
    ) {
      let index = this.indexOfObjectWithId(
        this.displayDiagnoses,
        this.patientMedicalAdvise.diagnosisList[i]
      );
      if (
        index >= 0
      ) {

        this.displayDiagnoses.splice(index, 1);
        this.displayDiagnoses.unshift(
          this.patientMedicalAdvise.diagnosisList[i]
        );
        index = 0;
        this.displayDiagnoses[index].isSelected = true;
        (<any>$("#diagnosis" + index)).checked = true;
      } else {
        this.displayDiagnoses.unshift(
          this.patientMedicalAdvise.diagnosisList[i]
        );
        let index = 0;
        this.displayDiagnoses[index].isSelected = true;
        (<any>$("#diagnosis" + index)).checked = true;
      }
    }
  }

  indexOfObjectWithId(obj1: any[], obj2): number {
    for (let i = 0; i < obj1.length; i++) {
      if (obj1[i].id == obj2.id) {
        return i;
      }
    }
    return -1;
  }

  getCDSSClinicalAndDiagnosisList() {
    if (this.patientMedicalAdvise.symptomList.length > 0) {
      let request: GetCDSSClinicalAndDiagnosisListRequest = new GetCDSSClinicalAndDiagnosisListRequest();
      request.symptomList = this.patientMedicalAdvise.symptomList;
      request.clinicalExaminationList = this.patientMedicalAdvise.clinicalExaminationList;
      request.doctorId = this.authService.employeeDetails.empId;

      //  console.clear();
      if (this.authService.selectedPocDetails) {
        if (this.authService.selectedPocDetails.brandId)
          request.pocBrandId = this.authService.selectedPocDetails.brandId;
        if (this.authService.selectedPocDetails.cdssOptions != null) {
          if (this.authService.selectedPocDetails.cdssOptions.doctorSpecific)
            request.doctorSpecific = this.authService.selectedPocDetails.cdssOptions.doctorSpecific;
          if (this.authService.selectedPocDetails.cdssOptions.brandSpecific)
            request.brandSpecific = this.authService.selectedPocDetails.cdssOptions.brandSpecific;
          if (this.authService.selectedPocDetails.cdssOptions.brandDefaults)
            request.brandDefaults = this.authService.selectedPocDetails.cdssOptions.brandDefaults;
        }
      }
      // DoctorConsultationManager manager = new DoctorConsultationManager();
      this.doctorService.getCDSSClinicalAndDiagnosisList(request).then((data: CDSSClinicalAndDiagnosisResponse) => {
        console.log("request");
        console.log(request);
        console.log("response");
        console.log(data);
        let cdss: CDSSClinicalAndDiagnosisResponse = JSON.parse(JSON.stringify(data));
        if (cdss.clinicalExaminationMap)
          this.CDSSClinicalExaminationList = JSON.parse(JSON.stringify(Object.values(cdss.clinicalExaminationMap)));
        else this.CDSSClinicalExaminationList = new Array();
        if (cdss.diagnosisMap)
          this.CDSSDiagnosisList = JSON.parse(JSON.stringify(Object.values(cdss.diagnosisMap)));
        else this.CDSSDiagnosisList = new Array();
        console.log(this.CDSSClinicalExaminationList);
        this.highlightCDSSClinicalExaminations();
        this.highlightCDSSDiagnoses();
      });



    } else {
      // newClinicalExaminationFragment.setCDSSList(new HashMap<Long, ClinicalExamination>());
      // newDiagnosisFragment.setCDSSList(new HashMap<Long, Diagnosis>());
      this.CDSSClinicalExaminationList = new Array();
      for (let i = 0; i < this.displayClinicalExaminations.length; i++) {
        this.displayClinicalExaminations[i].isCDSS = false;
      }
      this.CDSSDiagnosisList = new Array();
      for (let i = 0; i < this.displayDiagnoses.length; i++) {
        this.displayDiagnoses[i].isCDSS = false;
      }
    }
  }
  highlightCDSSClinicalExaminations() {
    console.log("list of true CDSS");
    for (let i = 0; i < this.displayClinicalExaminations.length; i++) {
      this.displayClinicalExaminations[i].isCDSS = false;
    }
    for (
      let i = 0;
      i <
      this.CDSSClinicalExaminationList.length;
      i++
    ) {
      let index = this.indexOfObjectWithId(
        this.displayClinicalExaminations,
        this.CDSSClinicalExaminationList[i]
      );
      if (
        index >= 0
      ) {
        this.displayClinicalExaminations[index].isCDSS = true;
      } else {
        this.displayClinicalExaminations.unshift(
          this.CDSSClinicalExaminationList[i]
        );
        this.displayClinicalExaminations[0].isCDSS = true;
      }
    }
  }

  highlightCDSSDiagnoses() {
    console.log("list of true CDSS");
    for (let i = 0; i < this.displayDiagnoses.length; i++) {
      this.displayDiagnoses[i].isCDSS = false;
    }
    for (
      let i = 0;
      i <
      this.CDSSDiagnosisList.length;
      i++
    ) {
      let index = this.indexOfObjectWithId(
        this.displayDiagnoses,
        this.CDSSDiagnosisList[i]
      );
      if (
        index >= 0
      ) {
        this.displayDiagnoses[index].isCDSS = true;
      } else {
        this.displayDiagnoses.unshift(
          this.CDSSDiagnosisList[i]
        );
        this.displayDiagnoses[0].isCDSS = true;
      }
    }
  }

  diagonsisTypeSubmit() {
    let count = 0
    for (let diagnosis of this.daignoseTestList) {
      if (diagnosis.isFinalSelected == true || diagnosis.isProvisionalSelected == true) {
        count++
      }
    }
    if (count == this.daignoseTestList.length) {
      for (let diagnosisList of this.temporyDiagnosisList) {
        if (!this.patientMedicalAdvise.diagnosisList.includes(diagnosisList)) {
          this.patientMedicalAdvise.diagnosisList.push(diagnosisList)
        }
      }
      // this.patientMedicalAdvise.diagnosisList=this.loc
    }
    else {
      alert('please select type')
    }
    // this.doctorService.diag=true 


  }

}

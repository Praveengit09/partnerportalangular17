import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from '../../../auth/auth.service';
import { ServiceDetail } from '../../../model/employee/servicedetail';
import { DoctorService } from '../../doctor.service';
import { Symptoms } from '../../../model/advice/symptoms';
import { BaseDiagnosis } from '../../../model/advice/baseDiagnosis';
import { Pharmacy } from '../../../model/pharmacy/pharmacy';
import { InvestigationDetails } from '../../../model/diagnostics/investigationDetails';
import { ServiceItem } from '../../../model/service/serviceItem';
import { TextAdvise } from '../../../model/advice/textAdvise';
import { Immunization } from '../../../model/advice/immunization';
import { Duration } from '../../../model/pharmacy/duration';
import { PharmacyService } from '../../../pharmacy/pharmacy.service';
import { Config } from './../../../base/config';

@Component({
  selector: "PrescriptionFavorites",
  templateUrl: "./prescriptionFavorites.template.html",
  styleUrls: ["./prescriptionFavorites.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class PrescriptionFavoritesComponent implements OnInit {

  serviceList: Array<ServiceDetail> = new Array<ServiceDetail>();
  moduleList: Array<string> = [
    'Symptoms',
    'Clinical Examination',
    'Diagnosis',
    'Medicines',
    'Investigations',
    'Procedures',
    'Non-Medication',
    'Immunization'
  ];
  moduleIndex: number = 0;
  moduleName: string = this.moduleList[0];

  addSuggestedSymptom: string = "";
  addSuggestedClinicalExamination: string = "";
  addSuggestedDiagnoses: string = "";
  addSuggestedMedicine: string = "";
  addSuggestedInvestigation: string = "";
  addSuggestedProcedure: string = "";
  addSuggestedNonMedication: string = "";
  addSuggestedImmunization: string = "";

  displaySymptoms: Symptoms[] = [];
  symptoms: Symptoms[] = [];
  selectedSymptomList: Symptoms[] = [];

  clinicalExaminations: Symptoms[] = [];
  displayClinicalExaminations: Symptoms[] = [];
  selectedClinicalExaminations: Symptoms[] = [];

  diagnoses: BaseDiagnosis[] = [];
  displayDiagnoses: BaseDiagnosis[] = [];
  selectedDiagnoses: BaseDiagnosis[] = [];

  medicines: Pharmacy[] = [];
  displayMedicines: Pharmacy[] = [];
  selectedMedicines: Pharmacy[] = [];

  investigations: InvestigationDetails[] = [];
  displayInvestigations: InvestigationDetails[] = [];
  selectedInvestigations: InvestigationDetails[] = [];

  procedures: ServiceItem[] = [];
  displayProcedures: ServiceItem[] = [];
  selectedProcedures: ServiceItem[] = [];

  nonMedications: TextAdvise[] = [];
  displayNonMedications: TextAdvise[] = [];
  selectedNonMedications: TextAdvise[] = [];

  immunizations: Immunization[] = [];
  dispayImmunizations: Immunization[] = [];
  selectedImmunizations: Immunization[] = [];



  isNotSavedChanges: boolean = false;
  selectedService: ServiceDetail = new ServiceDetail();
  doctorFavourites: Array<any> = new Array();

  disableImmunization: boolean = false;
  procedurePrescriptionLabel: string = null;
  nonMedicationPrescriptionLabel: string = null;
  admissionNotePrescriptionLabel: string = null;

  constructor(private authService: AuthService, private pharmacyService: PharmacyService, private doctorService: DoctorService) {
    this.serviceList = this.authService.employeeDetails.serviceList;
    this.selectedService = this.serviceList[0];

    this.doctorService.getdoctorfavourites(this.authService.userAuth.employeeId).then(data => {
      this.doctorFavourites = data;
      this.changeServiceList();
    });

    this.disableImmunization = Config.portal.doctorOptions && Config.portal.doctorOptions.disableImmunization ? Config.portal.doctorOptions.disableImmunization : false;
    this.procedurePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.procedureLabel && Config.portal.doctorOptions.prescriptionLabels.procedureLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.procedureLabel : null;
    this.nonMedicationPrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel && Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel : null;
    this.admissionNotePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel : null;
  }

  saveCheck(id: string) {
    if (this.isNotSavedChanges) {
      console.log(this.selectedService.serviceId);

      (<any>$("#saveAlertmodelId")).modal({
        show: true,
        escapeClose: false,
        clickClose: false,
        showClose: false,
        backdrop: "static",
        keyboard: false
      });
      return;
    }
    else {
      // (<any>$(id)).dropdown();
    }

  }
  toggleDropdown(id: string) {
    (<any>$(id)).dropdown();
  }
  onClickServiceList(service: ServiceDetail, i: number) {
    if (this.isNotSavedChanges) {
      console.log(this.selectedService.serviceId);
      (<any>$("#saveAlertmodelId")).modal({
        show: true,
        escapeClose: false,
        clickClose: false,
        showClose: false,
        backdrop: "static",
        keyboard: false
      });
      return;
    }
    else {
      this.selectedService = service;
      this.changeServiceList();
    }
  }
  onClickModuleList(module: string, i: number) {
    if (this.isNotSavedChanges) {
      console.log(this.selectedService.serviceId);
      (<any>$("#saveAlertmodelId")).modal({
        show: true,
        escapeClose: false,
        clickClose: false,
        showClose: false,
        backdrop: "static",
        keyboard: false
      });
      return;
    }
    else {
      this.moduleName = module;
      this.moduleIndex = i;

    }

  }


  changeServiceList() {
    if (this.isNotSavedChanges) {
      console.log(this.selectedService);
      (<any>$("#saveAlertmodelId")).modal({
        show: true,
        escapeClose: false,
        clickClose: false,
        showClose: false,
        backdrop: "static",
        keyboard: false
      });
      return;
    }



    for (let index = 0; index < this.doctorFavourites.length; index++) {
      if (this.selectedService.serviceId == this.doctorFavourites[index].serviceId) {

        this.selectedSymptomList = JSON.parse(JSON.stringify(this.doctorFavourites[index].symptomList));
        this.symptoms = JSON.parse(JSON.stringify(this.doctorFavourites[index].symptomList));
        this.displaySymptoms = JSON.parse(JSON.stringify(this.doctorFavourites[index].symptomList));

        this.selectedClinicalExaminations = JSON.parse(JSON.stringify(this.doctorFavourites[index].clinicalExaminationList));
        this.clinicalExaminations = JSON.parse(JSON.stringify(this.doctorFavourites[index].clinicalExaminationList));
        this.displayClinicalExaminations = JSON.parse(JSON.stringify(this.doctorFavourites[index].clinicalExaminationList));

        this.selectedDiagnoses = JSON.parse(JSON.stringify(this.doctorFavourites[index].diagnosisList));
        this.diagnoses = JSON.parse(JSON.stringify(this.doctorFavourites[index].diagnosisList));
        this.displayDiagnoses = JSON.parse(JSON.stringify(this.doctorFavourites[index].diagnosisList));

        //

        this.selectedImmunizations = JSON.parse(JSON.stringify(this.doctorFavourites[index].immunizationList));
        this.immunizations = JSON.parse(JSON.stringify(this.doctorFavourites[index].immunizationList));
        this.dispayImmunizations = JSON.parse(JSON.stringify(this.doctorFavourites[index].immunizationList));

        this.selectedInvestigations = JSON.parse(JSON.stringify(this.doctorFavourites[index].investigationList));
        this.investigations = JSON.parse(JSON.stringify(this.doctorFavourites[index].investigationList));
        this.displayInvestigations = JSON.parse(JSON.stringify(this.doctorFavourites[index].investigationList));

        this.selectedMedicines = JSON.parse(JSON.stringify(this.doctorFavourites[index].medicineList));
        this.medicines = JSON.parse(JSON.stringify(this.doctorFavourites[index].medicineList));
        this.displayMedicines = JSON.parse(JSON.stringify(this.doctorFavourites[index].medicineList));

        this.selectedNonMedications = JSON.parse(JSON.stringify(this.doctorFavourites[index].nonMedicationList));
        this.nonMedications = JSON.parse(JSON.stringify(this.doctorFavourites[index].nonMedicationList));
        this.displayNonMedications = JSON.parse(JSON.stringify(this.doctorFavourites[index].nonMedicationList));

        this.selectedProcedures = JSON.parse(JSON.stringify(this.doctorFavourites[index].procedureList));
        this.procedures = JSON.parse(JSON.stringify(this.doctorFavourites[index].procedureList));
        this.displayProcedures = JSON.parse(JSON.stringify(this.doctorFavourites[index].procedureList));



        console.log(this.symptoms);

        console.log(this.displaySymptoms);
        this.checkAllSelectedSymptoms();
        this.checkAllSelectedClinicalExaminations();
        this.checkAllSelectedDiagnoses();
        this.checkAllSelectedMedicines();
        this.checkAllSelectedInvestigations();
        this.checkAllSelectedProcedures();
        this.checkAllSelectedNonMedication();
        this.checkAllSelectedImmunizationn();
      }
    }
    this.clearSearchFields();
  }
  changeOfModule() {
    if (this.isNotSavedChanges) {

      (<any>$("#saveAlertmodelId")).modal({
        show: true,
        escapeClose: false,
        clickClose: false,
        showClose: false,
        backdrop: "static",
        keyboard: false
      });
      return;
    }

    // this.moduleName=this.getStringValue('#module_name');
    // this.moduleIndex= this.moduleList.indexOf(
    //   ''+this.moduleName
    // );
    this.clearSearchFields();
  }


  clearSearchFields() {
    this.addSuggestedSymptom = "";
    this.addSuggestedClinicalExamination = "";
    this.addSuggestedDiagnoses = "";
    this.addSuggestedMedicine = "";
    this.addSuggestedInvestigation = "";
    this.addSuggestedProcedure = "";
    this.addSuggestedNonMedication = "";
    this.addSuggestedImmunization = "";
    $('#inlineFormInputGroupSymptons').val('');
    $('#inlineFormInputGroupClinicalExamination').val('');
    $('#inlineFormInputGroupDiagnosis').val('');
    $('#inlineFormInputGroupMedicines').val('');
    $('#inlineFormInputGroupInvestigations').val('');
    $('#inlineFormInputGroupProcedure').val('');
    $('#inlineFormInputGroupNonMedication').val('');
    $('#inlineFormInputGroupImmunization').val('');
  }

  ngOnInit() {
  }
  indexOfObjectWithId(obj1: any[], obj2): number {
    for (let i = 0; i < obj1.length; i++) {
      if (obj1[i].id == obj2.id) {
        return i;
      }
    }
    return -1;
  }
  indexOfObjectWithServiceId(obj1: any[], obj2): number {
    for (let i = 0; i < obj1.length; i++) {
      if (obj1[i].serviceId == obj2.serviceId) {
        return i;
      }
    }
    return -1;
  }
  indexOfObjectWithGenericMedicineId(obj1: any[], obj2): number {
    for (let i = 0; i < obj1.length; i++) {
      if (
        obj1[i].genericMedicine.genericMedicineId ==
        obj2.genericMedicine.genericMedicineId
      ) {
        return i;
      }
    }
    return -1;
  }
  indexOfObjectWithPharmacy(obj1: any[], obj2): number {
    for (let i = 0; i < obj1.length; i++) {
      if ((obj1[i].productId + obj1[i].productName) == (obj2.productId + obj2.productName)) {
        return i;
      }
    }
    return -1;
  }

  getStringValue(id: string): string {
    return ($(id).val() != undefined
      && $(id).val() != null
      && $(id).val().toString() != null
      && $(id).val().toString() != "")
      ? $(id).val().toString()
      : "";
  }

  checkAllSelectedSymptoms() {
    for (
      let i = 0;
      i < this.selectedSymptomList.length;
      i++
    ) {
      let index = this.indexOfObjectWithId(
        this.displaySymptoms,
        this.selectedSymptomList[i]
      );
      if (
        index >= 0
      ) {
        this.displaySymptoms.splice(index, 1);
        this.displaySymptoms.unshift(
          this.selectedSymptomList[i]
        );
        index = 0;
        if (this.displaySymptoms[index]) {
          this.displaySymptoms[index].isSelected = true;
        }
        (<any>$("#symptom" + index)).checked = true;
      } else {
        this.displaySymptoms.unshift(
          this.selectedSymptomList[i]
        );
        let index = 0;
        if (this.displaySymptoms[index]) {
          this.displaySymptoms[index].isSelected = true;
        }
        (<any>$("#symptom" + index)).checked = true;
      }
    }
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

  onClickPresentingComplaints(symptom, index): void {
    this.isNotSavedChanges = true;
    let i = this.indexOfObjectWithId(this.selectedSymptomList, symptom);
    if (i == -1) {
      symptom.isSelected = true;
      this.selectedSymptomList.push(symptom);
    }
    else {
      symptom.isSelected = false;
      this.selectedSymptomList.splice(
        i,
        1
      );
    }
    console.log(this.selectedSymptomList);
  }

  addSuggestedSymptoms() {
    this.isNotSavedChanges = true;
    this.doctorService
      .addSuggestedSymptom({
        doctorId: this.authService.userAuth.employeeId,
        categoryId: 0,
        id: 0,
        name: this.addSuggestedSymptom
      })
      .then(data => {
        if (data) {
          data.isSelected = true;
          this.displaySymptoms.push(data);
          this.symptoms.push(data);
          this.selectedSymptomList.push(data);
          this.checkAllSelectedSymptoms();
          this.addSuggestedSymptom = "";
        }
      });
  }



  checkAllSelectedClinicalExaminations() {
    for (
      let i = 0;
      i <
      this.selectedClinicalExaminations.length;
      i++
    ) {
      let index = this.indexOfObjectWithId(
        this.displayClinicalExaminations,
        this.selectedClinicalExaminations[i]
      );
      if (
        index >= 0
      ) {
        this.displayClinicalExaminations.splice(index, 1);
        this.displayClinicalExaminations.unshift(
          this.selectedClinicalExaminations[i]
        );
        index = 0;
        if (this.displayClinicalExaminations[index]) {
          this.displayClinicalExaminations[index].isSelected = true;
        }
        (<any>$("#clinicalExamination" + index)).checked = true;
      } else {
        this.displayClinicalExaminations.unshift(
          this.selectedClinicalExaminations[i]
        );
        let index = 0;
        if (this.displayClinicalExaminations[index]) {
          this.displayClinicalExaminations[index].isSelected = true;
        }
        (<any>$("#clinicalExamination" + index)).checked = true;
      }
    }
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
  onClickClinicalExaminations(clinicalExaminations, index): void {
    this.isNotSavedChanges = true;
    let i = this.indexOfObjectWithId(this.selectedClinicalExaminations, clinicalExaminations);
    if (i == -1) {
      clinicalExaminations.isSelected = true;
      this.selectedClinicalExaminations.push(clinicalExaminations);
    }
    else {
      clinicalExaminations.isSelected = false;
      this.selectedClinicalExaminations.splice(
        i,
        1
      );
    }
  }
  addSuggestedClinicalExaminations() {
    this.isNotSavedChanges = true;
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
          data.isSelected = true;
          console.log(data);
          this.displayClinicalExaminations.push(data);
          this.selectedClinicalExaminations.push(data);
          this.clinicalExaminations.push(data);
          this.checkAllSelectedClinicalExaminations();
          this.addSuggestedClinicalExamination = "";
        }
      });
  }

  checkAllSelectedDiagnoses() {
    for (
      let i = 0;
      i < this.selectedDiagnoses.length;
      i++
    ) {
      let index = this.indexOfObjectWithId(
        this.displayDiagnoses,
        this.selectedDiagnoses[i]
      );
      if (
        index >= 0
      ) {

        this.displayDiagnoses.splice(index, 1);
        this.displayDiagnoses.unshift(
          this.selectedDiagnoses[i]
        );
        index = 0;
        if (this.displayDiagnoses[index]) {
          this.displayDiagnoses[index].isSelected = true;
        }
        (<any>$("#diagnosis" + index)).checked = true;
      } else {
        this.displayDiagnoses.unshift(
          this.selectedDiagnoses[i]
        );
        let index = 0;
        if (this.displayDiagnoses[index]) {
          this.displayDiagnoses[index].isSelected = true;
        }
        (<any>$("#diagnosis" + index)).checked = true;
      }
    }
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
  addSuggestedDiagnosess() {
    this.isNotSavedChanges = true;
    this.doctorService
      .addSuggestedDaignosis({
        doctorId: this.authService.userAuth.employeeId,
        id: 0,
        finalDiagnosis: false,
        name: this.addSuggestedDiagnoses,
        serviceId: this.selectedService.serviceId,
      })
      .then(data => {
        console.log(data);
        if (data) {
          data.isSelected = true;
          console.log(data);
          this.displayDiagnoses.push(data);
          this.diagnoses.push(data);
          this.selectedDiagnoses.push(data);
          this.checkAllSelectedDiagnoses();
          this.addSuggestedDiagnoses = "";
        }
      });
  }
  onClickColumDiagnosis(daignose, index) {
    this.isNotSavedChanges = true;
    let i = this.indexOfObjectWithId(this.selectedDiagnoses, daignose);
    if (i == -1) {
      daignose.isSelected = true;
      this.selectedDiagnoses.push(daignose);
    }
    else {
      daignose.isSelected = false;
      this.selectedDiagnoses.splice(
        i,
        1
      );
    }
  }

  checkAllSelectedMedicines() {
    console.log("trying to check checkAllSelectedMedicines");

    for (
      let i = 0;
      i <
      this.selectedMedicines
        .length;
      i++
    ) {
      let index = this.indexOfObjectWithPharmacy(
        this.displayMedicines,
        this.selectedMedicines[i]
      );
      if (
        index >= 0
      ) {
        console.log("found this object common");
        console.log(
          this.selectedMedicines[i].productName
        );
        let medicine: Pharmacy = JSON.parse(JSON.stringify(this.displayMedicines[index]));

        this.displayMedicines.splice(index, 1);
        this.displayMedicines.unshift(
          medicine
        );
        if (this.displayMedicines[0]) {
          this.displayMedicines[0].isSelected = true;
        }
      } else {
        console.log("object not found so inserted");
        console.log(
          this.selectedMedicines[i].productName
        );
        let medicine: Pharmacy = JSON.parse(JSON.stringify(this.selectedMedicines[i]));

        medicine.quantity = null;
        medicine.doseUnit = null;
        medicine.doseLabel = null;
        medicine.intakeRoute = null;
        medicine.duration = new Duration();
        medicine.takenWhenFood = null;
        medicine.isSOS = null;

        this.displayMedicines.unshift(
          medicine
        );
        if (this.displayMedicines[0]) {
          this.displayMedicines[0].isSelected = true;
        }

      }
    }
  }
  searchForMoreMedicines(event) {
    console.log(event);

    let searchElement: string = '' + this.getStringValue("#inlineFormInputGroupMedicines").trim();
    console.log(searchElement);
    if (searchElement.length >= 3) {
      this.addSuggestedMedicine = searchElement;
      this.pharmacyService
        .searchProduct({
          aliasSearchType: 2,
          favPartnerPocId: this.authService.userAuth.pocId,
          from: 0,
          id: this.authService.userAuth.employeeId,
          searchCriteria: 2,
          searchTerm: searchElement,
          size: 100
        })
        .then(data => {
          console.log(data);
          if (data.length > -1) {
            this.displayMedicines = JSON.parse(JSON.stringify(data));
            this.checkAllSelectedMedicines();
          }
        });
    } else {
      this.addSuggestedMedicine = "";
      this.displayMedicines = JSON.parse(JSON.stringify(this.medicines));
      this.checkAllSelectedMedicines();
    }
  }
  addSuggestedMedicines() {
    this.isNotSavedChanges = true;
    let medicine: Pharmacy = new Pharmacy();
    medicine.productName = this.addSuggestedMedicine;
    medicine.addedByDoctor = true;
    medicine.isSelected = true;
    this.displayMedicines.unshift(medicine);
    this.medicines.unshift(medicine);
    this.selectedMedicines.unshift(medicine);
    this.addSuggestedMedicine = "";
  }
  onClickMedicines(medicine, index): void {
    this.isNotSavedChanges = true;
    let i = this.indexOfObjectWithPharmacy(this.selectedMedicines, medicine);
    if (i == -1) {
      medicine.isSelected = true;
      this.selectedMedicines.push(medicine);
    }
    else {
      medicine.isSelected = false;
      this.selectedMedicines.splice(
        i,
        1
      );
    }
  }

  checkAllSelectedInvestigations() {
    for (
      let i = 0;
      i <
      this.selectedInvestigations.length;
      i++
    ) {
      let index = this.indexOfObjectWithServiceId(
        this.displayInvestigations,
        this.selectedInvestigations[i]
      );
      if (
        index >= 0
      ) {

        this.displayInvestigations.splice(index, 1);
        this.displayInvestigations.unshift(
          this.selectedInvestigations[i]
        );
        if (this.displayInvestigations[0]) {
          this.displayInvestigations[0].isSelected = true;
        }
      } else {
        this.displayInvestigations.unshift(
          this.selectedInvestigations[i]
        );
        if (this.displayInvestigations[0]) {
          this.displayInvestigations[0].isSelected = true;
        }
      }
    }
  }
  searchForMoreInvestigations(event) {
    console.log(event);

    let searchElement: string = this.getStringValue("#inlineFormInputGroupInvestigations").trim();
    console.log(searchElement);
    if (searchElement.length >= 3) {
      this.addSuggestedInvestigation = searchElement;
      this.doctorService
        .getDiagnosticSearchTest({
          aliasSearchType: 2,
          favPartnerPocId: this.authService.userAuth.pocId,
          from: 0,
          id: this.authService.userAuth.employeeId,
          searchCriteria: 0,
          searchTerm: searchElement,
          size: 100
        })
        .then(data => {
          console.log(data);
          if (data.length > -1) {
            this.displayInvestigations = JSON.parse(JSON.stringify(data));
            this.checkAllSelectedInvestigations();
          }
        });
    } else {
      this.addSuggestedInvestigation = "";
      this.displayInvestigations = JSON.parse(
        JSON.stringify(this.investigations)
      );
      this.checkAllSelectedInvestigations();
    }
  }
  addSuggestedInvestigations() {
    this.isNotSavedChanges = true;
    this.doctorService
      .addSuggestedInvestigations({
        doctorId: this.authService.userAuth.employeeId,
        doctorServiceId: this.selectedService.serviceId,
        homeCollections: 0,
        phrTestId: 0,
        pocId: this.authService.userAuth.pocId,
        categoryId: 0,
        parentServiceId: 0,
        serviceId: 0,
        serviceName: this.addSuggestedInvestigation,
        finalAmount: 0.0,
        grossPrice: 0.0,
        netPrice: 0.0,
        originalAmount: 0.0,
        otherDiscountAmount: 0.0,
        packageDiscountAmount: 0.0,
        quantity: 0,
        taxationAmount: 0.0
      })
      .then(data => {
        console.log(data);
        if (data) {
          data.isSelected = true;
          console.log(data);
          this.displayInvestigations.push(data);
          this.investigations.push(data);
          this.selectedInvestigations.push(data);
          this.checkAllSelectedInvestigations();
          this.addSuggestedInvestigation = "";
        }
      });
  }
  onClickInvestigations(investigation, index): void {
    this.isNotSavedChanges = true;
    let i = this.indexOfObjectWithServiceId(this.selectedInvestigations, investigation);
    if (i == -1) {
      investigation.isSelected = true;
      this.selectedInvestigations.push(investigation);
    }
    else {
      investigation.isSelected = false;
      this.selectedInvestigations.splice(
        i,
        1
      );
    }
  }




  addSuggestedProcedures() {
    this.isNotSavedChanges = true;
    this.doctorService
      .addSuggestedProcedures({
        doctorId: this.authService.userAuth.employeeId,
        doctorServiceId: this.selectedService.serviceId,
        homeCollections: 0,
        phrTestId: 0,
        pocId: 0,
        categoryId: 0,
        parentServiceId: 0,
        serviceId: 0,
        serviceName: this.addSuggestedProcedure,
        finalAmount: 0.0,
        grossPrice: 0.0,
        netPrice: 0.0,
        originalAmount: 0.0,
        otherDiscountAmount: 0.0,
        packageDiscountAmount: 0.0,
        quantity: 0,
        taxationAmount: 0.0
      })
      .then(data => {
        console.log(data);
        if (data) {
          data.isSelected = true;
          console.log(data);
          this.displayProcedures.push(data);
          this.procedures.push(data);
          this.selectedProcedures.push(data);
          this.checkAllSelectedProcedures();
          this.addSuggestedProcedure = "";
        }
      });
  }
  searchForMoreProcedures(event) {
    console.log(event);

    let searchElement: string = this.getStringValue("#inlineFormInputGroupProcedure").trim();
    console.log(searchElement);
    if (searchElement.length >= 3) {
      this.addSuggestedProcedure = searchElement;
      this.doctorService
        .getProcudureList(searchElement, this.authService.userAuth.employeeId)
        .then(data => {
          console.log(data);
          if (data.length > -1) {
            this.displayProcedures = JSON.parse(JSON.stringify(data));
            this.checkAllSelectedProcedures();
          }
        });
    } else {
      this.addSuggestedProcedure = "";
      this.displayProcedures = JSON.parse(JSON.stringify(this.procedures));
      this.checkAllSelectedProcedures();
    }
  }
  checkAllSelectedProcedures() {
    for (
      let i = 0;
      i < this.selectedProcedures.length;
      i++
    ) {
      let index = this.indexOfObjectWithServiceId(
        this.displayProcedures,
        this.selectedProcedures[i]
      );
      if (
        index >= 0
      ) {

        this.displayProcedures.splice(index, 1);
        this.displayProcedures.unshift(
          this.selectedProcedures[i]
        );
        (<any>$("#procedure" + "0")).checked = true;
        if (this.displayProcedures[0]) {
          this.displayProcedures[0].isSelected = true;
        }
      } else {
        this.displayProcedures.unshift(
          this.selectedProcedures[i]
        );

        (<any>$("#procedure" + "0")).checked = true;
        if (this.displayProcedures[0]) {
          this.displayProcedures[0].isSelected = true;
        }
      }
    }
  }
  onClickProcedures(procedure, index): void {
    this.isNotSavedChanges = true;
    let i = this.indexOfObjectWithServiceId(this.selectedProcedures, procedure);
    if (i == -1) {
      procedure.isSelected = true;
      this.selectedProcedures.push(procedure);
    }
    else {
      procedure.isSelected = false;
      this.selectedProcedures.splice(
        i,
        1
      );
    }
  }

  addSuggestedNonMedications() {
    this.isNotSavedChanges = true;
    this.doctorService
      .addSuggestedNonMedication({
        doctorId: this.authService.userAuth.employeeId,
        status: 0,
        id: 0,
        title: this.addSuggestedNonMedication
      })
      .then(data => {
        console.log(data);
        if (data) {
          data.isSelected = true;
          console.log(data);
          this.displayNonMedications.push(data);
          this.nonMedications.push(data);
          this.selectedNonMedications.push(data);
          this.checkAllSelectedNonMedication();
          this.addSuggestedNonMedication = "";
        }
      });
  }
  searchForMoreNonMedication(event) {
    console.log(event);

    let searchElement: string = this.getStringValue("#inlineFormInputGroupNonMedication").trim();
    console.log(searchElement);
    if (searchElement.length >= 3) {
      this.addSuggestedNonMedication = searchElement;
      this.doctorService
        .getNonMedicationAutocomplete({
          aliasSearchType: 7,
          favPartnerPocId: this.authService.userAuth.pocId,
          from: 0,
          id: this.authService.userAuth.employeeId,
          searchCriteria: 0,
          searchTerm: searchElement,
          size: 100
        })
        .then(data => {
          console.log(data);
          if (data.length > -1) {
            this.displayNonMedications = JSON.parse(JSON.stringify(data));
            this.checkAllSelectedNonMedication();
          }
        });
    } else {
      this.addSuggestedNonMedication = "";
      this.displayNonMedications = JSON.parse(
        JSON.stringify(this.nonMedications)
      );
      this.checkAllSelectedNonMedication();
    }
  }
  checkAllSelectedNonMedication() {
    for (
      let i = 0;
      i < this.selectedNonMedications.length;
      i++
    ) {
      let index = this.indexOfObjectWithId(
        this.displayNonMedications,
        this.selectedNonMedications[i]
      );
      if (
        index >= 0
      ) {

        this.displayNonMedications.splice(index, 1);
        this.displayNonMedications.unshift(
          this.selectedNonMedications[i]
        );
        (<any>$("#nonMedication" + "0")).checked = true;
        if (this.displayNonMedications[0]) {
          this.displayNonMedications[0].isSelected = true;
        }
      } else {
        this.displayNonMedications.unshift(
          this.selectedNonMedications[i]
        );

        (<any>$("#nonMedication" + "0")).checked = true;
        if (this.displayNonMedications[0]) {
          this.displayNonMedications[0].isSelected = true;
        }
      }
    }
  }
  onClickNonMedications(nonMedication, index): void {
    this.isNotSavedChanges = true;
    let i = this.indexOfObjectWithId(this.selectedNonMedications, nonMedication);
    if (i == -1) {
      nonMedication.isSelected = true;
      this.selectedNonMedications.push(nonMedication);
    }
    else {
      nonMedication.isSelected = false;
      this.selectedNonMedications.splice(
        i,
        1
      );
    }
  }

  addSuggestedImmunizations() {
    this.isNotSavedChanges = true;
    this.doctorService
      .addSuggestedImmunization({
        doctorId: this.authService.userAuth.employeeId,
        drugFormId: 0,
        genericMedicine: {
          genericMedicineId: 0,
          genericMedicineName: this.addSuggestedImmunization
        },
        rxDrug: false,
        pocId: 0,
        groupId: 0,
        subGroupId: 0,
        categoryId: 0,
        productId: 0,
        finalAmount: 0.0,
        grossPrice: 0.0,
        netPrice: 0.0,
        originalAmount: 0.0,
        otherDiscountAmount: 0.0,
        packageDiscountAmount: 0.0,
        quantity: 0,
        taxationAmount: 0.0
      })
      .then(data => {
        console.log(data);
        if (data) {
          data.isSelected = true;
          console.log(data);
          this.dispayImmunizations.push(data);
          this.immunizations.push(data);
          this.selectedImmunizations.push(data);
          this.checkAllSelectedImmunizationn();
          this.addSuggestedImmunization = "";
        }
      });
  }
  searchForMoreImmunization(event) {
    console.log(event);
    let searchElement: string = this.getStringValue("#inlineFormInputGroupImmunization").trim();
    if (searchElement.length >= 3) {
      this.addSuggestedImmunization = searchElement;
      this.doctorService
        .getImmunizationautocomplete({
          aliasSearchType: 0,
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
            this.dispayImmunizations = JSON.parse(JSON.stringify(data));
            this.checkAllSelectedImmunizationn();
          }
        });
    } else {
      this.addSuggestedImmunization = "";
      this.dispayImmunizations = JSON.parse(JSON.stringify(this.immunizations));
      this.checkAllSelectedImmunizationn();
    }
  }
  checkAllSelectedImmunizationn() {
    for (
      let i = 0;
      i < this.selectedImmunizations.length;
      i++
    ) {
      let index = this.indexOfObjectWithGenericMedicineId(
        this.dispayImmunizations,
        this.selectedImmunizations[i]
      );
      if (index >= 0) {
        this.dispayImmunizations.splice(index, 1);
        this.dispayImmunizations.unshift(
          this.selectedImmunizations[i]
        );
        if (this.dispayImmunizations[0]) {
          this.dispayImmunizations[0].isSelected = true;
        }
        (<any>$("#immunization" + "0")).checked = true;
      } else {
        this.dispayImmunizations.unshift(
          this.selectedImmunizations[i]
        );
        if (this.dispayImmunizations[0]) {
          this.dispayImmunizations[0].isSelected = true;
        }

        (<any>$("#immunization" + "0")).checked = true;
      }
    }
  }
  onClickImmunizations(immunization, index): void {
    this.isNotSavedChanges = true;
    let i = this.indexOfObjectWithGenericMedicineId(this.selectedImmunizations, immunization);
    if (i == -1) {
      immunization.isSelected = true;
      this.selectedImmunizations.push(immunization);
    }
    else {
      immunization.isSelected = false;
      this.selectedImmunizations.splice(
        i,
        1
      );
    }
  }
  setDisplayDataToSelected() {
    this.displaySymptoms = JSON.parse(JSON.stringify(this.selectedSymptomList));
    this.displayClinicalExaminations = JSON.parse(JSON.stringify(this.selectedClinicalExaminations));
    this.displayDiagnoses = JSON.parse(JSON.stringify(this.selectedDiagnoses));
    this.dispayImmunizations = JSON.parse(JSON.stringify(this.selectedImmunizations));
    this.displayInvestigations = JSON.parse(JSON.stringify(this.selectedInvestigations));
    this.displayMedicines = JSON.parse(JSON.stringify(this.selectedMedicines));
    this.displayNonMedications = JSON.parse(JSON.stringify(this.selectedNonMedications));
    this.displayProcedures = JSON.parse(JSON.stringify(this.selectedProcedures));
    this.checkAllSelectedSymptoms();
    this.checkAllSelectedClinicalExaminations();
    this.checkAllSelectedDiagnoses();
    this.checkAllSelectedMedicines();
    this.checkAllSelectedInvestigations();
    this.checkAllSelectedProcedures();
    this.checkAllSelectedNonMedication();
    this.checkAllSelectedImmunizationn();
  }


  save() {
    this.isNotSavedChanges = false;
    this.clearSearchFields();
    this.setDisplayDataToSelected();
    let index: number;
    for (let i = 0; i < this.doctorFavourites.length; i++) {
      if (this.selectedService.serviceId == this.doctorFavourites[i].serviceId) {
        index = i;
      }
    }
    console.log("moduleIndex " + this.moduleIndex);
    console.log("department_name index " + index);



    if (this.moduleIndex == 0) {
      this.doctorFavourites[index].symptomList = this.selectedSymptomList;
      this.doctorService.addDoctorFavouritesSymptom(
        {
          doctorId: this.authService.employeeDetails.empId,
          serviceId: this.selectedService.serviceId,
          favouriteList: this.selectedSymptomList
        }
      ).then(data => {
        if (data.statusCode && (data.statusCode == 201 || data.statusCode == 200)) {
          alert('Successfully Saved');
        }

      });
    }
    else if (this.moduleIndex == 1) {
      this.doctorFavourites[index].clinicalExaminationList = this.selectedClinicalExaminations;
      this.doctorService.addDoctorFavouritesClinicalExaminations(
        {
          doctorId: this.authService.employeeDetails.empId,
          serviceId: this.selectedService.serviceId,
          favouriteList: this.selectedClinicalExaminations
        }
      ).then(data => {
        if (data.statusCode && (data.statusCode == 201 || data.statusCode == 200)) {
          alert('Successfully Saved');
        }

      });
    }
    else if (this.moduleIndex == 2) {
      this.doctorFavourites[index].diagnosisList = this.selectedDiagnoses;
      this.doctorService.addDoctorFavouritesDaignosis(
        {
          doctorId: this.authService.employeeDetails.empId,
          serviceId: this.selectedService.serviceId,
          favouriteList: this.selectedDiagnoses
        }
      ).then(data => {
        if (data.statusCode && (data.statusCode == 201 || data.statusCode == 200)) {
          alert('Successfully Saved');
        }
      });

    }
    else if (this.moduleIndex == 3) {
      this.doctorFavourites[index].medicineList = this.selectedMedicines;
      this.doctorService.addDoctorFavouritesPharmacy(
        {
          doctorId: this.authService.employeeDetails.empId,
          serviceId: this.selectedService.serviceId,
          favouriteList: this.selectedMedicines
        }
      ).then(data => {
        if (data.statusCode && (data.statusCode == 201 || data.statusCode == 200)) {
          alert('Successfully Saved');
        }
      });
    }
    else if (this.moduleIndex == 4) {
      this.doctorFavourites[index].investigationList = this.selectedInvestigations;
      this.doctorService.addDoctorFavouritesInvestigations(
        {
          doctorId: this.authService.employeeDetails.empId,
          serviceId: this.selectedService.serviceId,
          favouriteList: this.selectedInvestigations
        }
      ).then(data => {
        if (data.statusCode && (data.statusCode == 201 || data.statusCode == 200)) {
          alert('Successfully Saved');
        }
      });
    }
    else if (this.moduleIndex == 5) {
      this.doctorFavourites[index].procedureList = this.selectedProcedures;
      this.doctorService.addDoctorFavouritesProcedures(
        {
          doctorId: this.authService.employeeDetails.empId,
          serviceId: this.selectedService.serviceId,
          favouriteList: this.selectedProcedures
        }
      ).then(data => {
        if (data.statusCode && (data.statusCode == 201 || data.statusCode == 200)) {
          alert('Successfully Saved');
        }
      });

    }
    else if (this.moduleIndex == 6) {
      this.doctorFavourites[index].nonMedicationList = this.selectedNonMedications;
      this.doctorService.addDoctorFavouritesNonMedications(
        {
          doctorId: this.authService.employeeDetails.empId,
          serviceId: this.selectedService.serviceId,
          favouriteList: this.selectedNonMedications
        }
      ).then(data => {
        if (data.statusCode && (data.statusCode == 201 || data.statusCode == 200)) {
          alert('Successfully Saved');
        }
      });

    }
    else if (this.moduleIndex == 7) {
      this.doctorFavourites[index].immunizationList = this.selectedImmunizations;
      this.doctorService.addDoctorFavouritesImmunizations(
        {
          doctorId: this.authService.employeeDetails.empId,
          serviceId: this.selectedService.serviceId,
          favouriteList: this.selectedImmunizations
        }
      ).then(data => {
        if (data.statusCode && (data.statusCode == 201 || data.statusCode == 200)) {
          alert('Successfully Saved');
        }
      });

    }
  }
  hideModel(id: string) {
    this.isNotSavedChanges = false;
    (<any>$(id)).modal("hide");
  }

  discardChanges() {


    this.hideModel('#saveAlertmodelId');
    this.changeServiceList();
    this.changeOfModule();

  }










}

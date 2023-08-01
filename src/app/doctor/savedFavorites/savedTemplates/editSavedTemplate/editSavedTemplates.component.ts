import { ServiceDetail } from './../../../../model/employee/servicedetail';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { InvestigationDetails } from './../../../../model/diagnostics/investigationDetails';
import { BaseDiagnosis } from './../../../../model/advice/baseDiagnosis';
import { DoctorService } from './../../../doctor.service';
import { DoctorPrescriptionTemplate } from './../../../../model/advice/doctorPrescriptionTemplate';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { Pharmacy } from '../../../../model/pharmacy/pharmacy';
import { Duration } from '../../../../model/pharmacy/duration';
import { PharmacyService } from '../../../../pharmacy/pharmacy.service';
import { PharmacyAdvises } from '../../../../model/advice/pharmacyAdvises';
import { InvestigationAdvises } from '../../../../model/advice/investigationAdvises';
import { PharmacyConstants } from '../../../../model/prescription/pharmacyconstants';
import { Config } from '../../../../base/config';

@Component({
  selector: "editSavedTemplates",
  templateUrl: "./editSavedTemplates.template.html",
  styleUrls: ["./editSavedTemplates.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class editSavedTemplatesComponent implements OnInit {

  templateDetail: DoctorPrescriptionTemplate = new DoctorPrescriptionTemplate();
  serviceList: Array<ServiceDetail>;

  addSuggestedDiagnoses: string = "";
  diagnoses: BaseDiagnosis[] = [];
  displayDiagnoses: BaseDiagnosis[] = [];
  selectedDiagnoses: BaseDiagnosis[] = [];
  daignose: BaseDiagnosis;

  addSuggestedMedicine: string = "";
  medicines: Pharmacy[] = [];
  medicine: Pharmacy = new Pharmacy();
  displayMedicines: Pharmacy[] = [];
  selectedMedicines: Pharmacy[] = [];
  isWriteCustomDosages: boolean = false;

  addSuggestedInvestigation: string = "";
  investigations: InvestigationDetails[] = [];
  displayInvestigations: InvestigationDetails[] = [];
  selectedInvestigations: InvestigationDetails[] = [];

  modelView: string = "";
  errorMessage: string = "";
  unit_med: string = "";

  frequencyOfPharmacy = (Config.portal.doctorOptions && Config.portal.doctorOptions.doctorFrequencyList ? Config.portal.doctorOptions.doctorFrequencyList : PharmacyConstants.FREQUENCY_OF_PHARMACY);
  pharmacyTypes = (Config.portal.doctorOptions && Config.portal.doctorOptions.pharmacyUnitsList ? Config.portal.doctorOptions.pharmacyUnitsList : PharmacyConstants.UNITS_OF_PHARMACY);

  constructor(
    private authService: AuthService,
    private pharmacyService: PharmacyService,
    private doctorService: DoctorService,
    private router: Router
  ) {
    this.serviceList = this.authService.employeeDetails.serviceList;
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.doctorService.doctorPrescriptionTemplate) {
      window.localStorage.setItem(
        "doctorPrescriptionTemplate",
        cryptoUtil.encryptData(JSON.stringify(this.doctorService.doctorPrescriptionTemplate))
      );
    } else if (
      window.localStorage.getItem("doctorPrescriptionTemplate") != undefined &&
      window.localStorage.getItem("doctorPrescriptionTemplate") != null
    ) {
      this.doctorService.doctorPrescriptionTemplate = JSON.parse(
        cryptoUtil.decryptData(window.localStorage.getItem("doctorPrescriptionTemplate"))
      );
    }
    if (this.doctorService.doctorPrescriptionTemplate == null || this.doctorService.doctorPrescriptionTemplate == undefined) {
      this.router.navigate(["./app/doctor/favorites/templates"]);
    }
    this.templateDetail = this.doctorService.doctorPrescriptionTemplate;
    this.getSuggestedList(this.serviceList[0].serviceId);
  }


  ngOnInit() {
    if (this.templateDetail.diagnosisList) {
      this.selectedDiagnoses = this.templateDetail.diagnosisList;
      this.diagnoses = JSON.parse(JSON.stringify(this.templateDetail.diagnosisList));
      this.displayDiagnoses = JSON.parse(JSON.stringify(this.templateDetail.diagnosisList));
      this.checkAllSelectedDiagnoses();
    }
    else {
      this.templateDetail.diagnosisList = new Array<BaseDiagnosis>();
    }

    if (this.templateDetail.pharmacyAdvises && this.templateDetail.pharmacyAdvises.pharmacyAdviceList) {
      this.selectedMedicines = this.templateDetail.pharmacyAdvises.pharmacyAdviceList;
      this.medicines = JSON.parse(JSON.stringify(this.templateDetail.pharmacyAdvises.pharmacyAdviceList));
      this.displayMedicines = JSON.parse(JSON.stringify(this.templateDetail.pharmacyAdvises.pharmacyAdviceList));
      this.checkAllSelectedMedicines();
    }
    else {
      this.templateDetail.pharmacyAdvises = new PharmacyAdvises();
      this.templateDetail.pharmacyAdvises.pharmacyAdviceList = new Array<Pharmacy>();
    }

    if (this.templateDetail.investigationAdvises && this.templateDetail.investigationAdvises.investigationReportList) {
      this.selectedInvestigations = this.templateDetail.investigationAdvises.investigationList;
      this.investigations = JSON.parse(JSON.stringify(this.templateDetail.investigationAdvises.investigationList));
      this.displayInvestigations = JSON.parse(JSON.stringify(this.templateDetail.investigationAdvises.investigationList));
      this.checkAllSelectedInvestigations();
    }
    else {
      this.templateDetail.investigationAdvises = new InvestigationAdvises();
      this.templateDetail.investigationAdvises.investigationList = new Array<InvestigationDetails>()
    }
  }

  getSuggestedList(service: number = 0) {
    if (service == 0) {
      service = this.getNumberValue('#department_name');
    }
    let getSuggestedListBody = {
      doctorId: this.authService.userAuth.employeeId,
      serviceId: service,
      totalCount: 15
    };
    this.doctorService
      .getSuggestedDaignosis(getSuggestedListBody)
      .then(data => {
        this.displayDiagnoses = JSON.parse(JSON.stringify(data));
        this.diagnoses = JSON.parse(JSON.stringify(data));
        this.checkAllSelectedDiagnoses();
      });
    this.doctorService
      .getSuggestedMedicines(getSuggestedListBody)
      .then(data => {
        this.displayMedicines = JSON.parse(JSON.stringify(data));
        this.medicines = JSON.parse(JSON.stringify(data));
        this.checkAllSelectedMedicines();
      });

    this.doctorService
      .getSuggestedInvestigations(getSuggestedListBody)
      .then(data => {
        this.displayInvestigations = JSON.parse(JSON.stringify(data));
        this.investigations = JSON.parse(JSON.stringify(data));
        this.checkAllSelectedInvestigations();
      });

  }


  indexOfObjectWithPharmacy(obj1: any[], obj2): number {
    for (let i = 0; i < obj1.length; i++) {
      if ((obj1[i].productId + obj1[i].productName) == (obj2.productId + obj2.productName)) {
        return i;
      }
    }
    return -1;
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
  getStringValue(id: string): string {
    return ($(id).val() != undefined
      && $(id).val() != null
      && $(id).val().toString() != null
      && $(id).val().toString() != "")
      ? $(id).val().toString()
      : "";
  }

  getNumberValue(id: string): number {
    return ($(id).val() != undefined
      && $(id).val() != null
      && $(id).val().toString() != null
      && $(id).val().toString() != "")
      ? parseInt($(id).val().toString())
      : 0;
  }
  validateNumberWithMaxWithDigit(id: string, e, maxValue: number = 100) {
    let val = this.getNumberValue(id);
    if (val >= maxValue && (
      (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)
    )) {
      e.preventDefault();
      return false;
    }
    return true;

  }

  validateNumber(id: string, e) {
    console.log(e);
    if (e.keyCode == 110 || e.keyCode == 9) {
      // return;
    }
    if (!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58)
      || e.keyCode == 8)) {
      e.preventDefault();
      return false;
    }
    return true;
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
    <any>$("#" + "addDiagnoses").prop("checked", false);
    this.doctorService
      .addSuggestedDaignosis({
        doctorId: this.authService.userAuth.employeeId,
        id: 0,
        finalDiagnosis: false,
        name: this.addSuggestedDiagnoses,
        serviceId: $('#department_name').val(),
      })
      .then(data => {
        console.log(data);
        if (data) {
          data.isSelected = false;
          console.log(data);
          this.displayDiagnoses.push(data);
          this.diagnoses.push(data);
          // this.selectedDiagnoses.push(data);
          // this.checkAllSelectedDiagnoses();
          this.addSuggestedDiagnoses = "";
        }
      });
  }
  onClickColumDiagnosis(daignose, index) {
    let i = this.indexOfObjectWithId(this.selectedDiagnoses, daignose);
    if (i == -1) {
      daignose.isSelected = true;
      this.daignose = daignose;
      <any>$("#" + "diagnosis" + index).prop("checked", false);
      this.displayDiagnoses[index].isSelected = false;
      daignose.isSelected = false;
      (<any>$("#diagnosismodelId")).modal("show");
    }
    else {
      daignose.isSelected = false;
      this.selectedDiagnoses.splice(
        i,
        1
      );
    }
  }
  onClickDiagnosis(isFinal: boolean): void {
    console.log("inside onClickDiagnosis");
    this.daignose.finalDiagnosis = isFinal;
    this.selectedDiagnoses.push(
      this.daignose
    );
    (<any>$("#diagnosismodelId")).modal("hide");
    let index = this.indexOfObjectWithId(this.displayDiagnoses, this.daignose);
    <any>$("#" + "diagnosis" + index).prop("checked", true);
    console.log(index);

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
    let medicine: Pharmacy = new Pharmacy();
    medicine.productName = this.addSuggestedMedicine;
    medicine.addedByDoctor = true;
    medicine.isSelected = false;
    this.displayMedicines.unshift(medicine);
    this.medicines.unshift(medicine);
    // this.selectedMedicines.unshift(medicine);
    this.addSuggestedMedicine = "";
    // this.checkAllSelectedMedicines();
  }
  onClickMedicines(medicine, index): void {
    let i = this.indexOfObjectWithPharmacy(this.selectedMedicines, medicine);
    medicine.isSelected = false;
    if (i == -1) {
      // medicine.isSelected = true;
      // this.selectedMedicines.push(medicine);
      <any>$("#" + "medicine" + index).prop("checked", false);
      this.displayMedicines[index].isSelected = false;
      medicine.isSelected = false;
      medicine.quantity = null;
      medicine.doseUnit = null;
      medicine.doseLabel = null;
      medicine.intakeRoute = null;
      medicine.duration = new Duration();
      medicine.takenWhenFood = null;
      medicine.isSOS = null;

      this.medicine = JSON.parse(JSON.stringify(medicine));
      if (this.medicine.productId == 0) {
        this.medicine.addedByDoctor = true;
      }
      this.clearMedicineView();
      this.modelView = "medicine";
      medicine.isSelected = false;
      (<any>$("#medicinemodelId")).modal({
        show: true,
        escapeClose: false,
        clickClose: false,
        showClose: false,
        backdrop: "static",
        keyboard: false
      });

    }
    else {
      medicine.isSelected = false;
      this.selectedMedicines.splice(
        i,
        1
      );
    }
  }
  onClickAddMedicine(isSos: boolean) {
    let doseLabel: string = this.getStringValue("input[name='dos']:checked");
    this.medicine.isSOS = isSos;
    if (this.medicine.addedByDoctor && !(this.medicine.drugForm && this.medicine.drugForm.length > 0) && this.getStringValue("#medicineTypeInput").trim() == '') {
      this.errorMessage = "Please Enter Drug Form";
      return;
    }
    if (
      (doseLabel != "" && doseLabel != null && doseLabel != undefined) ||
      (this.getStringValue("#Dosage_1") != "" && this.getStringValue("#time_1")) ||
      (this.getStringValue("#Dosage_2") != "" && this.getStringValue("#time_2")) ||
      (this.getStringValue("#Dosage_3") != "" && this.getStringValue("#time_3")) ||
      (this.getStringValue("#Dosage_4") != "" && this.getStringValue("#time_4")) ||
      (this.getStringValue("#Dosage_5") != "" && this.getStringValue("#time_5")) ||
      (this.getStringValue("#Dosage_6") != "" && this.getStringValue("#time_6")) ||
      isSos == true
    ) {
      console.log(+this.getNumberValue("#dur_med"));
      if (this.getStringValue("#qty_unit").trim() == '' && isSos == false) {
        this.errorMessage = "Please Enter unit";
        return;
      }
      else if (this.getNumberValue("#frequency_med") == 0 && isSos == false) {
        this.errorMessage = "Please select frequency";
        return;
      }
      else if (this.getNumberValue("#dur_opt") == 0 && this.getStringValue("#dur_med") == '' && isSos == false) {
        if (this.getStringValue("#dur_med").trim() == '') {
          this.errorMessage = "Please Select/Enter Duration";
          return;
        }
      }
      else if (+this.getStringValue("#dur_med") < 1 && isSos == false) {

        this.errorMessage = "Enter Valid Duration";
        return;

      }
      // else if(this.getStringValue("#food_opt").trim()=="" && this.getStringValue("#food_info").trim()==""){
      //   if(this.getStringValue("#food_info").trim()=="")
      //   {
      //     this.errorMessage = "Please Select/Enter Meal Intake Information";
      //     return;
      //   }
      // }
      // else if(this.getStringValue("#route_opt").trim()=="" && this.getStringValue("#route_info").trim()==''){
      //   if(this.getStringValue("#route_info").trim()=='')
      //   {
      //     this.errorMessage = "Please Select/Enter Route";
      //     return;
      //   }
      // }
      else this.errorMessage = "";
      this.medicine.dosePerDay = 0;
      this.modelView = "";
      (<any>$("#medicinemodelId")).modal("hide");

      this.displayMedicines[
        this.indexOfObjectWithPharmacy(this.displayMedicines, this.medicine)
      ].isSelected = true;
      this.errorMessage = "";
      // medicineTypeInput
      if (this.medicine.addedByDoctor)
        this.medicine.drugForm = this.getStringValue('#medicineTypeInput');

      if (isSos == false) {
        this.medicine.doses = new Array();
        if (!this.isWriteCustomDosages) {
          let doseLabel: string = this.getStringValue("input[name='dos']:checked");
          this.medicine.quantity = + this.getStringValue("#qty_dose");
          if (this.medicine.quantity > 0) {
            this.medicine.doseLabel = doseLabel.replace(/1/g, '' + this.medicine.quantity);
          }
          if (doseLabel.length >= 6) {
            let dose = {
              consumeTime: 12600000,
              doseQuantity: (+doseLabel.charAt(0) >= 1) ? this.medicine.quantity : 0,
              shouldConsume: +doseLabel.charAt(0) >= 1
            };
            this.medicine.dosePerDay += +doseLabel.charAt(0);
            this.medicine.doses.push(dose);
            this.medicine.doses.push({
              consumeTime: 23400000,
              doseQuantity: (+doseLabel.charAt(2) >= 1) ? this.medicine.quantity : 0,
              shouldConsume: +doseLabel.charAt(2) >= 1
            });
            this.medicine.dosePerDay += +doseLabel.charAt(2);
            this.medicine.doses.push({
              consumeTime: 45000000,
              doseQuantity: (+doseLabel.charAt(4) >= 1) ? this.medicine.quantity : 0,
              shouldConsume: +doseLabel.charAt(4) >= 1
            });
            this.medicine.dosePerDay += +doseLabel.charAt(4);
            this.medicine.doses.push({
              consumeTime: 55800000,
              doseQuantity: (+doseLabel.charAt(6) >= 1) ? this.medicine.quantity : 0,
              shouldConsume: +doseLabel.charAt(6) >= 1
            });
            this.medicine.dosePerDay += +doseLabel.charAt(6);
          }
        } else {
          doseLabel = "";
          for (let i = 1; i <= 6; i++) {
            this.medicine.doses.push({
              consumeTime: this.getNumberValue("#time_" + i),
              doseQuantity: +this.getStringValue("#Dosage_" + i),
              shouldConsume: +this.getStringValue("#Dosage_" + i) > 0
            });
            this.medicine.dosePerDay += this.getNumberValue("#Dosage_" + i);
            doseLabel = doseLabel + (this.getStringValue("#Dosage_" + i) == '' ? '0' : this.getStringValue("#Dosage_" + i));
            if (i != 6) {
              doseLabel = doseLabel + "-";
            }
          }
          this.medicine.doseLabel = doseLabel;
        }
        this.medicine.takenWhenFood = this.getStringValue("#food_info").length > 0
          ? this.getStringValue("#food_info")
          : this.getStringValue("#food_opt");
        this.medicine.doseUnit = this.getStringValue("#qty_unit");
        if (this.medicine.doseUnit == 'Other') {
          this.medicine.doseUnit = this.getStringValue("#qty_unit");
        }

        this.medicine.intakeRoute = this.getStringValue("#route_info").length > 0
          ? this.getStringValue("#route_info")
          : this.getStringValue("#route_opt");

        this.medicine.duration = new Duration();

        this.medicine.duration.frequencyLabel = this.getStringValue("#frequency_med");
        let frequencyConstants = this.getPharmacyConstants('frequency');
        frequencyConstants.forEach(item => {
          if (item.display == this.medicine.duration.frequencyLabel) {
            this.medicine.duration.frequencyDays = +item.value;
          }
        })
        if (!this.medicine.duration.frequencyDays || this.medicine.duration.frequencyDays <= 0) {
          this.medicine.duration.frequencyDays = this.getNumberValue("#frequency_med");
        }

        this.medicine.duration.repeatTimes = this.getNumberValue("#dur_med") > 0
          ? this.getNumberValue("#dur_med")
          : this.getNumberValue("#dur_opt");

        this.medicine.emergency =
          (<any>$("#stat" + ":checked")).length > 0 ? true : false;
      } else {
        this.medicine.isSOS = isSos;
        this.medicine.intakeRoute = '';
      }
      console.log(this.medicine);
      this.selectedMedicines.push(
        this.medicine
      );
    } else {
      this.errorMessage = "Please select Dose";
    }
  }
  private clearMedicineView() {
    this.isWriteCustomDosages = false;

    $("#Dosage_1").val("");
    $("#time_1").val("");
    $("#Dosage_2").val("");
    $("#time_2").val("");
    $("#Dosage_3").val("");
    $("#time_3").val("");
    $("#Dosage_4").val("");
    $("#time_4").val("");
    $("#Dosage_5").val("");
    $("#time_5").val("");
    $("#Dosage_6").val("");
    $("#time_6").val("");

    $("#qty_dose").val("1");
    $("#unit_med").val("");
    this.unit_med == "";

    this.modelView = "medicine";
    this.errorMessage = "";
    $("input[name='dos']:checked").prop('checked', false);

    $("#qty_unit").val('');
    $("#frequency_med").val("");
    $("#dur_opt").val("");
    $("#dur_med").val("");
    $("#food_opt").val("");
    $("#food_info").val("");
    $("#route_opt").val("");
    $("#route_info").val("");
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
    <any>$("#" + "addInvestigation").prop("checked", false);
    this.doctorService
      .addSuggestedInvestigations({
        doctorId: this.authService.userAuth.employeeId,
        doctorServiceId: $('#department_name').val(),
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
          data.isSelected = false;
          console.log(data);
          this.displayInvestigations.push(data);
          this.investigations.push(data);
          // this.selectedInvestigations.push(data);
          // this.checkAllSelectedInvestigations();
          this.addSuggestedInvestigation = "";
        }
      });
  }
  onClickInvestigations(investigation, index): void {
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


  saveTemplate() {
    this.templateDetail.pharmacyAdvises.pharmacyAdviceList = this.selectedMedicines;
    this.templateDetail.investigationAdvises.investigationList = this.selectedInvestigations;
    this.templateDetail.diagnosisList = this.selectedDiagnoses;
    this.templateDetail.doctorId = this.authService.userAuth.employeeId;
    if (this.templateDetail.id == 0) {
      this.templateDetail.createdTimestamp = new Date().getTime();
    }
    this.templateDetail.updatedTimestamp = new Date().getTime();
    this.templateDetail.title = (this.templateDetail.title + '').trim();

    // if(this.templateDetail.title.length>50){
    //   alert('Title too long');
    //   return;
    // }

    if (
      (this.templateDetail.title + '').trim() == "" ||
      (this.templateDetail.title + '').trim() == " "
    ) {
      alert('Enter Valid Template Title');
      return;
    }
    console.log(this.templateDetail.pharmacyAdvises);
    console.log(this.templateDetail.investigationAdvises);
    console.log(this.templateDetail.diagnosisList);
    if (
      (
        (this.templateDetail.pharmacyAdvises == null) ||
        (this.templateDetail.pharmacyAdvises == undefined) ||
        (this.templateDetail.pharmacyAdvises.pharmacyAdviceList.length == 0)
      ) &&
      (
        (this.templateDetail.investigationAdvises == null) ||
        (this.templateDetail.investigationAdvises == undefined) ||
        (this.templateDetail.investigationAdvises.investigationList.length == 0)
      ) &&
      (
        (this.templateDetail.diagnosisList == null) ||
        (this.templateDetail.diagnosisList == undefined) ||
        (this.templateDetail.diagnosisList.length == 0)
      )
    ) {
      alert('Select Diagnosis/Medicines/Investigations to create template');
      return;

    }
    if ((this.templateDetail.diagnosisList == null) ||
      (this.templateDetail.diagnosisList == undefined) ||
      (this.templateDetail.diagnosisList.length == 0)) {
      alert('Select Diagnosis to create template');
      return;
    }




    this.doctorService.createTemplateForDoctor(this.templateDetail).then(data => {
      console.log(data);
      if (data.statusCode == 200) {
        if (this.templateDetail.id == null || this.templateDetail.id == undefined || this.templateDetail.id == 0) {
          alert('Template Created Successfully');
        }
        else {
          alert('Template Updated Successfully');
        }
        window.localStorage.removeItem('doctorPrescriptionTemplate');
        this.doctorService.doctorPrescriptionTemplate = undefined;
        this.router.navigate(["./app/doctor/favorites/templates"]);

      }
    });

  }
  print(p) { console.log(p) }

  getPharmacyConstants(sw: string) {
    switch (sw) {
      case 'pharmacyType': return PharmacyConstants.LIST_OF_TYPE_OF_PHARMACY;
      case 'unit': return (Config.portal.doctorOptions && Config.portal.doctorOptions.pharmacyUnitsList ? Config.portal.doctorOptions.pharmacyUnitsList : PharmacyConstants.UNITS_OF_PHARMACY);
      case 'frequency': return (Config.portal.doctorOptions && Config.portal.doctorOptions.doctorFrequencyList ? Config.portal.doctorOptions.doctorFrequencyList : PharmacyConstants.FREQUENCY_OF_PHARMACY);
      case 'duration': return PharmacyConstants.DURATION_OF_PHARMACY;
      case 'intakeInfo': return PharmacyConstants.MEAL_INTAKE;
      case 'intakeRoute': return PharmacyConstants.INTAKE_ROUTE;
      case 'intakeTime': return PharmacyConstants.INTAKE_TIME;
      case 'dosages': return PharmacyConstants.DOSAGES;
      case 'customDosages': return Array(6).fill(1);

    }
  }

}

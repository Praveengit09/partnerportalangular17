import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { AppConfig } from "../../../app.config";
import { AuthService } from "../../../auth/auth.service";
import { CommonUtil } from "../../../base/util/common-util";
import { ToasterService } from '../../../layout/toaster/toaster.service';
import { Immunization } from "../../../model/advice/immunization";
import { PatientMedicalAdvise } from '../../../model/advice/patientMedicalAdvise';
import { ReferralDoctor } from "../../../model/advice/referralDoctor";
import { TextAdvise } from "../../../model/advice/textAdvise";
import { InvestigationDetails } from "../../../model/diagnostics/investigationDetails";
import { DoctorDetails } from "../../../model/employee/doctordetails";
import { FollowUpDiscount } from "../../../model/followup/followupdiscount";
import { Duration } from "../../../model/pharmacy/duration";
import { Pharmacy } from "../../../model/pharmacy/pharmacy";
import { PharmacyConstants } from '../../../model/prescription/pharmacyconstants';
import { ServiceItem } from "../../../model/service/serviceItem";
import { PharmacyService } from "../../../pharmacy/pharmacy.service";
import { DoctorService } from "../../doctor.service";
import { VideoCardService } from '../videocard/videocard.service';
import { Config } from '../../../base/config';
import { MedicalNote } from "../../../model/pharmacy/medicalNote";


@Component({
  selector: "medicalprescription",
  templateUrl: "./medicalprescription.template.html",
  styleUrls: ["./medicalprescription.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class MedicalPrescriptionComponent implements OnInit, OnDestroy {

  patientMedicalAdvise: PatientMedicalAdvise;
  textAdvise: MedicalNote = new MedicalNote();
  medicines: Pharmacy[] = [];
  medicine: Pharmacy = new Pharmacy();
  displayMedicines: Pharmacy[] = [];
  investigation: InvestigationDetails = null;

  suggestedMediines: [] = [];
  suggestionMesicine: boolean = false;

  investigations: InvestigationDetails[] = [];
  displayInvestigations: InvestigationDetails[] = [];

  admissionNote: ServiceItem = null;
  admissionNotes: ServiceItem[] = [];
  displayAdmissionNotes: ServiceItem[] = [];

  admissionNoteTextAdvise: string = '';

  procedures: ServiceItem[] = [];
  displayProcedures: ServiceItem[] = [];

  nonMedications: TextAdvise[] = [];
  displayNonMedications: TextAdvise[] = [];

  immunizations: Immunization[] = [];
  immunization: Immunization = new Immunization();
  dispayImmunizations: Immunization[] = [];

  dispayReferral: DoctorDetails[] = [];
  referrals: ReferralDoctor[] = [];

  navCheckedList: string[] = [];

  modelView: string = "";

  isWriteCustomDosages: boolean = false;
  enableMedicineGenericName: boolean = false;
  enableMandatoryMedRoute: boolean = false;
  enableInvestigationNotes: boolean = false;
  addButtonAtLast: boolean = false;
  enableDefaultFollowup: boolean = false;
  enableBaseMedicineIndicator: boolean = false;
  enableAdmissionNotes: boolean = false;
  SuggestionsOfUnavailableMedicines: boolean = false;
  disableImmunization: boolean = false;
  procedurePrescriptionLabel: string = null;
  nonMedicationPrescriptionLabel: string = null;
  admissionNotePrescriptionLabel: string = null;
  enableMedicineStockIndicator: boolean = false;

  addSuggestedMedicine: string = "";
  addSuggestedInvestigation: string = "";
  addSuggestedProcedure: string = "";
  addSuggestedAdmissionNote: string = "";
  addSuggestedNonMedication: string = "";
  addSuggestedImmunization: string = "";

  unit_med: string = "";
  refer_ToText: boolean = false;
  checkedPropOfDoseLabel: boolean = true
  checkedPropOfNeedBased = false
  searchTerm = ''

  immunizationDate: Date;
  datepickerOptEnd = {
    startDate: new Date(),
    // endDate: new Date(),
    autoclose: true,
    todayBtn: "linked",
    todayHighlight: true,
    assumeNearbyYear: true,
    format: "dd/mm/yyyy"
  };

  admissionNotesStartDate: Date;
  admissionNotesEndDate: Date;

  errorMessage: string = "";

  getSuggestedListBody: any;
  doctorFollowupDiscountEditable: boolean;
  followUpIndex: number;

  followupAdvices = new FollowUpDiscount();
  med_type: string;
  dur_med: string;
  food_info: string;
  route_opt: string;
  frequency_med: string;

  AUTO_FOLLOW_UP_DAYS = 3;
  isFrom: string;

  disableFollowup = false;
  referDoctor: boolean;
  updateReferalDoctor: DoctorDetails = new DoctorDetails
  allService = []
  refferalDoctor: string = ''
  addReferalDoctor: boolean = false

  constructor(
    config: AppConfig,
    private doctorService: DoctorService,
    private authService: AuthService,
    private videoCardService: VideoCardService,
    private router: Router,
    private pharmacyService: PharmacyService,
    private toast: ToasterService,
    private commonUtil: CommonUtil = new CommonUtil()
  ) {
    if (Config.portal.customizations.referDoctor) {
      this.addReferalDoctor = true
    }
    this.referDoctor = Config.portal.customizations && Config.portal.customizations.referDoctor;
    console.log(" this.referDoctor" + JSON.stringify(this.referDoctor))

    if (Config.portal.specialFeatures.enablePresGenerationChanges) {
      this.refer_ToText = true
    }
    for (
      let index = 0;
      index < this.authService.employeeDetails.employeePocMappingList.length;
      index++
    ) {
      if (
        (this.authService.employeeDetails.employeePocMappingList[
          index
        ].pocId = this.authService.userAuth.pocId)
      ) {
        console.log("pocId=" + this.authService.userAuth.pocId);
        this.followUpIndex = index;
        this.doctorFollowupDiscountEditable = this.authService.employeeDetails.employeePocMappingList[
          this.followUpIndex
        ].participationSettings.doctorFollowupDiscountEditable;
        break;
      }
    }
    this.followupAdvices.title = "";
  }

  pocId: number;
  productidList: number[] = [];

  ngOnInit() {
    $(document).on("wheel", "input[type=number]", function (e) {
      $(this).blur();
    });

    this.patientMedicalAdvise = this.doctorService.patientMedicalAdvise;
    this.disableFollowup = Config.portal.doctorOptions && Config.portal.doctorOptions.disableFollowupConsultation ? Config.portal.doctorOptions.disableFollowupConsultation : false;
    this.enableMedicineGenericName = Config.portal.doctorOptions && Config.portal.doctorOptions.enableMedicineGenericName ? Config.portal.doctorOptions.enableMedicineGenericName : false;
    this.enableMandatoryMedRoute = Config.portal.doctorOptions && Config.portal.doctorOptions.enableMandatoryMedRoute ? Config.portal.doctorOptions.enableMandatoryMedRoute : false;
    this.enableInvestigationNotes = Config.portal.doctorOptions && Config.portal.doctorOptions.enableInvestigationNotes ? Config.portal.doctorOptions.enableInvestigationNotes : false;
    this.addButtonAtLast = Config.portal.doctorOptions && Config.portal.doctorOptions.addButtonAtLast ? Config.portal.doctorOptions.addButtonAtLast : false;
    this.enableDefaultFollowup = Config.portal.doctorOptions && Config.portal.doctorOptions.enableDefaultFollowup ? Config.portal.doctorOptions.enableDefaultFollowup : false;
    this.enableBaseMedicineIndicator = Config.portal.doctorOptions && Config.portal.doctorOptions.enableBaseMedicineIndicator ? Config.portal.doctorOptions.enableBaseMedicineIndicator : false;
    this.enableMedicineStockIndicator = Config.portal.doctorOptions && Config.portal.doctorOptions.enableMedicineStockIndicator ? Config.portal.doctorOptions.enableMedicineStockIndicator : false;
    this.enableAdmissionNotes = Config.portal.doctorOptions && Config.portal.doctorOptions.enableAdmissionNotes ? Config.portal.doctorOptions.enableAdmissionNotes : false;
    this.disableImmunization = Config.portal.doctorOptions && Config.portal.doctorOptions.disableImmunization ? Config.portal.doctorOptions.disableImmunization : false;
    this.procedurePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.procedureLabel && Config.portal.doctorOptions.prescriptionLabels.procedureLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.procedureLabel : null;
    this.nonMedicationPrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel && Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel : null;
    this.admissionNotePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel : null;
    this.SuggestionsOfUnavailableMedicines = Config.portal.doctorOptions && Config.portal.doctorOptions.SuggestionsOfUnavailableMedicines ? Config.portal.doctorOptions.SuggestionsOfUnavailableMedicines : false;
    this.isFrom = this.doctorService.isFrom;
    console.log("MedicalPres: ", this.isFrom);


    (<any>$("#medicines")).checked = true;
    this.navCheckedList.push("medicines");
    this.checkAllSelectedMedicines();

    (<any>$("#investigations")).checked = true;
    this.navCheckedList.push("investigations");
    this.checkAllSelectedInvestigations();

    if (this.enableDefaultFollowup) {
      (<any>$("#followUPs")).checked = true;
      this.navCheckedList.push("followUPs");
    }

    if (this.patientMedicalAdvise.noteList && this.patientMedicalAdvise.noteList.length > 0) {
      if (this.patientMedicalAdvise.noteList[0] && this.patientMedicalAdvise.noteList[0].title != null &&
        this.patientMedicalAdvise.noteList[0].title != undefined) {
        this.textAdvise.title = this.patientMedicalAdvise.noteList[0].title;
      }
      else this.textAdvise.title = "";
    } else this.textAdvise.title = "";

    if (this.patientMedicalAdvise.followupAdvices && this.isFrom != "digitizationqueue") {
      (<any>$("#followUPs")).checked = true;
      this.navCheckedList.push("followUPs");
      if (
        this.patientMedicalAdvise.followupAdvices.length > 0 && this.patientMedicalAdvise.followupAdvices[0].validityDays > 0
      ) {
        this.followupAdvices = this.patientMedicalAdvise.followupAdvices[0];
      } else if (
        this.patientMedicalAdvise.followupAdvices &&
        this.patientMedicalAdvise.followupAdvices.length == 0 &&
        this.authService.employeeDetails.employeePocMappingList[this.followUpIndex]
          .participationSettings.followupDiscountList &&
        this.authService.employeeDetails.employeePocMappingList[this.followUpIndex]
          .participationSettings.followupDiscountList.length
      ) {
        this.followupAdvices.validityDays = this.AUTO_FOLLOW_UP_DAYS;
        this.calDiscountWithDays(this.AUTO_FOLLOW_UP_DAYS);
        // if (this.followupAdvices.discountPercent > 0) {
        this.patientMedicalAdvise.followupAdvices[0] = this.followupAdvices;
        // } else {
        //   (<any>$("#followUPs")).checked = false;
        //   this.navCheckedList.splice(this.navCheckedList.indexOf("followUPs"), 1);
        // }
      }
    } else if (this.isFrom == "digitizationqueue") {
      (<any>$("#followUPs")).checked = true;
      this.doctorFollowupDiscountEditable = true;
      this.navCheckedList.push("followUPs");
      if (
        this.patientMedicalAdvise.followupAdvices && this.patientMedicalAdvise.followupAdvices.length > 0 && this.patientMedicalAdvise.followupAdvices[0].validityDays > 0
      ) {
        this.followupAdvices = this.patientMedicalAdvise.followupAdvices[0];
      } else if (
        this.patientMedicalAdvise.followupAdvices &&
        this.patientMedicalAdvise.followupAdvices.length == 0 &&
        this.authService.employeeDetails.employeePocMappingList[this.followUpIndex]
          .participationSettings.followupDiscountList &&
        this.authService.employeeDetails.employeePocMappingList[this.followUpIndex]
          .participationSettings.followupDiscountList.length
      ) {
        this.followupAdvices.validityDays = this.AUTO_FOLLOW_UP_DAYS;
        this.calDiscountWithDays(this.AUTO_FOLLOW_UP_DAYS);
        // if (this.followupAdvices.discountPercent > 0) {
        this.patientMedicalAdvise.followupAdvices[0] = this.followupAdvices;
        // } else {
        //   (<any>$("#followUPs")).checked = false;
        //   this.navCheckedList.splice(this.navCheckedList.indexOf("followUPs"), 1);
        // }
      }
    }
    if (this.patientMedicalAdvise) {
      if (this.patientMedicalAdvise.admissionNote.procedureList.length > 0) {
        (<any>$("#admissionnotes")).checked = true;
        this.navCheckedList.push("admissionnotes");
        this.checkAllSelectedAdmissionNoteProcedures();
      }
      if (this.patientMedicalAdvise.procedureList.length > 0) {
        (<any>$("#procedures")).checked = true;
        this.navCheckedList.push("procedures");
        this.checkAllSelectedProcedures();
      }
      if (
        this.patientMedicalAdvise.nonMedicationAdvises.length > 0
      ) {
        (<any>$("#nonMedications")).checked = true;
        this.navCheckedList.push("nonMedications");
        this.checkAllSelectedNonMedication();
      }
      if (
        this.patientMedicalAdvise.immunizationAdvices.length > 0
      ) {
        (<any>$("#immunizations")).checked = true;
        this.navCheckedList.push("immunizations");
        this.checkAllSelectedImmunizationn();
      }

      if (
        this.patientMedicalAdvise.referralDoctorList.length > 0
      ) {
        (<any>$("#referrals")).checked = true;
        this.navCheckedList.push("referrals");
        this.checkAllSelectedReferrals();
      }
      //  this.patientMedicalAdvise.followupAdvices[0] = new FollowUpDiscount();
    }
    this.pocId = this.authService.userAuth.pocId
    this.getSuggestedListBody = {
      pocId: this.authService.userAuth.pocId,
      doctorId: this.authService.userAuth.employeeId,
      serviceId: this.doctorService.patientQueue.serviceId,
      totalCount: 35
    };
    this.getSuggestedList();
  }

  ngOnDestroy() {
    if (this.admissionNoteTextAdvise) {
      this.patientMedicalAdvise.admissionNote.note = this.admissionNoteTextAdvise;
    }
    this.doctorService.patientMedicalAdvise = this.patientMedicalAdvise;
  }

  private getSuggestedList() {
    if (this.navCheckedList.includes("medicines")) {
      this.doctorService
        .getSuggestedMedicines(this.getSuggestedListBody)
        .then(data => {
          this.displayMedicines = JSON.parse(JSON.stringify(data));
          this.medicines = JSON.parse(JSON.stringify(data));
          this.checkAllSelectedMedicines();
        });
    }
    if (this.navCheckedList.includes("investigations")) {
      this.doctorService
        .getSuggestedInvestigations(this.getSuggestedListBody)
        .then(data => {
          this.displayInvestigations = JSON.parse(JSON.stringify(data));
          this.investigations = JSON.parse(JSON.stringify(data));
          this.checkAllSelectedInvestigations();
        });
    }
    if (this.navCheckedList.includes("admissionnotes")) {
      this.doctorService
        .getSuggestedAdmissionNotes(this.getSuggestedListBody)
        .then(data => {
          this.displayAdmissionNotes = JSON.parse(JSON.stringify(data));
          this.admissionNotes = JSON.parse(JSON.stringify(data));
          this.checkAllSelectedAdmissionNoteProcedures();
        });
    }
    if (this.navCheckedList.includes("procedures")) {
      this.doctorService
        .getSuggestedProcedure(this.getSuggestedListBody)
        .then(data => {
          this.displayProcedures = JSON.parse(JSON.stringify(data));
          this.procedures = JSON.parse(JSON.stringify(data));
          this.checkAllSelectedProcedures();
        });
    }
    if (this.navCheckedList.includes("nonMedications")) {
      this.doctorService
        .getSuggestedNonMedication(this.getSuggestedListBody)
        .then(data => {
          this.displayNonMedications = JSON.parse(JSON.stringify(data));
          this.nonMedications = JSON.parse(JSON.stringify(data));
          this.checkAllSelectedNonMedication();
        });
    }
    if (this.navCheckedList.includes("immunizations")) {
      this.doctorService
        .getSuggestedImmunization(this.getSuggestedListBody)
        .then(data => {
          this.immunizations = JSON.parse(JSON.stringify(data));
          this.dispayImmunizations = JSON.parse(JSON.stringify(data));
          this.checkAllSelectedImmunizationn();
        });
    }
    if (this.navCheckedList.includes("referrals")) {
      this.doctorService
        .getSuggestedReferral(this.getSuggestedListBody.doctorId)
        .then(data => {
          console.log("suggested referrals");
          console.log(data);
          if (data) {
            let doctors: DoctorDetails[] = [];
            for (let i = 0; i < data.length; i++) {
              for (let j = 0; j < data[i].serviceList.length; j++) {
                let doctor: DoctorDetails = JSON.parse(JSON.stringify(data[i]));
                doctor.serviceList = [JSON.parse(JSON.stringify(data[i].serviceList[j]))];
                doctors.push(doctor);
              }
            }
            this.referrals = JSON.parse(JSON.stringify(doctors));
            this.dispayReferral = JSON.parse(JSON.stringify(doctors));
            console.log(this.referrals)
            this.checkAllSelectedReferrals();
          }
        });
    }
  }
  onClickMedicines(medicine, index): void {

    if ((<any>$("#" + "medicine" + index + ":checked")).length > 0 || (<any>$("#" + "suggMedicine" + index + ":checked")).length > 0) {

      this.medicine = JSON.parse(JSON.stringify(medicine));
      if (this.medicine.productId == 0) {
        this.medicine.addedByDoctor = true;
      }
      this.clearMedicineView();
      if (this.medicine.drugForm) {
        this.med_type = this.medicine.drugForm;
      }
      //  for medicine suggestion
      if (!medicine.stockAvailable) {
        this.pharmacyService.getPharamacySuggestedmedicine(medicine.genericMedicine.genericMedicineName, this.pocId).then((response) => {
          if (response.length > 0) {
            this.suggestedMediines = response;
            this.suggestionMesicine = true;
          } else {
            this.suggestedMediines = []
          }
        })
      }
      (<any>$("#medicalprescriptionmodel")).modal({
        show: true,
        escapeClose: false,
        clickClose: false,
        showClose: false,
        backdrop: "static",
        keyboard: false
      });

      <any>$("#" + "medicine" + index).prop("checked", false);
      this.displayMedicines[index].isSelected = false;
      medicine.isSelected = false;
    } else {
      this.patientMedicalAdvise.pharmacyAdvises.pharmacyAdviceList.splice(
        this.indexOfObjectWithPharmacy(
          this.patientMedicalAdvise.pharmacyAdvises
            .pharmacyAdviceList,
          medicine
        ),
        1
      );
      this.medicine = new Pharmacy();
      <any>$("#" + "medicine" + index).prop("checked", false);
      this.displayMedicines[index].isSelected = false;
      medicine.isSelected = false;
      this.videoCardService.updatePrescription(this.patientMedicalAdvise);
    }
    console.log(this.medicine);
  }
  private clearMedicineView() {
    console.log("clearMedicineView")
    this.isWriteCustomDosages = false;
    // Default values
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
    this.unit_med = "Number";
    this.med_type = "";
    this.dur_med = "1";
    this.food_info = "";
    if (!this.enableMandatoryMedRoute) {
      this.route_opt = "Oral";
    } else {
      this.route_opt = "";
    }
    this.frequency_med = "Daily";

    this.modelView = "medicine";
    this.errorMessage = "";
    $("input[name='dos']:checked").prop('checked', false);


  }

  getAllServices() {
    // this.AllServices = this.doctorService.getAllServices()
    this.doctorService.getAllServices().then(data => {
      this.allService = data
      console.log(data);
    })

  }

  updateRefferDoctor(data) {
    console.log(data)
    let doctorData: DoctorDetails = new DoctorDetails()
    doctorData.firstName = data.firstName
    doctorData.title = 'Dr.'
    doctorData.serviceId = data.serviceList.serviceId
    doctorData.serviceName = data.serviceList.serviceName
    doctorData.serviceList.push(data.serviceList)
    this.dispayReferral.push(doctorData)
    console.log(this.dispayReferral);
    localStorage.setItem('referalDoctorDetails', JSON.stringify(data))
    console.log(localStorage.getItem('referalDoctorDetails'));
    this.refferalDoctor = ''
    this.searchTerm = ''
  }

  onClickInvestigations(investigation, index): void {
    if ((<any>$("#" + "investigation" + index + ":checked")).length > 0) {
      this.patientMedicalAdvise.investigationAdvises.investigationList.push(
        investigation
      );
      if ((<any>$("#" + "notes_test" + ":checked")).length > 0) {
        this.investigation = investigation;
        $("#investigationAdviceRemarks").val("");
        this.modelView = "investigationNote";
        (<any>$("#medicalprescriptionmodel")).modal("toggle");
      }
    } else {
      this.patientMedicalAdvise.investigationAdvises.investigationList.splice(
        this.indexOfObjectWithServiceId(
          this.patientMedicalAdvise.investigationAdvises
            .investigationList,
          investigation
        ),
        1
      );
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }

  onClickInvestigationRemarks() {
    let remark: string = $("#investigationAdviceRemarks").val().toString();
    this.patientMedicalAdvise.investigationAdvises.investigationList.forEach(item => {
      if (item.serviceId == this.investigation.serviceId) {
        item.remarks = remark;
      }
    });
    console.log('final list is ', this.patientMedicalAdvise.investigationAdvises.investigationList);
    (<any>$("#medicalprescriptionmodel")).modal("toggle");
  }


  onClickAdmissionNoteProcedures(admissionNote, index): void {
    if ((<any>$("#" + "admissionNote" + index + ":checked")).length > 0) {
      this.admissionNote = admissionNote;
      this.patientMedicalAdvise.admissionNote.procedureList.push(admissionNote);
    } else {
      this.patientMedicalAdvise.admissionNote.procedureList.splice(
        this.indexOfObjectWithServiceId(
          this.patientMedicalAdvise.admissionNote.procedureList,
          admissionNote
        ),
        1
      );
      this.videoCardService.updatePrescription(this.patientMedicalAdvise);
    }
  }
  onAdmissionDateChange() {
    if (this.admissionNotesStartDate) {
      this.patientMedicalAdvise.admissionNote.admissionDateFrom = this.admissionNotesStartDate.getTime()
      console.log('Date ' + this.admissionNotesStartDate);

      if (this.admissionNotesEndDate) {
        if (this.admissionNotesEndDate < this.admissionNotesStartDate) {
          console.log('start' + this.admissionNotesStartDate + '     end date' + this.admissionNotesEndDate);
          this.toast.show("End Date Can not be lsee than start date", "bg-warning text-white font-weight-bold", 3000);
          return;

        }
        this.patientMedicalAdvise.admissionNote.admissionDateTo = this.admissionNotesEndDate.getTime()
      }
    }
  }



  onClickProcedures(procedure, index): void {
    if ((<any>$("#" + "procedure" + index + ":checked")).length > 0) {
      this.patientMedicalAdvise.procedureList.push(procedure);
    } else {
      this.patientMedicalAdvise.procedureList.splice(
        this.indexOfObjectWithServiceId(
          this.patientMedicalAdvise.procedureList,
          procedure
        ),
        1
      );
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }
  onClickNonMedications(nonMedication, index): void {
    if ((<any>$("#" + "nonMedication" + index + ":checked")).length > 0) {
      this.patientMedicalAdvise.nonMedicationAdvises.push(
        nonMedication
      );
    } else {
      this.patientMedicalAdvise.nonMedicationAdvises.splice(
        this.indexOfObjectWithId(
          this.patientMedicalAdvise.nonMedicationAdvises,
          nonMedication
        ),
        1
      );
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }
  onClickImmunizations(immunization, index): void {
    // immunization.isSelected = false;
    // (<any>$("#immunization" + index)).checked = false;
    if ((<any>$("#" + "immunization" + index + ":checked")).length > 0) {
      this.immunization = immunization;
      this.modelView = "immunization";
      (<any>$("#medicalprescriptionmodel")).modal("toggle");
      <any>$("#" + "immunization" + index).prop("checked", false);
      this.dispayImmunizations[index].isSelected = false;
    } else {
      this.dispayImmunizations[index].followupDate = null;
      <any>$("#" + "immunization" + index).prop("checked", false);
      this.dispayImmunizations[index].isSelected = false;
      immunization.isSelected = false;
      this.patientMedicalAdvise.immunizationAdvices.splice(
        this.indexOfObjectWithGenericMedicineId(
          this.patientMedicalAdvise.immunizationAdvices,
          immunization
        ),
        1
      );
      this.videoCardService.updatePrescription(this.patientMedicalAdvise);
    }
  }
  addImmunization() {
    if (this.immunizationDate) {
      this.dispayImmunizations[
        this.indexOfObjectWithGenericMedicineId(
          this.dispayImmunizations,
          this.immunization
        )
      ].isSelected = true;
      (<any>$("#medicalprescriptionmodel")).modal("hide");
      console.log(this.immunizationDate);
      console.log(this.immunizationDate.getTime());

      this.immunization.followupDate = this.immunizationDate.getTime();
      console.log(this.immunization);
      this.patientMedicalAdvise.immunizationAdvices.push(
        this.immunization
      );
      this.modelView = "";
      this.immunizationDate = null;
      this.immunization = null;
      this.videoCardService.updatePrescription(this.patientMedicalAdvise);
    }
  }
  onClickReferral(referral, index) {
    if ((<any>$("#" + "referral" + index + ":checked")).length > 0) {
      let referrralDoctor = new ReferralDoctor();
      referrralDoctor.serviceId = referral.serviceId;
      if (referral.pocList != null && referral.pocList != undefined &&
        referral.pocList[0] != null && referral.pocList[0] != undefined
      ) {
        console.log(' ');
        referrralDoctor.pocId = referral.pocList[0].pocId;
        referrralDoctor.pocName = referral.pocList[0].pocName;
      }
      referrralDoctor.doctorDetail = referral;
      this.dispayReferral[index].isSelected = true;
      this.patientMedicalAdvise.referralDoctorList.push(
        referrralDoctor
      );
      console.log(this.patientMedicalAdvise.referralDoctorList);
    } else {
      this.dispayReferral[index].isSelected = false;
      let i = -1;
      for (
        let j = 0;
        j < this.patientMedicalAdvise.referralDoctorList.length;
        j++
      ) {
        if (
          this.patientMedicalAdvise.referralDoctorList[j]
            .doctorDetail.empId == referral.empId
        )
          i = j;
      }
      this.patientMedicalAdvise.referralDoctorList.splice(i, 1);
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }
  enableNavbarMedicines(): void {
    if ((<any>$("#medicines:checked")).length > 0) {
      this.navCheckedList.push("medicines");
      $("#inlineFormInputGroupMedicines").val("");
      this.addSuggestedMedicine = "";
      this.doctorService
        .getSuggestedMedicines(this.getSuggestedListBody)
        .then(data => {
          this.displayMedicines = JSON.parse(JSON.stringify(data));
          this.medicines = JSON.parse(JSON.stringify(data));
          this.checkAllSelectedMedicines();
        });
    } else {
      this.patientMedicalAdvise.pharmacyAdvises.pharmacyAdviceList = [];
      this.displayMedicines = [];
      this.medicines = [];
      this.navCheckedList.splice(this.navCheckedList.indexOf("medicines"), 1);
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }
  enableNavbarInvestigations(): void {
    if ((<any>$("#investigations:checked")).length > 0) {
      this.navCheckedList.push("investigations");
      $("#inlineFormInputGroupInvestigations").val("");
      this.addSuggestedInvestigation = "";
      this.doctorService
        .getSuggestedInvestigations(this.getSuggestedListBody)
        .then(data => {
          this.displayInvestigations = JSON.parse(JSON.stringify(data));
          this.investigations = JSON.parse(JSON.stringify(data));
          this.checkAllSelectedInvestigations();
        });
    } else {
      this.patientMedicalAdvise.investigationAdvises.investigationList = [];
      this.displayInvestigations = [];
      this.investigations = [];
      this.navCheckedList.splice(
        this.navCheckedList.indexOf("investigations"),
        1
      );
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }

  enableNavbarAdmissionNote(): void {
    if ((<any>$("#admissionnotes:checked")).length > 0) {
      this.navCheckedList.push("admissionnotes");
      $("#inlineFormInputGroupAdmissionNotes").val("");
      this.addSuggestedAdmissionNote = "";
      this.doctorService
        .getSuggestedAdmissionNotes(this.getSuggestedListBody)
        .then(data => {
          this.displayAdmissionNotes = JSON.parse(JSON.stringify(data));
          this.admissionNotes = JSON.parse(JSON.stringify(data));
        });
    } else {

      this.displayAdmissionNotes = [];
      this.admissionNotes = [];
      this.navCheckedList.splice(this.navCheckedList.indexOf("admissionnotes"), 1);
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }

  enableNavbarProcedures(): void {
    if ((<any>$("#procedures:checked")).length > 0) {
      this.navCheckedList.push("procedures");
      $("#inlineFormInputGroupProcedure").val("");
      this.addSuggestedProcedure = "";
      this.doctorService
        .getSuggestedProcedure(this.getSuggestedListBody)
        .then(data => {
          this.displayProcedures = JSON.parse(JSON.stringify(data));
          this.procedures = JSON.parse(JSON.stringify(data));
        });
    } else {
      this.displayProcedures = [];
      this.procedures = [];
      this.patientMedicalAdvise.procedureList = [];
      this.navCheckedList.splice(this.navCheckedList.indexOf("procedures"), 1);
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }
  enableNavbarNonMedications(): void {
    if ((<any>$("#nonMedications:checked")).length > 0) {
      this.navCheckedList.push("nonMedications");
      $("#inlineFormInputGroupNonMedication").val("");
      this.addSuggestedNonMedication = "";
      this.doctorService
        .getSuggestedNonMedication(this.getSuggestedListBody)
        .then(data => {
          this.displayNonMedications = JSON.parse(JSON.stringify(data));
          this.nonMedications = JSON.parse(JSON.stringify(data));
        });
    } else {
      this.displayNonMedications = [];
      this.nonMedications = [];
      this.patientMedicalAdvise.nonMedicationAdvises = [];
      this.navCheckedList.splice(
        this.navCheckedList.indexOf("nonMedications"),
        1
      );
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }
  enableNavbarImmunizations(): void {
    if ((<any>$("#immunizations:checked")).length > 0) {
      this.navCheckedList.push("immunizations");
      $("#inlineFormInputGroupImmunization").val("");
      this.addSuggestedImmunization = "";
      this.doctorService
        .getSuggestedImmunization(this.getSuggestedListBody)
        .then(data => {
          this.immunizations = JSON.parse(JSON.stringify(data));
          this.dispayImmunizations = JSON.parse(JSON.stringify(data));
        });
    } else {
      this.dispayImmunizations = [];
      this.immunizations = [];
      this.patientMedicalAdvise.immunizationAdvices = [];
      this.navCheckedList.splice(
        this.navCheckedList.indexOf("immunizations"),
        1
      );
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }
  enableNavbarReferrals(): void {
    if ((<any>$("#referrals:checked")).length > 0) {
      this.navCheckedList.push("referrals");
      $("#inlineFormInputGroupReferral").val("");
      this.doctorService
        .getSuggestedReferral(this.getSuggestedListBody.doctorId)
        .then(data => {
          console.log("referrals");
          console.log(data);
          this.referrals = JSON.parse(JSON.stringify(data));
          this.dispayReferral = JSON.parse(JSON.stringify(data));
        });
    } else {
      this.referrals = [];
      this.dispayReferral = [];
      this.patientMedicalAdvise.referralDoctorList = [];
      this.navCheckedList.splice(this.navCheckedList.indexOf("referrals"), 1);
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }
  enableNavbarFollowUPs(): void {
    if ((<any>$("#followUPs:checked")).length > 0) {
      this.navCheckedList.push("followUPs");
      this.patientMedicalAdvise.followupAdvices = new Array();
      this.followupAdvices = new FollowUpDiscount();
    } else {
      this.navCheckedList.splice(this.navCheckedList.indexOf("followUPs"), 1);
      this.patientMedicalAdvise.followupAdvices = undefined;
      this.followupAdvices = new FollowUpDiscount();
      // this.patientMedicalAdvise.followupAdvices[0].title = '';
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }
  addSuggestedImmunizations() {
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
          console.log(data);
          this.dispayImmunizations.unshift(data);
          this.immunizations.unshift(data);
          this.addSuggestedImmunization = "";
        }
      });
  }

  onClickStat() {
    this.checkedPropOfDoseLabel = true
  }

  onClickNeedBased() {
    this.checkedPropOfDoseLabel = false
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

  searchForMoreReferral(event) {
    console.log(event);
    let searchElement: string = this.getStringValue("#inlineFormInputGroupReferral").trim();
    if (searchElement.length >= 3) {
      this.refferalDoctor = searchElement
      this.doctorService
        .getReferralAutocomplete({
          from: 0,
          indexName: "Doctors",
          isDigi: false,
          searchTerm: searchElement,
          brandId: Config.portal.appId,
          size: 50
        })
        .then(data => {
          console.log(data);
          if (data.length > -1) {
            let doctors: DoctorDetails[] = [];
            console.log(data);

            for (let i = 0; i < data.length; i++) {
              for (let j = 0; j < data[i].serviceList.length; j++) {
                console.log(data[i].serviceList[j]);
                let doctor: DoctorDetails = JSON.parse(JSON.stringify(data[i]));
                doctor.serviceList = [JSON.parse(JSON.stringify(data[i].serviceList[j]))];
                doctors.push(doctor);
              }
            }
            this.dispayReferral = JSON.parse(JSON.stringify(doctors));
            console.log(this.dispayReferral);

            this.checkAllSelectedReferrals();
          }
        });
    } else {
      this.refferalDoctor = ''
      this.dispayReferral = JSON.parse(JSON.stringify(this.referrals));
      this.checkAllSelectedReferrals();
    }
  }
  addNoteForAdvice(): void {
    this.textAdvise.title = this.getStringValue("#2prescription_notes");
    this.patientMedicalAdvise.noteList[0] = this.textAdvise;
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }

  checkAllSelectedImmunizationn() {
    for (
      let i = 0;
      i < this.patientMedicalAdvise.immunizationAdvices.length;
      i++
    ) {
      let index = this.indexOfObjectWithGenericMedicineId(
        this.dispayImmunizations,
        this.patientMedicalAdvise.immunizationAdvices[i]
      );
      if (index >= 0) {
        this.dispayImmunizations.splice(index, 1);
        this.dispayImmunizations.unshift(
          this.patientMedicalAdvise.immunizationAdvices[i]
        );
        if ((this.dispayImmunizations[0]))
          this.dispayImmunizations[0].isSelected = true;
        (<any>$("#immunization" + "0")).checked = true;
      } else {
        this.dispayImmunizations.unshift(
          this.patientMedicalAdvise.immunizationAdvices[i]
        );
        if ((this.dispayImmunizations[0]))
          this.dispayImmunizations[0].isSelected = true;

        (<any>$("#immunization" + "0")).checked = true;
      }
    }
  }

  onClickAddMedicine() {
    let doseLabel: string = this.getStringValue("input[name='dos']:checked");
    let isSos: boolean = (<any>$("#sos" + ":checked")).length > 0 ? true : false;
    console.log(isSos);

    this.medicine.isSOS = isSos;
    if (this.medicine.addedByDoctor && (!this.med_type || this.med_type == '')) {
      this.errorMessage = "Please select Drug Form";
      this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
      return;
    }
    if (this.med_type == "Other" && (!this.medicine.drugForm)) {
      if (this.getStringValue("#med_type_input") == "") {
        this.errorMessage = "Please enter drug form";
        this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
        return;
      }
    }
    if (this.enableMandatoryMedRoute && (this.route_opt == undefined || this.route_opt == '')) {
      this.errorMessage = "Please select medicine route";
      this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
      return;
    }
    if (
      (doseLabel != "" && doseLabel != null && doseLabel != undefined) ||
      (this.getStringValue("#Dosage_1") != "" && this.getStringValue("#time_1")) && +this.getStringValue("#Dosage_1") > 0 ||
      (this.getStringValue("#Dosage_2") != "" && this.getStringValue("#time_2")) && +this.getStringValue("#Dosage_2") > 0 ||
      (this.getStringValue("#Dosage_3") != "" && this.getStringValue("#time_3")) && +this.getStringValue("#Dosage_3") > 0 ||
      (this.getStringValue("#Dosage_4") != "" && this.getStringValue("#time_4")) && +this.getStringValue("#Dosage_4") > 0 ||
      (this.getStringValue("#Dosage_5") != "" && this.getStringValue("#time_5")) && +this.getStringValue("#Dosage_5") > 0 ||
      (this.getStringValue("#Dosage_6") != "" && this.getStringValue("#time_6")) && +this.getStringValue("#Dosage_6") > 0 ||
      isSos == true
    ) {
      console.log(this.getStringValue("#qty_dose"), "qty_dose")
      console.log(this.unit_med, "unit_med")
      console.log(this.getStringValue("#unit_med_input"), "unit_med_input")
      console.log(this.frequency_med, "frequency_med")
      console.log(this.getStringValue("#frequency_med_input"), "qty_dose")
      console.log(this.dur_med, "dur_med")
      console.log(this.getStringValue("#dur_med_input"), "dur_med_input")
      console.log(this.food_info, "food_info")
      console.log(this.getStringValue("#food_info_input"), "food_info_input")
      console.log(this.route_opt, "route_opt")
      console.log(this.getStringValue("#route_opt_input"), "route_opt_input")
      if (isSos == false) { // no validations for sos
        if ((+(this.getStringValue("#qty_dose")) <= 0) && (!this.isWriteCustomDosages)) {
          this.errorMessage = "Please Enter valid Quantity Per Dose";
          this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
          return;
        }
        if (!this.unit_med) {
          this.errorMessage = "Please Enter unit";
          this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
          return;
        }
        if (this.unit_med == "Other") {
          if (this.getStringValue("#unit_med_input") == "") {
            this.errorMessage = "Enter unit";
            this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
            return;
          }
          if (this.getNumberValue("#unit_med_input") < 1) {
            this.errorMessage = "Enter Valid unit";
            this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
            return;
          }
        }
        if (!this.frequency_med) {
          this.errorMessage = "Please select frequency";
          this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
          return;
        }
        if (this.frequency_med == "Other") {
          if (this.getStringValue("#frequency_med_input") == "") {
            this.errorMessage = "Enter frequency";
            this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
            return;
          }
          if (this.getNumberValue("#frequency_med_input") < 1) {
            this.errorMessage = "Enter Valid frequency";
            this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
            return;
          }
        }
        if (!this.dur_med) {
          this.errorMessage = "Please Select Duration";
          this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
          return;
        }
        if (this.dur_med == "Other") {
          if (this.getStringValue("#dur_med_input") == "") {
            this.errorMessage = "Enter Duration";
            this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
            return;
          }
          if (this.getNumberValue("#dur_med_input") < 1) {
            this.errorMessage = "Enter Valid Duration";
            this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
            return;
          }
        }
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
      this.errorMessage = "";
      this.medicine.dosePerDay = 0;

      if (!this.suggestionMesicine) {
        this.displayMedicines[
          this.indexOfObjectWithPharmacy(this.displayMedicines, this.medicine)
        ].isSelected = true;
      }
      this.suggestionMesicine = false;
      this.errorMessage = "";
      // medicineTypeInput
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

        if (this.medicine.addedByDoctor || !this.medicine.drugForm || this.medicine.drugForm.length <= 0)
          this.medicine.drugForm = this.med_type == 'Other'
            ? this.getStringValue("#med_type_input")
            : (this.med_type) ? (this.med_type) : this.medicine.drugForm;

        this.medicine.takenWhenFood = this.food_info == 'Other'
          ? this.getStringValue("#food_info_input")
          : this.food_info;


        this.medicine.doseUnit = this.unit_med == 'Other'
          ? this.getStringValue("#unit_med_input")
          : this.unit_med;

        this.medicine.intakeRoute = this.route_opt == 'Other'
          ? this.getStringValue("#route_opt_input")
          : this.route_opt;

        this.medicine.duration = new Duration();
        if (this.frequency_med == 'Other') {
          this.medicine.duration.frequencyDays = this.getNumberValue("#frequency_med_input")
          this.medicine.duration.frequencyLabel = this.getStringValue("#frequency_med_input");
        } else {
          this.medicine.duration.frequencyLabel = this.frequency_med;
          let frequencyConstants = this.getPharmacyConstants('frequency')
          frequencyConstants.forEach(item => {
            if (item.display == this.frequency_med) {
              this.medicine.duration.frequencyDays = +item.value;
            }
          })
        }
        this.medicine.duration.repeatTimes = this.dur_med == 'Other'
          ? this.getNumberValue("#dur_med_input")
          : +this.dur_med;

        this.medicine.emergency = (<any>$("#stat" + ":checked")).length > 0 ? true : false;
      } else {

        if (this.medicine.addedByDoctor || !this.medicine.drugForm || this.medicine.drugForm.length <= 0)
          this.medicine.drugForm = this.med_type == 'Other'
            ? this.getStringValue("#med_type_input")
            : (this.med_type) ? (this.med_type) : this.medicine.drugForm;

        this.medicine.isSOS = isSos;

        this.medicine.takenWhenFood = this.food_info == 'Other'
          ? this.getStringValue("#food_info_input")
          : this.food_info;

        this.medicine.doseUnit = this.unit_med == 'Other'
          ? this.getStringValue("#unit_med_input")
          : this.unit_med;

        this.medicine.duration = new Duration();
        if (this.frequency_med == 'Other') {
          this.medicine.duration.frequencyDays = this.getNumberValue("#frequency_med_input")
          this.medicine.duration.frequencyLabel = this.getStringValue("#frequency_med_input");
        } else {
          this.medicine.duration.frequencyLabel = this.frequency_med;
          let frequencyConstants = this.getPharmacyConstants('frequency')
          frequencyConstants.forEach(item => {
            if (item.display == this.frequency_med) {
              this.medicine.duration.frequencyDays = +item.value;
            }
          })
        }
        this.medicine.duration.repeatTimes = this.dur_med == 'Other'
          ? this.getNumberValue("#dur_med_input")
          : +this.dur_med;

        this.medicine.intakeRoute = this.route_opt == 'Other'
          ? this.getStringValue("#route_opt_input")
          : this.route_opt;
      }

      this.medicine.packageSoldLoose = true;
      console.log(this.medicine);

      this.modelView = "";
      (<any>$("#medicalprescriptionmodel")).modal("hide");
      this.patientMedicalAdvise.pharmacyAdvises.pharmacyAdviceList.push(
        this.medicine
      );
    } else {
      this.errorMessage = "Please select Dose";
      this.toast.show(this.errorMessage, "bg-warning text-white font-weight-bold", 3000);
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }
  addSuggestedMedicines() {
    let medicine: Pharmacy = new Pharmacy();
    medicine.productName = this.addSuggestedMedicine;
    medicine.addedByDoctor = true;
    this.displayMedicines.unshift(medicine);
    this.medicines.unshift(medicine);
    this.addSuggestedMedicine = "";
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
            this.displayMedicines.forEach((item) => {
              this.productidList.push(item.productId)
            });
          }
          this.pharmacyService.getPharamacyStockDetails(this.productidList).then((response) => {
            if (response) {
              response.forEach((res) => {
                for (let medicine of this.displayMedicines) {
                  if (res.productId == medicine.productId && res.stockAvailable) {
                    medicine.stockAvailable = true
                  }
                }
              })
            }
          });
          this.productidList = []
        });
    } else {
      this.addSuggestedMedicine = "";
      this.displayMedicines = JSON.parse(JSON.stringify(this.medicines));
      this.checkAllSelectedMedicines();
    }
  }

  checkAllSelectedMedicines() {
    console.log("trying to check checkAllSelectedMedicines");

    for (
      let i = 0;
      i <
      this.patientMedicalAdvise.pharmacyAdvises.pharmacyAdviceList
        .length;
      i++
    ) {
      let index = this.indexOfObjectWithPharmacy(
        this.displayMedicines,
        this.patientMedicalAdvise.pharmacyAdvises
          .pharmacyAdviceList[i]
      );
      if (
        index >= 0
      ) {
        console.log("found this object common");
        console.log(
          this.patientMedicalAdvise.pharmacyAdvises
            .pharmacyAdviceList[i].productName
        );
        let medicine: Pharmacy = JSON.parse(JSON.stringify(this.displayMedicines[index]));

        this.displayMedicines.splice(index, 1);
        this.displayMedicines.unshift(
          medicine
        );
        if ((this.displayMedicines[0]))
          this.displayMedicines[0].isSelected = true;
      } else {
        console.log("object not found so inserted");
        console.log(
          this.patientMedicalAdvise.pharmacyAdvises
            .pharmacyAdviceList[i].productName
        );
        let medicine: Pharmacy = JSON.parse(JSON.stringify(this.patientMedicalAdvise.pharmacyAdvises
          .pharmacyAdviceList[i]));

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
        if ((this.displayMedicines[0]))
          this.displayMedicines[0].isSelected = true;
      }
    }
  }


  addSuggestedInvestigations() {
    this.doctorService
      .addSuggestedInvestigations({
        doctorId: this.authService.userAuth.employeeId,
        doctorServiceId: this.doctorService.patientQueue.serviceId,
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
          console.log(data);
          this.displayInvestigations.unshift(data);
          this.investigations.unshift(data);
          this.addSuggestedInvestigation = "";
        }
      });
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
  checkAllSelectedInvestigations() {
    for (
      let i = 0;
      i <
      this.patientMedicalAdvise.investigationAdvises
        .investigationList.length;
      i++
    ) {
      let index = this.indexOfObjectWithServiceId(
        this.displayInvestigations,
        this.patientMedicalAdvise.investigationAdvises
          .investigationList[i]
      );
      if (
        index >= 0
      ) {

        this.displayInvestigations.splice(index, 1);
        this.displayInvestigations.unshift(
          this.patientMedicalAdvise.investigationAdvises
            .investigationList[i]
        );
        if (this.displayInvestigations[0])
          this.displayInvestigations[0].isSelected = true;
      } else {
        this.displayInvestigations.unshift(
          this.patientMedicalAdvise.investigationAdvises
            .investigationList[i]
        );
        if (this.displayInvestigations[0])
          this.displayInvestigations[0].isSelected = true;
      }
    }
  }
  addSuggestedAdmissionNotes() {
    this.doctorService
      .addSuggestedAdmissionNotes({
        doctorId: this.authService.userAuth.employeeId,
        doctorServiceId: this.doctorService.patientQueue.serviceId,
        homeCollections: 0,
        phrTestId: 0,
        pocId: 0,
        categoryId: 0,
        parentServiceId: 0,
        serviceId: 0,
        serviceName: this.addSuggestedAdmissionNote,
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
          console.log(data);
          this.displayAdmissionNotes.unshift(data);
          this.admissionNotes.unshift(data);
          this.addSuggestedAdmissionNote = "";
        }
      });
  }
  searchForMoreAdmisionNotes(event) {
    let searchElement: string = this.getStringValue("#inlineFormInputGroupAdmissionNotes").trim();
    if (searchElement.length >= 3) {
      this.addSuggestedAdmissionNote = searchElement;
      this.doctorService
        .getAdmissionNoteList(searchElement, this.authService.userAuth.employeeId)
        .then(data => {
          console.log(data);
          if (data.length > -1) {
            this.displayAdmissionNotes = JSON.parse(JSON.stringify(data));
            this.checkAllSelectedAdmissionNoteProcedures();
          }
        });
    } else {
      this.addSuggestedAdmissionNote = "";
      this.displayAdmissionNotes = JSON.parse(JSON.stringify(this.admissionNotes));
      this.checkAllSelectedAdmissionNoteProcedures();
    }
  }
  checkAllSelectedAdmissionNoteProcedures() {
    for (
      let i = 0;
      i < this.patientMedicalAdvise.admissionNote.procedureList.length;//xs
      i++
    ) {
      let index = this.indexOfObjectWithServiceId(
        this.displayAdmissionNotes,
        this.patientMedicalAdvise.admissionNote.procedureList[i]//xs
      );
      if (
        index >= 0
      ) {
        this.displayAdmissionNotes.splice(index, 1);
        this.displayAdmissionNotes.unshift(
          this.patientMedicalAdvise.admissionNote.procedureList[i]
        );
        if (this.displayAdmissionNotes[0])
          this.displayAdmissionNotes[0].isSelected = true;
        (<any>$("#admissionnotes" + "0")).checked = true;
      } else {
        this.displayAdmissionNotes.unshift(
          this.patientMedicalAdvise.admissionNote.procedureList[i]

        );
        if (this.displayAdmissionNotes[0])
          this.displayAdmissionNotes[0].isSelected = true;
        (<any>$("#admissionnotes" + "0")).checked = true;
      }
    }
  }

  addSuggestedProcedures() {
    this.doctorService
      .addSuggestedProcedures({
        doctorId: this.authService.userAuth.employeeId,
        doctorServiceId: this.doctorService.patientQueue.serviceId,
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
          console.log(data);
          this.displayProcedures.unshift(data);
          this.procedures.unshift(data);
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
      i < this.patientMedicalAdvise.procedureList.length;
      i++
    ) {
      let index = this.indexOfObjectWithServiceId(
        this.displayProcedures,
        this.patientMedicalAdvise.procedureList[i]
      );
      if (
        index >= 0
      ) {

        this.displayProcedures.splice(index, 1);
        this.displayProcedures.unshift(
          this.patientMedicalAdvise.procedureList[i]
        );
        (<any>$("#procedure" + "0")).checked = true;
        if (this.displayProcedures[0])
          this.displayProcedures[0].isSelected = true;
      } else {
        this.displayProcedures.unshift(
          this.patientMedicalAdvise.procedureList[i]
        );

        (<any>$("#procedure" + "0")).checked = true;
        if (this.displayProcedures[0])
          this.displayProcedures[0].isSelected = true;
      }
    }
  }
  addSuggestedNonMedications() {
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
          console.log(data);
          this.displayNonMedications.unshift(data);
          this.nonMedications.unshift(data);
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
      i < this.patientMedicalAdvise.nonMedicationAdvises.length;
      i++
    ) {
      let index = this.indexOfObjectWithId(
        this.displayNonMedications,
        this.patientMedicalAdvise.nonMedicationAdvises[i]
      );
      if (
        index >= 0
      ) {

        this.displayNonMedications.splice(index, 1);
        this.displayNonMedications.unshift(
          this.patientMedicalAdvise.nonMedicationAdvises[i]
        );
        (<any>$("#nonMedication" + "0")).checked = true;
        if (this.displayNonMedications[0])
          this.displayNonMedications[0].isSelected = true;
      } else {
        this.displayNonMedications.unshift(
          this.patientMedicalAdvise.nonMedicationAdvises[i]
        );

        (<any>$("#nonMedication" + "0")).checked = true;
        if (this.displayNonMedications[0])
          this.displayNonMedications[0].isSelected = true;
      }
    }
  }
  checkAllSelectedReferrals() {
    console.log("trying to check checkAllSelectedReferrals");

    for (
      let i = 0;
      i < this.patientMedicalAdvise.referralDoctorList.length;
      i++
    ) {
      let index = this.indexOfObjectWithEmpId(
        this.dispayReferral,
        this.patientMedicalAdvise.referralDoctorList[i]
          .doctorDetail
      );
      if (
        index >= 0
      ) {
        console.log("found this object common");
        console.log(
          this.patientMedicalAdvise.referralDoctorList[i]
            .doctorDetail
        );

        this.dispayReferral.splice(index, 1);
        this.dispayReferral.unshift(
          this.patientMedicalAdvise.referralDoctorList[i]
            .doctorDetail
        );
        if (this.dispayReferral[0])
          this.dispayReferral[0].isSelected = true;
        (<any>$("#referral" + "0")).checked = true;
      } else {
        console.log("object not found so inserted");
        console.log(
          this.patientMedicalAdvise.referralDoctorList[i]
            .doctorDetail
        );
        this.dispayReferral.unshift(
          this.patientMedicalAdvise.referralDoctorList[i]
            .doctorDetail
        );
        if (this.dispayReferral[0])
          this.dispayReferral[0].isSelected = true;
        (<any>$("#referral" + "0")).checked = true;
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
  indexOfObjectWithPharmacy(obj1: any[], obj2): number {
    for (let i = 0; i < obj1.length; i++) {
      if ((obj1[i].productId + obj1[i].productName) == (obj2.productId + obj2.productName)) {
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
  indexOfObjectWithEmpId(obj1: any[], obj2): number {
    for (let i = 0; i < obj1.length; i++) {
      if (obj1[i].empId == obj2.empId && obj1[i].serviceList[0].serviceId == obj2.serviceList[0].serviceId) {
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

  removeFollowUp() {
    this.followupAdvices = new FollowUpDiscount();
    this.patientMedicalAdvise.followupAdvices = undefined;
  }
  applyFollowUp(discountPercent = this.followupAdvices.discountPercent, validityDays = this.followupAdvices.validityDays,
    title = this.followupAdvices.title): void {
    let followupAdvices: FollowUpDiscount = new FollowUpDiscount();
    followupAdvices.discountPercent = discountPercent || 0;
    followupAdvices.validityDays = validityDays;
    followupAdvices.title = title;
    this.followupAdvices = followupAdvices;
    if (this.followupAdvices != null && this.followupAdvices != undefined &&
      this.followupAdvices.discountPercent != null &&
      this.followupAdvices.validityDays != null &&
      this.followupAdvices.discountPercent != undefined &&
      this.followupAdvices.validityDays != undefined
    ) {
      if (this.followupAdvices.validityDays > 0) {
        this.patientMedicalAdvise.followupAdvices = new Array();
        this.patientMedicalAdvise.followupAdvices[0] = (this.followupAdvices);
        console.log(this.followupAdvices);
        // alert("FollowUp Applied");
        this.videoCardService.updatePrescription(this.patientMedicalAdvise);
        this.toast.show("FollowUp Applied", "bg-success text-white font-weight-bold", 2000);
      }
    }
    console.log(this.patientMedicalAdvise.followupAdvices);
  }


  calDiscountWithDays(days: number = this.getNumberValue("#visitWithIn")) {
    console.log("days=" + days);
    if (!this.authService.employeeDetails.employeePocMappingList[this.followUpIndex]
      .participationSettings.followupDiscountList) {
      return;
    }
    if (days <= 0) {
      this.followupAdvices.discountPercent = 0;
      this.followupAdvices.validityDays = 0;
      return;
    }
    let length = this.authService.employeeDetails.employeePocMappingList[this.followUpIndex]
      .participationSettings.followupDiscountList.length;
    for (let i = 0; i < length; i++) {
      console.log(
        this.authService.employeeDetails.employeePocMappingList[
          this.followUpIndex
        ].participationSettings.followupDiscountList[i].validityDays + "validityDays"
      );
      if (
        days <=
        this.authService.employeeDetails.employeePocMappingList[
          this.followUpIndex
        ].participationSettings.followupDiscountList[i].validityDays
      ) {
        console.log(
          "discount=" +
          this.authService.employeeDetails.employeePocMappingList[
            this.followUpIndex
          ].participationSettings.followupDiscountList[i].discountPercent
        );
        this.followupAdvices.discountPercent = this.authService.employeeDetails.employeePocMappingList[
          this.followUpIndex
        ].participationSettings.followupDiscountList[i].discountPercent
        return;
      }
    }
    this.followupAdvices.discountPercent = 0;
  }

  updateMedicineAdditionalNotes(note) {
    if (!this.medicine.notes) {
      this.medicine.notes = new Array();
      this.medicine.notes[0] = new MedicalNote();
    }
    this.medicine.notes[0].title = note;
  }

  getNumberValue(id: string): number {
    return ($(id).val() != undefined
      && $(id).val() != null
      && $(id).val().toString() != null
      && $(id).val().toString() != "")
      ? parseInt($(id).val().toString())
      : 0;
  }

  getStringValue(id: string): string {
    return ($(id).val() != undefined
      && $(id).val() != null
      && $(id).val().toString() != null
      && $(id).val().toString() != "")
      ? $(id).val().toString()
      : "";
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

  validateDecimalNumber(id: string, e) {
    if (e.keyCode == 110 || e.keyCode == 9 || e.keyCode == 190) {
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

  validateNumberWithMax(id: string, e, maxValue: number = 100) {
    let val = this.getNumberValue(id);
    console.log(val);
    if (val == 0) {
      $(id).val("");
      // return;
    }
    if (
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      (e.keyCode >= 96 && e.keyCode <= 105)
    ) {
      val = +(val + e.key);
      console.log(val);
    }
    console.log("maxValue---" + maxValue);
    if (val > maxValue && (
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      (e.keyCode >= 96 && e.keyCode <= 105)
    )) {
      e.preventDefault();
      return false;
    }
    return true;
  }
  selectUnit() {
    this.unit_med = this.getStringValue("#qty_unit");
  }

  convertToDate(milli: number) {
    return this.commonUtil.convertToDate(milli);
  }
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

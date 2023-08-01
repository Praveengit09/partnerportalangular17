import { Component, Input, ViewEncapsulation } from "@angular/core";
import { Router } from '@angular/router';
import { CryptoUtil } from "../../../auth/util/cryptoutil";
import { CommonUtil } from "../../../base/util/common-util";
import { DoctorService } from "../../../doctor/doctor.service";
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { SlotBookingDetails } from "../../../model/basket/slotBookingDetails";
import { PatientQueue } from '../../../model/reception/patientQueue';
import { NurseService } from '../../nurse.service';
import { AuthService } from './../../../auth/auth.service';
import { ToasterService } from "./../../../layout/toaster/toaster.service";
import { Symptoms } from './../../../model/advice/symptoms';
import { NonInvasiveTestDetails } from "./../../../model/phr/noninvasivetestdetails";
import { Question } from "./../../../model/phr/question";

@Component({
    selector: 'PreConsultationQuestionnaire',
    templateUrl: './preconsultationquestionnaire.template.html',
    styleUrls: ['./preconsultationquestionnaire.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PreConsultationQuestionnaireComponent {

    @Input() patientQue: PatientQueue;
    modelView = "";
    QuestionConstants = Question;
    errorMessage: string;
    requestConsentForPatient: string = '';
    selectedPatient: PatientQueue = new PatientQueue();
    consentOtp: string = '';
    consentVerified: boolean = false;
    profileId: number;
    common: CommonUtil;
    enableVitals: boolean = false;
    enableQuestionnaire: boolean = false;
    vitalInputList: NonInvasiveTestDetails[] = [];
    heightIndex = -1;
    weightIndex = -1;
    bmiIndex = -1;
    isFromDoctor: boolean = false;
    addSuggestedSymptom: string = "";
    displaySymptoms: Symptoms[] = [];
    symptoms: Symptoms[] = [];
    phrSymtomsValues: any;

    addSuggestedAllergy: string = "";
    displayAllergies: Symptoms[] = [];
    allergies: Symptoms[] = [];
    phrAllergyValue: any;

    constructor(private router: Router,
        private nurseService: NurseService, private authService: AuthService,
        private doctorService: DoctorService,
        private toast: ToasterService,
        private _common: CommonUtil,
        private spinnerService: SpinnerService) {
        this.common = _common;

        this.patientQue = this.nurseService.patientQ;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.nurseService.patientQ != undefined && this.nurseService.patientQ != null && JSON.stringify(this.nurseService.patientQ) != '{}') {
            window.localStorage.setItem('selectedPatientDetailsForVitals', cryptoUtil.encryptData(JSON.stringify(this.nurseService.patientQ)));
        }
        else if (this.nurseService.patientQ == undefined || this.nurseService.patientQ == null || JSON.stringify(this.nurseService.patientQ) == '{}') {
            this.patientQue = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedPatientDetailsForVitals')));
        }
        this.profileId = this.patientQue.patientProfileId;
    }

    ngOnInit(): void {

        this.getQuestinnaireData();
        this.enableQuestionnaire = true;
        this.enableVitals = false;
        this.consentVerified = true;

        console.log("PATIENT QUE in ngOnInit():: " + JSON.stringify(this.patientQue));
    }

    setInputValuesFromPHRAns(phrAns: NonInvasiveTestDetails[]) {
        phrAns.forEach((phr, index) => {
            if (phr.componentId == Question.COMPONENT_OPTIONS) {
                if (!phr.ans) phr.ans = '';
                let ansList = phr.ans.split(".");
                if (ansList.length == 0)
                    ansList = ['', '']
                if (ansList.length == 1)
                    ansList = [ansList[0], '']
                phr.ansList = ansList;
            }
            if (phr.id == 1)
                this.heightIndex = index;
            else if (phr.id == 3)
                this.weightIndex = index;
            else if (phr.id == 45) {
                this.bmiIndex = index;
                phr.isDisabled = true;
            }
        });
        console.log('phrAns', JSON.stringify(phrAns))
    }

    getPhrAnsFromInputValue(phrAns: NonInvasiveTestDetails[]) {
        phrAns.forEach(phr => {
            if (phr.componentId == Question.COMPONENT_OPTIONS) {
                let ansList: any[] = phr.ansList;
                phr.ans = ansList.join('.');
                phr.value = ansList.join('.');
            }
            if (phr.inputType == 2) {
                if (this.enableVitals == true) {
                    phr.ans = isNaN(parseFloat(phr.value)) ? undefined : phr.value;
                    phr.value = phr.ans;
                }
                else {
                    phr.ans = phr.value;
                }


            }
        });
        console.log(phrAns);
    }

    onChangeInput(event, phrAns: NonInvasiveTestDetails, choiceIndex = 0) {

        if (phrAns.inputType == 2) {
            if (this.enableVitals == true)
                phrAns.value = !Number.isNaN(parseFloat(phrAns.value)) ? (phrAns.value) + '' : '';
            else
                phrAns.value = (phrAns.value);
            console.log('onChangeInput', phrAns.value);
        }
        if (phrAns.id == 3) {//weight
            if (!this.minMaxValidator(event, phrAns, 0, 200)) return;
        }
        else if (phrAns.id == 59) {//Temperature
            if (!this.minMaxValidator(event, phrAns, 0, 110)) return;
        }
        else if (phrAns.id == 13) {//Pulse Rate
            if (!this.minMaxValidator(event, phrAns, 0, 200)) return;
        }
        else if (phrAns.id == 14) {//Sys BP
            if (!this.minMaxValidator(event, phrAns, 0, 300)) return;
        }
        else if (phrAns.id == 19) {//Dia BP
            if (!this.minMaxValidator(event, phrAns, 0, 300)) return;
        }
        else if (phrAns.id == 15) {//Resp Rate
            if (!this.minMaxValidator(event, phrAns, 0, 200)) return;
        }
        else if (phrAns.id == 12) {//SpO2
            if (!this.minMaxValidator(event, phrAns, 0, 100)) return;
        }
        else if (phrAns.id == 16) {//Waist
            if (!this.minMaxValidator(event, phrAns, 0, 200)) return;
        }
        else if (phrAns.id == 17) {//Breath Hold
            if (!this.minMaxValidator(event, phrAns, 0, 200)) return;
        } else if (phrAns.id == 1) {//height
            let feet = choiceIndex == 0 ? +event.target.value : +this.vitalInputList[this.heightIndex].ansList[0];
            let inch = choiceIndex == 1 ? +event.target.value : +this.vitalInputList[this.heightIndex].ansList[1];
            let weight = +this.vitalInputList[this.weightIndex].value;
            this.calculateBMI(+feet, +inch, +weight);
        }
    }

    minMaxValidator(event: any, phrAns: NonInvasiveTestDetails, min: number, max: number) {
        if (phrAns.inputType == 2 && isNaN(+event.target.value)) {
            phrAns.value = '';
            this.toast.show(`Enter a valid ${phrAns.unit ? phrAns.unit : 'unit'}`);
            // return;
        }
        else if (+event.target.value > max) {
            event.preventDefault();
            phrAns.value = '';
            this.toast.show(`${phrAns.name} can't exceed ${max} ${phrAns.unit ? phrAns.unit : ''}`);
            return false;
        }
        else if (+event.target.value < min) {
            event.preventDefault();
            phrAns.value = '';
            this.toast.show(`${phrAns.name} can't be lesser then ${min} ${phrAns.unit ? phrAns.unit : ''}`);
            return false;
        }
        else if ((+event.target.value) < min) {
            event.preventDefault();
            phrAns.value = '';
            this.toast.show(`${phrAns.name} can't be lesser then ${min} ${phrAns.unit ? phrAns.unit : ''}`);
            return false;
        }
        else if (!this.decimalNoValidater(event.target.value)) {
            event.preventDefault();
            phrAns.value = '';
            this.toast.show(`Decimal value should not exceed more than two digits`);
            return false;
        }
        return true;
    }

    decimalNoValidater(number) {
        var regexp = /^\d+(\.\d{1,2})?$/;
        return regexp.test(number);
    }

    onKeyUp(event, phrAns: NonInvasiveTestDetails, choiceIndex = 0) {

        if (phrAns.id == 3) {//weight
            let feet = +this.vitalInputList[this.heightIndex].ansList[0];
            let inch = +this.vitalInputList[this.heightIndex].ansList[1];
            let weight = +event.target.value;
            this.calculateBMI(+feet, +inch, +weight);
        }
        this.onChangeInput(event, phrAns, choiceIndex);
    }

    calculateBMI(feet, inch, weight) {

        let heightInMeter = parseFloat((((+feet * 30.48) + (+inch * 2.54)) / 100).toFixed(2));
        let bmi = Math.round(+(weight / (heightInMeter * heightInMeter)) * 100) / 100;

        console.log(bmi, feet, inch, weight);
        this.vitalInputList[this.bmiIndex].value = bmi.toString();
        console.log(bmi, this.vitalInputList[this.bmiIndex])
    }

    validateNumber(event) {
        return event.charCode == 46 || (event.charCode >= 48 && event.charCode <= 57)
    }

    toggleDropdown(id: string) {
        (<any>$(id)).dropdown();
    }

    getQuestinnaireData() {
        console.log('patientQue', JSON.stringify(this.patientQue))
        let bookingType = this.patientQue.bookingType;
        let bookingSubType = this.patientQue.bookingSubType;
        if (`${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT}`
            || `${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_VIDEO}_0` || `${bookingType}_${bookingSubType}` === `0_2`
        ) {
            this.getVideoConsultationQuestinnaire();
        }
        else if ((`${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_WALKIN}` ||
            `${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_POC}`
            || `${bookingType}_${bookingSubType}` === `0_0` || `${bookingType}_${bookingSubType}` === `0_3`
        )) {
            this.getWalkinConsultationQuestinnaire();
        }
    }

    async getWalkinConsultationQuestinnaire() {
        let profileId = this.patientQue.patientProfileId;
        this.spinnerService.start();
        await this.nurseService.getWalkinBookingQuestions(profileId).then((res) => {
            this.spinnerService.stop();
            if (res.statusCode == 200 || res.statusCode == 201) {
                this.setQuestionnaireData(res)
            }
        })
    }

    getVideoConsultationQuestinnaire() {
        this.spinnerService.start();
        this.doctorService.getAnsOfVideoBooking(this.profileId).then((res) => {
            this.spinnerService.stop();
            if (res.statusCode == 200 || res.statusCode == 201) {
                this.setQuestionnaireData(res)
            }
        })
    }

    setQuestionnaireData(response) {
        let bookingQuestions: any[];
        if (response && response.activities && response.activities.length && response.activities[0].question) {

            this.phrSymtomsValues = response.activities[0].question.filter(ques => { return ques.id == 2020 });
            this.phrAllergyValue = response.activities[0].question.filter(ques => { return ques.id == 3016 });
            bookingQuestions = response.activities[0].question.filter(ques => { return ques.id != 2020 && ques.id > 0 });
            bookingQuestions.forEach((question) => {
                if (question.text != undefined || question.text != null) {
                    question.name = question.text;
                }
                else if (question.desc != undefined || question.desc != null) {
                    question.name = question.desc;
                }

                if ((question.componentId == 0 || question.componentId == 4 || question.componentId == 5) && (question.choices == undefined || question.choices == null)) {
                    question.choices = [];
                    let x = [{ 'count': 0, 'id': "", 'option': "SELECT" }];
                    question.choices[0] = x;
                }
                question.unit = '';
                question.value = question.ans;

                question.phrAns = {
                    "id": question.id,
                    "value": question.value,
                    "userId": this.profileId,
                    "historyGraphDisabled": false,
                }
            });

        }
        this.vitalInputList = bookingQuestions;
        this.setInputValuesFromPHRAns(this.vitalInputList);
        this.updateSymtomsIntoVitals(true)
        // this.getSuggestedList();
    }

    updateWalkinConsultationQuestinnaire() {
        this.getPhrAnsFromInputValue(this.vitalInputList);
        this.updateSymtomsIntoVitals();
        this.nurseService.updateWalkinBookingQuestions({
            "parentProfileId": this.patientQue.parentProfileId,
            "phrType": 104,
            "createdTime": new Date().getTime(),
            "profileId": this.profileId,
            "addedToOnboarding": true,
            "phrAns": this.vitalInputList,

        }).then((res) => {
            if (res.statusCode == 200 || res.statusCode == 201) {
                this.toast.show("Updated Successfully", "bg-success text-white font-weight-bold", 3000);
                this.router.navigate(['./app/nurse']);
            } else {

            }
        }).catch(error => {
        });
    }

    updateVideoConsultationQuestinnaire() {
        this.getPhrAnsFromInputValue(this.vitalInputList);
        this.updateSymtomsIntoVitals();
        this.nurseService.updateVideoBookingQuestions({
            "parentProfileId": this.patientQue.parentProfileId,
            "phrType": 100,
            "profileId": this.profileId,
            "addedToOnboarding": false,
            "phrPdfGenerated": false,
            "phrAns": this.vitalInputList,

        }).then((res) => {
            if (res.statusCode == 200 || res.statusCode == 201) {
                this.toast.show("Updated Successfully", "bg-success text-white font-weight-bold", 3000);
                this.router.navigate(['./app/nurse']);
            } else {

            }
        }).catch(error => {
        });
    }

    updateSymtomsIntoVitals(isInitial = false) {
        if (!isInitial) {
            let symtomValue = '';
            this.symptoms.forEach(sym => {
                if (sym.isSelected)
                    symtomValue += sym.name + '/';
            });
            symtomValue = (symtomValue.substring(0, symtomValue.length - 1));
            this.phrSymtomsValues[0].ans = this.phrSymtomsValues[0].value = symtomValue;

            let allergyValue = '';
            this.allergies.forEach(all => {
                if (all.isSelected)
                    allergyValue += all.name + '/';
            });
            allergyValue = (allergyValue.substring(0, allergyValue.length - 1));
            this.phrAllergyValue[0].ans = this.phrAllergyValue[0].value = allergyValue;
            this.vitalInputList.push(JSON.parse(JSON.stringify(this.phrSymtomsValues[0])));
            this.vitalInputList.push(JSON.parse(JSON.stringify(this.phrAllergyValue[0])));
        }
        console.log("updateSymtomsIntoVitals: ", this.phrSymtomsValues[0].ans)
        this.getSuggestedList();
    }

    getSuggestedList() {
        let getSuggestedListBody = {
            serviceId: 211,
            totalCount: 35
        };

        this.doctorService.getSuggestedSymptom(getSuggestedListBody).then(data => {
            this.displaySymptoms = JSON.parse(JSON.stringify(data));
            console.log(this.displaySymptoms);

            this.displaySymptoms.forEach(d => {
                d.isSelected = false;
            });
            this.symptoms = JSON.parse(JSON.stringify(this.displaySymptoms));
            this.setSymtomsAsPerPhr();
        });

        this.doctorService.getSuggestedAllergies(getSuggestedListBody).then(data => {
            this.displayAllergies = JSON.parse(JSON.stringify(data));
            console.log(this.displayAllergies);

            this.displayAllergies.forEach(d => {
                d.isSelected = false;
            });
            this.allergies = JSON.parse(JSON.stringify(this.displayAllergies));
            this.setAllergiesAsPerPhr();
        });
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
                    data.isSelected = true;
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
                    if (data.length) {
                        this.displaySymptoms = JSON.parse(JSON.stringify(data));
                        for (let symp of this.symptoms) {
                            let i = this.displaySymptoms.findIndex(sym => (sym.name == symp.name && symp.isSelected == true))
                            if (i >= 0) {
                                this.displaySymptoms[i].isSelected = true
                            }
                        }
                    }
                    else
                        this.displaySymptoms = JSON.parse(JSON.stringify(this.symptoms));
                });
        } else {
            this.addSuggestedSymptom = "";
            this.displaySymptoms = JSON.parse(JSON.stringify(this.symptoms));
        }
    }

    onClickSymptom(index) {
        let name = this.displaySymptoms[index].name;
        let idx = this.symptoms.findIndex(sym => sym.name == name);
        if (idx >= 0)
            this.symptoms[idx].isSelected = !this.symptoms[idx].isSelected;
        else {
            this.displaySymptoms[index].isSelected = !this.displaySymptoms[index].isSelected;
            this.symptoms.unshift(this.displaySymptoms[index]);
            this.displaySymptoms = this.symptoms
        }
    }

    setSymtomsAsPerPhr() {
        let s = this.phrSymtomsValues[0].ans;
        let values = s ? s.split('/') : [];
        values.forEach((value) => {
            let i = this.displaySymptoms.findIndex(sym => sym.name == value);
            if (i >= 0) {
                this.displaySymptoms[i].isSelected = true;
                this.symptoms[i].isSelected = true;
            }
            else {
                let body = {
                    "name": value,
                    "isSelected": true
                };
                this.displaySymptoms.unshift(JSON.parse(JSON.stringify(body)));
                this.symptoms.unshift(JSON.parse(JSON.stringify(body)));
            }
        })
    }

    setAllergiesAsPerPhr() {

        let s = this.phrAllergyValue[0].ans;
        let values = s ? s.split('/') : [];
        values.forEach((value) => {
            let i = this.displayAllergies.findIndex(sym => sym.name == value);
            if (i >= 0) {
                this.displayAllergies[i].isSelected = true;
                this.allergies[i].isSelected = true;
            }
            else {
                let body = {
                    "name": value,
                    "isSelected": true
                };
                this.displayAllergies.unshift(JSON.parse(JSON.stringify(body)));
                this.allergies.unshift(JSON.parse(JSON.stringify(body)));
            }
        })
    }

    onClickAllergy(index) {
        let name = this.displayAllergies[index].name;
        this.displayAllergies[index].isSelected = !this.displayAllergies[index].isSelected;
        let idx = this.allergies.findIndex(sym => sym.name == name);
        if (idx >= 0)
            this.allergies[idx].isSelected = !this.allergies[idx].isSelected;
        else
            this.allergies.unshift(this.displayAllergies[index]);
    }

    addSuggestedAllergies() {
        let data = {
            name: this.addSuggestedAllergy
        };
        this.addSuggestedAllergy = '';
        this.displayAllergies.unshift(JSON.parse(JSON.stringify(data)));
        this.allergies.unshift(JSON.parse(JSON.stringify(data)));
    }

    searchForMoreallergies(event) {
        let searchElement = $("#inlineallergies").val().toString().trim();
        if (searchElement.length >= 3) {
            this.addSuggestedAllergy = searchElement;
            let getSuggestedListBody = {
                serviceId: 211,
                totalCount: 35,
                searchTerm: this.addSuggestedAllergy
            };
            this.doctorService.getSuggestedAllergies(getSuggestedListBody).then(data => {
                if (data.length)
                    this.displayAllergies = JSON.parse(JSON.stringify(data));
                else
                    this.displayAllergies = JSON.parse(JSON.stringify(this.allergies));
            });
        } else {
            this.addSuggestedAllergy = "";
            this.displayAllergies = JSON.parse(JSON.stringify(this.allergies));
        }
    }
}


import { Component, ViewEncapsulation } from '@angular/core';
import { SelectedRegisteredProfile } from '../../model/profile/selectedRegisteredProfile';
import { SlotBookingDetails } from '../../model/basket/slotBookingDetails';
import { NurseService } from '../nurse.service';
import { SymptomBaseResponse } from '../../model/sbr/symptomBaseResponse ';
import { SymptomMedicationResponse } from '../../model/sbr/symptomMedicationResponse';
import { Question, SymptomQuestionnaireItemResponse } from '../../model/sbr/symptomQuestionnaireItemResponse';
import { SymptomAdviceRequest } from '../../model/sbr/symptomAdviceRequest';
import { Router } from '@angular/router';
import { CommonUtil } from '../../base/util/common-util';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'SbrComponent',
    templateUrl: './Sbr.template.html',
    styleUrls: ['./Sbr.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SBRComponent {
    selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
    slotBookingDetails: SlotBookingDetails;
    symptomsList: SymptomBaseResponse;
    selectedSymptomAdvice: SymptomMedicationResponse;
    selectedSymptom: SymptomBaseResponse;
    genderId: number = 1;
    selectedSymptomAdviceQue: Array<Question>;
    selectedSymptomAdviceSym: SymptomQuestionnaireItemResponse;
    sbrAdvices: any;
    isNotMatched: boolean;
    questionsList: any[] = [];
    selectedSymptomAdviceList: any[] = [];
    nextButton: boolean = true;
    generateAdvice: boolean = false;
    key: string = "";
    keyId: string = "";
    finalKeyId: string = "";
    medicationId: number;
    profileId: any;
    symptomId: number;
    selectedKeyId: string = "";
    receptionRole: boolean = false;
    isError: boolean = false;
    showMessage: boolean = false;
    isFound: boolean = false;
    errorMessage: Array<string>;
    ischecked: string = "";
    tablets: any[] = [];
    checkAge: number;
    constructor(private nurseService: NurseService, private auth: AuthService, private router: Router, private common: CommonUtil) {
        this.receptionRole = auth.userAuth.hasReceptionRole;
    }

    ngOnInit(): void {
        if (!this.selectedRegisteredProfile.selfProfile.fName) {
            (<any>$('#registerPatientModal')).modal('show');
        }
        this.getSymptomslist();
    }
    getSymptomslist() {
        this.generateAdvice = false;
        this.nurseService.getSymptomsList().then(response => {
            this.symptomsList = response;
        });
    }
    onRegisterNewUser(selectedProfile: SelectedRegisteredProfile) {
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.selectedRegisteredProfile = selectedProfile;

        this.saveSelectedProfile();
    }
    saveSelectedProfile() {
        this.slotBookingDetails = new SlotBookingDetails();
        this.slotBookingDetails.patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
        this.slotBookingDetails.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
        this.slotBookingDetails.patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
        this.slotBookingDetails.patientProfileDetails = this.selectedRegisteredProfile.selectedProfile;
        this.slotBookingDetails.patientProfileDetails.contactInfo = this.selectedRegisteredProfile.selfProfile.contactInfo;
        console.log("=========>>>", JSON.stringify(this.selectedRegisteredProfile))
        if (this.selectedRegisteredProfile.selectedProfile.gender == "Male") {
            this.genderId = 1;
        }
        else if (this.selectedRegisteredProfile.selectedProfile.gender == "Female") {
            this.genderId = 2;
        }
        else {
            this.genderId = 3;
        }


    }

    onSymptomChange(index: number) {
        if (this.slotBookingDetails == undefined || this.slotBookingDetails.patientProfileId == undefined || this.slotBookingDetails.patientProfileId == null) {
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = "Please Select Patient...";
            this.isError = true;
            this.showMessage = true;
            this.getSymptomslist();
            return;
        }
        this.generateAdvice = false;
        this.questionsList = [];
        this.selectedSymptomAdviceList = [];
        this.nextButton = false;
        this.isFound = false;
        this.selectedKeyId = "";
        this.sbrAdvices = [];
        this.selectedSymptom = this.symptomsList[index - 1]
        this.medicationId = this.selectedSymptom.medicationType[0].id;
        this.profileId = this.slotBookingDetails.patientProfileId;
        this.symptomId = this.selectedSymptom.id
        this.nurseService.getSymptomsAdvices(this.medicationId, this.profileId, this.genderId, this.symptomId).then(advices => {
            this.selectedSymptomAdvice = advices;
            this.selectedSymptomAdviceSym = advices.symptomQuestion;
            this.selectedSymptomAdviceQue = advices.symptomQuestion.questions;
            this.selectedSymptomAdviceList.push(this.selectedSymptomAdviceSym);
            (<any>$)("#modal-2").modal("show");
        });
    }
    OnGenerateClick() {
        console.log(JSON.stringify(this.sbrAdvices) + "isfound==>>> " + this.isFound)
        if (this.isFound == false) {
            (<any>$)("#modal-3").modal("show");
            return;
        }
        let request: SymptomAdviceRequest = new SymptomAdviceRequest();
        request.key = this.selectedKeyId;
        request.genderId = this.genderId;
        request.profileId = this.profileId;
        request.medicationId = this.medicationId;
        request.symptomId = this.symptomId;

        this.nurseService.generateSymptomBasedAdvice(request).then(advices => {
            this.sbrAdvices = advices
            this.nurseService.getSbrAdvices(this.sbrAdvices);
            if (this.sbrAdvices.isEmergency > 0) {
                (<any>$)("#modal-3").modal("show");
                this.tablets = this.sbrAdvices.pharmacyAdviceList[0].pharmacyAdviceList;
            }
            else {
                this.router.navigate(['/app/nurse/SbrAdvice']);
            }

        });
    }

    onClick(index: number, event) {
        this.ischecked = "";
        if (event.target.checked) {

            for (let i = 0; i < this.selectedSymptomAdviceQue.length; i++) {
                if (this.selectedSymptomAdviceSym.isMultipleChoice == 0) {
                    if (this.selectedSymptomAdviceQue[index].id == this.selectedSymptomAdviceQue[i].id) {
                        this.selectedSymptomAdviceQue[i].isSelected = true;
                    }
                    else {
                        this.selectedSymptomAdviceQue[i].isSelected = false;
                        (<any>$)("#symptomCheck" + i).prop("checked", false);
                    }
                }
                else {
                    if (this.selectedSymptomAdviceQue[index].none == 0) {
                        if (this.selectedSymptomAdviceQue[index].id == this.selectedSymptomAdviceQue[i].id) {
                            this.selectedSymptomAdviceQue[i].isSelected = true;
                        }
                        if (this.selectedSymptomAdviceQue[i].none == 1) {
                            this.selectedSymptomAdviceQue[i].isSelected = false;
                            (<any>$)("#symptomCheck" + i).prop("checked", false);
                        }
                    }
                    else {
                        this.selectedSymptomAdviceQue[i].isSelected = false;
                        this.selectedSymptomAdviceQue[index].isSelected = true;
                        (<any>$)("#symptomCheck" + i).prop("checked", false);
                        (<any>$)("#symptomCheck" + index).prop("checked", true);
                    }
                }
            }
        } else {
            this.selectedSymptomAdviceQue[index].isSelected = false;
        }
        this.onCheckBoxClick();
    }

    onCheckBoxClick() {
        this.key = "";
        this.keyId = "";
        this.finalKeyId = "";
        this.nextButton = false;

        this.selectedSymptomAdviceQue.forEach(ele => {
            if (ele.isSelected == true) {
                this.key = this.key.concat(ele.option[0].optionId);
                this.finalKeyId = this.finalKeyId.concat(ele.id)
            }
            else {
                this.key = this.key.concat(ele.option[1].optionId);
            }
        });
        if (this.selectedSymptomAdviceSym.answers) {
            this.selectedSymptomAdviceSym.answers.forEach(ans => {
                ans.answerKey.forEach(e => {
                    console.log(this.key, "=====>>>", e)
                    if (this.key == e) {
                        this.nextButton = true;
                    }
                })
            })
        }
        // else {
        //     this.nextButton = false;

        // }
    }

    OnNextClick() {
        var isChecked: boolean = false;
        this.selectedSymptomAdviceQue.forEach(ele => {
            if (ele.isSelected || ele.isSelected == true) {
                isChecked = true;
                return;
            }
        })
        if (isChecked == false) {
            this.ischecked = "Please Select Atleast One Symptom...";
            return;
        }
        this.onCheckBoxClick();
        if (this.nextButton) {
            if (this.selectedSymptomAdviceSym.answers) {
                console.log(this.key, "======>>>", JSON.stringify(this.selectedSymptomAdviceQue))

                this.questionsList.push(this.selectedSymptomAdviceSym.questions);
                this.selectedSymptomAdviceSym.answers.forEach(ans => {
                    ans.answerKey.forEach(e => {
                        if (this.key == e) {
                            this.selectedSymptomAdviceQue = ans.questions;
                            this.selectedSymptomAdviceSym = ans;
                            console.log("======>>>", JSON.stringify(this.selectedSymptomAdviceQue))
                        }
                    })
                })
                this.selectedSymptomAdviceList.push(this.selectedSymptomAdviceSym);
            }
        }
        else {
            this.generateAdvice = true;
            this.isFound = false;
            this.questionsList.push(this.selectedSymptomAdviceSym.questions);
            this.selectedSymptomAdviceSym.lastAnswers.forEach(e1 => {
                this.keyId = "";
                e1.selectedId.forEach(id => {
                    this.keyId = this.keyId.concat(id)
                    console.log(this.keyId + "isfo" + this.finalKeyId + "und==>>> " + this.isFound)

                    if (this.finalKeyId == this.keyId) {
                        this.selectedKeyId = "";
                        this.isFound = true;
                        this.selectedSymptomAdviceList.forEach(ele => {
                            ele.questions.forEach(que => {
                                if (que.isSelected == true) {
                                    this.selectedKeyId = this.selectedKeyId.concat(que.id);
                                }
                            });
                        });
                        return;
                    }
                    (<any>$)("#modal-2").modal("hide");
                });
            })

        }
    }

    OnPreviousClick() {
        this.nextButton = true;
        this.selectedSymptomAdviceQue = this.questionsList[this.questionsList.length - 1];
        this.questionsList.pop();
        this.selectedSymptomAdviceList.pop()
        if (this.selectedSymptomAdviceList.length > 0) {
            this.selectedSymptomAdviceSym = this.selectedSymptomAdviceList[this.selectedSymptomAdviceList.length - 1];
        }
    }
    onEditSymptom(list, index: number) {
        this.selectedSymptomAdviceQue = list;
        this.generateAdvice = false;
        for (let i = index; index < this.questionsList.length; i++) {
            this.questionsList.splice(index, 1);
            this.selectedSymptomAdviceList.splice(index + 1, 1)
        }
        this.nextButton = true;
        if (this.selectedSymptomAdviceList.length > 0) {
            this.selectedSymptomAdviceSym = this.selectedSymptomAdviceList[this.selectedSymptomAdviceList.length - 1];
        }
    }

    closeModel(id: string) {
        (<any>$(id)).modal('hide');
    }
    openModal(id: string) {
        (<any>$(id)).modal('show');
        $(".modal-backdrop").not(':first').remove();
    }
    onModelClose() {
        if (this.questionsList.length <= 0)
            this.getSymptomslist();
    }
    onCancel() {
        this.getSymptomslist();
        this.questionsList = [];
    }

}

import { ViewEncapsulation, OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { SpinnerService } from "../../layout/widget/spinner/spinner.service";
import { SlotBookingDetails } from "../../model/basket/slotBookingDetails";
import { NurseService } from "../../nurse/nurse.service";
import { PhrCategory } from "../../model/phr/phrCategory";
import { PatientQueue } from "../../model/reception/patientQueue";
import { DoctorService } from "../doctor.service";


@Component({
    selector: 'pre-questionnaire',
    templateUrl: './prescriptionQuestionnaire.template.html',
    styleUrls: ['./prescriptionQuestionnaire.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class PrescriptionQuestionnaireComponent implements OnInit {


    @Input() patientQueue: PatientQueue = new PatientQueue();
    prescriptionQuestionnaire: PhrCategory = new PhrCategory();
    @Input() viewQuestionnaire: boolean = false;
    @Output() onCloseModal = new EventEmitter();
    constructor(private doctorService: DoctorService, private nurseService: NurseService, private spinner: SpinnerService) {


    }



    ngOnInit(): void {
        (<any>$("#prescriptionQuestionnaireModel")).modal("show");
        this.getPrescriptionQuestionnaire(this.patientQueue);
    }


    async getPrescriptionQuestionnaire(patientQueue) {
        let bookingType = patientQueue.bookingType;
        let bookingSubType = patientQueue.bookingSubType;
        if (`${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT}`
            || `${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_VIDEO}_0` || `${bookingType}_${bookingSubType}` === `0_2`
        ) {

            this.spinner.start();
            await this.doctorService.getAnsOfVideoBooking(patientQueue.patientProfileId).then(data => {

                this.spinner.stop();
                this.formatQuestinnaireData(data);
            }).catch((err) => {
                this.spinner.stop();
            });
        }
        else if ((`${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_WALKIN}` ||
            `${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_POC}`
            || `${bookingType}_${bookingSubType}` === `0_0` || `${bookingType}_${bookingSubType}` === `0_3`
        )) {
            this.spinner.start();
            await this.nurseService.getWalkinBookingQuestions(patientQueue.patientProfileId).then(data => {
                this.spinner.stop()
                this.prescriptionQuestionnaire = JSON.parse(JSON.stringify(data));
                this.viewQuestionnaire = true;
                if (data) {
                    for (let i = 0; i < this.prescriptionQuestionnaire.activities.length; i++) {
                        for (let j = 0; j < this.prescriptionQuestionnaire.activities[i].question.length; j++) {
                            let componentId = this.prescriptionQuestionnaire.activities[i].question[j].componentId;
                            this.prescriptionQuestionnaire.activities[i].question[j].calcuatedAnswer = this.prescriptionQuestionnaire.activities[i].question[j].ans;
                        }
                    }
                    // this.formatQuestinnaireDataForWalkin(data);
                }
            }).catch((err) => {
                this.spinner.stop();
            });;

            console.log('videQuestionModel', JSON.stringify(this.prescriptionQuestionnaire.activities[0]));
        }

    }

    formatQuestinnaireData(data) {
        this.prescriptionQuestionnaire = JSON.parse(JSON.stringify(data));
        this.viewQuestionnaire = true;
        if (data) {
            for (let i = 0; i < this.prescriptionQuestionnaire.activities.length; i++) {
                for (let j = 0; j < this.prescriptionQuestionnaire.activities[i].question.length; j++) {
                    let componentId = this.prescriptionQuestionnaire.activities[i].question[j].componentId;
                    if (componentId == 0 || componentId == 1 || componentId == 4 || componentId == 5) {
                        for (let k = 0; k < this.prescriptionQuestionnaire.activities[i].question[j].choices.length; k++) {
                            for (let l = 0; l < this.prescriptionQuestionnaire.activities[i].question[j].choices[k].length; l++) {
                                if (this.prescriptionQuestionnaire.activities[i].question[j].choices[k][l].id == this.prescriptionQuestionnaire.activities[i].question[j].ans && (this.prescriptionQuestionnaire.activities[i].question[j].ans != '')) {
                                    this.prescriptionQuestionnaire.activities[i].question[j].calcuatedAnswer = this.prescriptionQuestionnaire.activities[i].question[j].choices[k][l].option;
                                    break;
                                }
                            }
                        }
                    }
                    else if (this.prescriptionQuestionnaire.activities[i].question[j].componentId == 2) {
                        this.prescriptionQuestionnaire.activities[i].question[j].calcuatedAnswer = this.prescriptionQuestionnaire.activities[i].question[j].ans;
                    }

                }
            }
        }
        console.log('videQuestionModel', JSON.stringify(this.prescriptionQuestionnaire.activities[0]));

    }

    formatQuestinnaireDataForWalkin(data) {
        this.prescriptionQuestionnaire = JSON.parse(JSON.stringify(data));
        this.viewQuestionnaire = true;
        if (data) {
            for (let i = 0; i < this.prescriptionQuestionnaire.activities.length; i++) {
                for (let j = 0; j < this.prescriptionQuestionnaire.activities[i].question.length; j++) {
                    let componentId = this.prescriptionQuestionnaire.activities[i].question[j].componentId;
                    let inputType = this.prescriptionQuestionnaire.activities[i].question[j].inputType;
                    if ((componentId == 0 && inputType == 2) || (componentId == 4 && inputType == 0)) {
                        for (let k = 0; k < this.prescriptionQuestionnaire.activities[i].question[j].choices.length; k++) {
                            for (let l = 0; l < this.prescriptionQuestionnaire.activities[i].question[j].choices[k].length; l++) {
                                if (this.prescriptionQuestionnaire.activities[i].question[j].choices[k][l].id == this.prescriptionQuestionnaire.activities[i].question[j].ans && (this.prescriptionQuestionnaire.activities[i].question[j].ans != '')) {
                                    this.prescriptionQuestionnaire.activities[i].question[j].calcuatedAnswer = this.prescriptionQuestionnaire.activities[i].question[j].choices[k][l].option;
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        this.prescriptionQuestionnaire.activities[i].question[j].calcuatedAnswer = this.prescriptionQuestionnaire.activities[i].question[j].ans;
                    }

                }
            }
        }
        console.log('videQuestionModel', JSON.stringify(this.prescriptionQuestionnaire.activities[0]));

    }

    closeModal() {
        this.onCloseModal.emit('true')
    }


}
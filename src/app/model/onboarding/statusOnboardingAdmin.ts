import { OnboardingProfileDetails } from './../../model/onboarding/onboardingProfileDetails';

export class StatusOnboardingAdmin {

    public statusFlag: number;
    public actionFlag: number;
    public onboardingAdmin: OnboardingProfileDetails;

    constructor(onboardingAdmin: OnboardingProfileDetails) {

        this.onboardingAdmin = onboardingAdmin;

        this.statusFlag = 0; //New
        console.log("inside constructor");
        if (onboardingAdmin.markAddressStatus != 1) {//if payment is not paid and transaction type is mobile
            this.statusFlag = 1;//Pending
        }
        this.actionFlag = 0;



        //If payment is paid and all test result are uploaded
        if (onboardingAdmin.markAddressStatus == 1) {
            this.actionFlag = 1; //Completed
        }

    }

}

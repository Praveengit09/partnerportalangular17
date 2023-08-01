import { Injectable } from "@angular/core";
import { HttpService } from "../base/http.service";
import { AuthService } from "../auth/auth.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { AppConstants } from './../base/appconstants';
import { ProfileDetailsVO } from './../model/profile/profileDetailsVO';
import { RegistrationResponseVo } from './../model/profile/registrationResponseVo';
import { RegistrationVO } from './../model/profile/registrationVO';
import { OtpVo } from './../model/profile/otpVo';
@Injectable()
export class PatientRegisterService {

    registeredUsers: RegistrationResponseVo;

    errorMessage: string;
    constructor(
        private httpService: HttpService,
        private urlStringFormatter: URLStringFormatter
    ) { }


    getRegisteredUser(mobile: string) {

        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().UserSearch, mobile), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getRegisteredUserByName(name: string) {

        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().UserSearchBasedOnName + "?searchTerm=" + name), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getRegisteredUserByEmail(email: string) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().UserSearchBasedOnEmail, email), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    registration(info: RegistrationVO) {

        return this.httpService.httpPostPromise(this.httpService.getPaths().RegisterUser, JSON.stringify(info), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    generateOtp(otpvo: OtpVo) {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GenerateOTP, JSON.stringify(otpvo), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                console.log("otp data:" + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    updateFamilyMemberToServer(profileDetailsVO: ProfileDetailsVO) {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_NEW_FAMILY_PROFILE, JSON.stringify(profileDetailsVO), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    // getRevenueDetailsForDoctor(parentProfileId,profileId,pocId){
    //     return this.httpService.httpGetPromise(this.httpService.getPaths().GETPROFILEVISITEDDETAILS +"?parentProfileId="+parentProfileId+ "&patientProfileId=" + profileId+"&pocId="+ pocId, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
    //         return Promise.resolve(data);
    //     }).catch((err) => {
    //         if (err) {
    //             console.log(err);
    //             return Promise.reject(err);
    //         }
    //     });
    // }
    getCorporateReferral(referralCode, mobile) {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_CORPORATE_REFERRAL + "?referralCode=" + referralCode + "&mobileNo=" + mobile, AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    updateLisRegistration(reqBody) {
        return this.httpService.httpPostPromise(this.httpService.getPaths().LIS_PRIMARY_PROFILE_SELECTION, JSON.stringify(reqBody), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

}

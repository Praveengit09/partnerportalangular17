import { Injectable } from "@angular/core";
import { HttpService } from '../base/http.service';
import { ProfileSearchRequest } from './../model/onboarding/profileSearchRequest';
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { AppConstants } from '../base/appconstants';
import { OnboardingProfileDetails } from './../model/onboarding/onboardingProfileDetails';
import { OnboardingUserVO } from './../model/onboarding/onboardingUserVO';
import { BaseResponse } from './../model/base/baseresponse';
import { AuthService } from "../auth/auth.service";
import { OnboardingTypeResponse } from './../model/onboarding/onboardingTypeResponse';
import { PhrInvasive } from './../model/phr/phrInvasive';
import { PhrAnswer } from './../model/phr/phrAnswer';
import { RegistrationVO } from './../model/profile/registrationVO';
import { DashBoardChartResp } from './../model/chart/dashboardChartResp';
import { DashBoardChartReq } from './../model/chart/dashBoardChartReq';
import { UserReport } from './../model/report/userReport';
import { BasketRequest } from '../model/basket/basketRequest';

@Injectable()
export class OnboardingService {

    public errorMessage: Array<string>;
    public isError: boolean;
    public showMessage: boolean;
    pocId: number;

    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter
    ) { }
    getOnBoardedConsumerList(profileSearchRequest: ProfileSearchRequest): Promise<OnboardingProfileDetails[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_ONBOARDEDCONSUMERLIST,
            JSON.stringify(profileSearchRequest), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {

                console.log("update Order response >>>>>>>>>>>" + JSON.stringify(data));

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getPhrInvasiveNonInvasive(profileId: number): Promise<PhrInvasive> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.getPhrInvasive(this.httpService.getPaths().GET_PHRINVASIVE, profileId + ""),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    updatedPhrInvasiveNonInvasive(phrAnswer: PhrAnswer): Promise<any> {

        console.log("phr answer response >>>>>>>>>>>" + JSON.stringify(phrAnswer));
        return this.httpService.httpPostPromise(this.httpService.getPaths().SET_PHRINVASIVE,
            JSON.stringify(phrAnswer), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                console.log("update Order response >>>>>>>>>>>" + JSON.stringify(data));
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }
    addonboardedprofile(onboardingUserVO: OnboardingUserVO): Promise<BaseResponse> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SET_ONBOARDEDCONSUMERLIST,
            JSON.stringify(onboardingUserVO), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }
    getOnboardingType(): Promise<OnboardingTypeResponse> {
        this.pocId = this.auth.userAuth.pocId;
        return this.httpService.httpGetPromise(this.httpService.getPaths().GETONBOARDINGTESTTYPE + "?pocId=" + this.pocId,
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getSearchedTests(search, empId): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GETSEARCHEDTESTS + "?search=" + search + "&doctorId=" + empId,
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getProfileSearchByMobile(mobile: string, pocId: number): Promise<RegistrationVO[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_PROFILE_BY_MOBILE, mobile, pocId),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    insertCustomPackageDetail(onboardingCustomPackage): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().INSERTCUSTOMPACKAGES,
            JSON.stringify(onboardingCustomPackage), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getOnboardingcount(request: DashBoardChartReq): Promise<DashBoardChartResp[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_ONBOARDING_COUNT,
            JSON.stringify(request), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getOnboardinguserdetails(pocId: number, fromSize: number, toSize: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ONBOARDING_USER_DETAILS, pocId, fromSize, toSize),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getRevenues(request: DashBoardChartReq): Promise<DashBoardChartResp[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_REVENUES,
            JSON.stringify(request), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getLabTests(getLabTestsRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GETLABTESTS, JSON.stringify(getLabTestsRequest),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    updatepaymentstatusForPackage(basketRequest: BasketRequest): Promise<any> {
        console.log("request" + JSON.stringify(basketRequest));
        let paymentResponse;
        return this.httpService.httpPostPromise(this.httpService.getPaths().INITIATE_PAYMENT, JSON.stringify(basketRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            paymentResponse = data;
            console.log("update Order response >>>>>>>>>>>" + JSON.stringify(paymentResponse));
            // if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
            return Promise.resolve(paymentResponse);
            //}
            // return reportResponse;
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(paymentResponse);
            // }
        });
    }
    // updateLabTests(updateLabTestRequest): Promise<any> {
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATELABTESTS, JSON.stringify(updateLabTestRequest),
    //         AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
    //             return Promise.resolve(data);
    //         }).catch((err) => {
    //             if (err) {
    //                 console.log(err);
    //                 return Promise.reject(err);
    //             }
    //         });
    // }
    // getDiagnosticAwsCognitoCredentials(userReport): Promise<ReportResponse> {
    //     let reportResponse: ReportResponse;
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_AWS_COGNITO_CREDENTIALS,
    //         JSON.stringify(userReport), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
    //             reportResponse = data;
    //             console.log("AWS cognito credentials >>>>>>>>>>>" + JSON.stringify(reportResponse));
    //             if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
    //                 return reportResponse;
    //             }
    //             return reportResponse;
    //         }).catch((err) => {
    //             if (err) {
    //                 console.log(err);
    //                 return reportResponse;
    //             }
    //         });
    // }
    // UpdateDiagnosticFileUrls(uploadFileStatusRequest): Promise<ReportResponse> {
    //     let reportResponse: ReportResponse;
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_DIAGNOSTICS_FILE_URLS,
    //         JSON.stringify(uploadFileStatusRequest), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
    //             reportResponse = data;
    //             if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
    //                 return reportResponse;
    //             }
    //             return reportResponse;
    //         }).catch((err) => {
    //             if (err) {
    //                 console.log(err);
    //                 return reportResponse;
    //             }
    //         });
    // }
    getFamilyDetails(profileId: number): Promise<RegistrationVO[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_FAMILY_DETAILS, profileId),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getPHRForProfileId(profileId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_PROFILE_DETAILS_BY_PROFILE_ID, profileId),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {

                console.log("profileVO kundan 2 >>>>>>>>>>>" + JSON.stringify(data));

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getPHRDetailsForProfileId(profileId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_PHR_DETAILS, profileId),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {

                /* console.log("phr >>>>>>>>>>>" + JSON.stringify(data));*/

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getUploadedReports(isFromReports: boolean, profileId: number, type: Array<number>, parentProfileId: number): Promise<UserReport[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_UPLOADED_REPORTS, profileId, type, parentProfileId),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                if (isFromReports) {
                    let reportData: any;
                    if (JSON.stringify(data) != '{}' && data.length > 0) {
                        reportData = [];
                        data.forEach(report => {
                            if (report.fileUrlList && report.fileUrlList.length > 1) {
                                report.fileUrlList.forEach(file => {
                                    let newReport = Object.assign({}, report)
                                    newReport.fileUrlList = [];
                                    newReport.fileUrlList.push(file)
                                    reportData.push(newReport);
                                });
                            } else {
                                reportData.push(report);
                            }
                        });
                    }
                    else {
                        reportData = data;
                    }

                    console.log("getUploadedReports: ", reportData);
                    return Promise.resolve(reportData);
                } else {
                    console.log("getUploadedReports: ");
                    console.log("getUploadedReports: ", data);
                    return Promise.resolve(data);
                }
            }).catch((err) => {

                console.log("getUploadedReports: ");
                console.log("getUploadedReports: ", err);
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getObboardingReport(profileId: number): Promise<UserReport> {
        // Setting the referenceId also to profileId to fetch user's onboarding report
        console.log('Profile ID inside onboarding service >>' + profileId);
        console.log('URL inside onboarding service >>' + this.httpService.getPaths().GET_ONBOARDING_REPORTS);
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ONBOARDING_REPORTS, profileId, profileId, 0),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getAreaOfInterest(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_AREA_OF_INTEREST,
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    updateAddress(updateAddressRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_ADDRESS,
            JSON.stringify(updateAddressRequest), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    updateProfile(registrationVO): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PROFILE,
            JSON.stringify(registrationVO), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    // updateFamilyMemberProfile(registrationVO): Promise<any> {
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_NEW_FAMILY_PROFILE,
    //         JSON.stringify(registrationVO), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
    //             return Promise.resolve(data);
    //         }).catch((err) => {
    //             if (err) {
    //                 console.log(err);
    //                 return Promise.reject(err);
    //             }
    //         });
    // }

    submitPhrDetails(submitPhrDetailsRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SUBMIT_PHR_DETAILS,
            JSON.stringify(submitPhrDetailsRequest), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getStateCityByPinCode(pinCode: any): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_STATE_CITY_BY_PINCODE, pinCode),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    // getLocation(empId: number, stateId: number, cityId: number): Promise<LocationModeResponse[]> {
    //     return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_EMP_LOCATION, empId, stateId, cityId),
    //         AppConstants.POZ_BASE_URL_INDEX).then((data) => {
    //             return Promise.resolve(data);
    //         }).catch((err) => {
    //             if (err) {
    //                 console.log(err);
    //                 return Promise.reject(err);
    //             }
    //         });
    // }
    getDoctorSearchedList(pocId, searchTerm): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GETDOCTORSEARCHLIST + "?pocId=" + pocId + "&searchTerm=" + searchTerm,
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getOnboardedUsersDatewise(fromdate, todate, pocId): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().DOWNLOADUSERS + "?fromdate=" + fromdate + "&todate=" + todate + "&pocId=" + pocId,
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    uploadOnboardingUsers(fileUrl, pocId, empId): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().UPLOAD_ONBOARDING_USERS, fileUrl, pocId, empId),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }


    getCentralOnboardingUserOrders(fromdate, toDate, status, from, size): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_CENTRAL_ONBOARDING_USERS_LIST, fromdate, toDate, status, from, size),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }
    getAssignCoupon(couponCode, profileId): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ASSIGN_COUPON, couponCode, profileId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getConfigCoupons(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_CONFIG_COUPONS,
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    userCofigCoupons(empId, fromDate, toDate, couponCode, mobileNo, from, size) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().USER_CONFIG_COUPONS, empId, fromDate, toDate, couponCode, mobileNo, from, size),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }


    updateUserStatus(requestBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_STATUS_AND_COMMEMTS_FOR_CENTRAL_ONBOARDING,
            JSON.stringify(requestBody), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
}

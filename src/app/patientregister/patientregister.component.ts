import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FileUtil } from '../base/util/file-util';
import { ToasterService } from '../layout/toaster/toaster.service';
import { SpinnerService } from '../layout/widget/spinner/spinner.service';
import { Address } from '../model/profile/address';
import { ProfileVisitedDetails } from '../model/reception/profilevisitedDetails';
import { ReceptionService } from '../reception/reception.service';
import { AuthService } from './../auth/auth.service';
import { Config } from './../base/config';
import { CommonUtil } from './../base/util/common-util';
import { ValidationUtil } from './../base/util/validation-util';
import { ReportResponse } from './../model/common/reportResponse';
import { ContactInfo } from './../model/profile/contactInfo';
import { CorporateDetails } from './../model/profile/corporatedetails';
import { OtpVo } from './../model/profile/otpVo';
import { ProfileDetailsVO } from './../model/profile/profileDetailsVO';
import { RegistrationResponseVo } from './../model/profile/registrationResponseVo';
import { RegistrationVO } from './../model/profile/registrationVO';
import { RelationshipObj } from './../model/profile/relationshipObj';
import { Relationship } from './../model/profile/relationships';
import { SelectedRegisteredProfile } from './../model/profile/selectedRegisteredProfile';
import { OnboardingService } from './../onboarding/onboarding.service';
import { PatientRegisterService } from './../patientregister/patientregister.service';

@Component({
  selector: 'patientregister-component',
  templateUrl: './patientregister.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [PatientRegisterService],
  styleUrls: ['./patientregister.style.scss']
})
export class PatientRegisterComponent implements OnInit {

  @Output() onRegisterNewUser = new EventEmitter<SelectedRegisteredProfile>();
  @Output() profileVisitedDetails = new EventEmitter<ProfileVisitedDetails>();
  @Input() isPatientFetch: boolean = false;
  @Input() isSBR: boolean = false;
  @Input() isFromAppReq: boolean = false;
  @Input() reqDetail: any = {};

  @Output("closeModel") closeModel = new EventEmitter<any>();

  errorMessages: Array<string>;
  isError: boolean;
  showMessage: boolean;
  errorMessage: Array<string>;
  alterrorMessage: Array<string>;
  altisError: boolean;
  portal: boolean = false;
  addMemberCheck: boolean = false;
  relationShipNo: number = 0;
  selectedProfileId: number;
  hsPrimaryIdentifier: boolean;
  hasTitle: boolean;
  memberAgeYears: number = null;
  memberAgeMonths: number = null;
  newMemberDate: Date;
  relationshipChoosen: boolean;
  memberAge: number;
  memberDate: Date;
  referral: string;
  isChoose: boolean = true;
  isGenderChoose: boolean = true;
  isGenSelect: boolean = true;
  startdate: Date;
  isSelected: boolean = false;    // toggle between submit and next button
  isAge: boolean = true;
  isDOB: boolean = false;
  isSent: boolean = false;
  isSent1: boolean = false;
  isActive: boolean = false;
  isError1: boolean;
  isIncompleteData: boolean = false;
  disableOptionalFeilds: boolean = false;
  isNewMemberAge: boolean = false;
  isNewMemberDOB: boolean = true;
  // isNumComplete: boolean = false;
  isFname: boolean;
  editFname: boolean;
  editLname: boolean;
  isLname: boolean;
  isEmail: boolean;
  isAltno: boolean;
  isGender: boolean;
  isDOB1: boolean;
  isAge1: boolean;
  isRef: boolean;
  isRef1: boolean;
  isReferral: boolean;
  isAlreadyregistered: boolean = true;
  isNewregistered: boolean;
  otpNotRequired: boolean = false;
  MAX_FILES_COUNT: number = 5;
  uploadFilesList: any[] = new Array();
  idProofsList: any[] = new Array();
  tempIdProofsList: any[] = new Array();
  checkAge: number;
  enableEmployeeReferral: boolean = false;
  hideSidenavUserMetrics: boolean = false;
  relationAltnoChange: RegistrationVO;

  datepickerOpts = {
    startDate: new Date(-2209008600000),
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  }

  registrationVOList: Array<RegistrationVO>;
  newFamilyMemberRelationShip: number = 0;
  selectedFamilyMem: boolean = false;
  selectedProfileVO: RegistrationVO;
  selfRegistered: RegistrationVO = new RegistrationVO();
  ParentProfile: RegistrationVO = new RegistrationVO();
  employeeCorporateId: string;
  corporateName: string;
  hasCheckBoxValidation: boolean;
  registrationResponseVo: RegistrationResponseVo;
  customResponse: ReportResponse;
  selectedRegisteredProfile: SelectedRegisteredProfile;
  familyMember: ProfileDetailsVO = new ProfileDetailsVO();
  relationShipNames: Array<RelationshipObj>;
  profileVisitedDetailsforDoctor: ProfileVisitedDetails = new ProfileVisitedDetails();
  validation: any;
  isTenAttended: boolean = false;
  otpVo: OtpVo;
  NotRegMobile: string;
  NotRegEmail: string;
  // relationShipStatus: boolean = false;;
  isEnterOtp: boolean = false;
  isEnterOtp1: boolean = false;
  ageYears: number = null;
  ageMonths: number = null;
  patientFirstNameSearchResults: any;
  patientFirstNameSelectTotal: any;
  patientLastNameSearchResults: any;
  patientLastNameSelectTotal: any;
  patientFirstNameHardReset: boolean = false;
  patientLastNameHardReset: boolean = false;
  titlesList: Array<string> = ['Mr', 'Miss', 'Mrs', 'Master', 'Baby', 'Baby of', 'Baby Boy', 'Baby Girl', 'Dr', 'Prof', 'Capt'];
  selectColumns: any[] = [
    {
      variable: 'fName',
      filter: 'text'
    },
    {
      variable: 'lName',
      filter: 'text'
    },
    {
      variable: 'contactInfo.mobile',
      filter: 'text'
    }
  ];
  tempNo = '0';
  tempData = '';
  hsSelectBoolean: boolean = true;
  emailPrimaryConsumerLogin: boolean = false;
  mandateAlertnateContactNo: boolean = false;
  vdcFirstname: boolean = true;
  vdcLastname: boolean = true;
  mandateEmail: boolean = false;
  optionalDOB: boolean = false;
  isFamilyMemGender: boolean = false;
  private emailModelChanged: Subject<string> = new Subject<string>();
  private emailSubscription: Subscription;
  debounceTime = 1000;
  nonlisFlow: boolean = false;
  lisPrimaryUser: boolean = false;
  lisUserList: Array<RegistrationVO>;
  lisSelfUser: RegistrationVO;
  lisIndex: number = 0;
  lisGender: boolean;
  lismemberDate: Date;
  lisScreen1: boolean = true;
  lisScreen2: boolean = false;
  lisScreen3: boolean = false;
  lisIsError: boolean = false;
  lisErrorMessages: Array<string>;
  lisNewUser: boolean = true;

  window = window;
  // isTemp: boolean;
  @ViewChild('patientRegistration', { static: false }) public modal: any;
  @ViewChild('xmobilex', { static: false }) mobElement: ElementRef;

  // tslint:disable-next-line:max-line-length
  constructor(private patientregisterservice: PatientRegisterService, private spinnerService: SpinnerService,
    private authService: AuthService, private receptionService: ReceptionService, private common: CommonUtil,
    private toast: ToasterService, private fileUtil: FileUtil,
    private router: Router, private onboardingService: OnboardingService, private _validation: ValidationUtil
  ) {
    this.isEmail = false;
    this.isAltno = false;
    this.isGender = false;
    this.isFname = false;
    this.editFname = true;
    this.editLname = true;
    this.disableOptionalFeilds = false;
    this.hsPrimaryIdentifier = false;
    this.hasTitle = false;
    this.isLname = false;
    this.isDOB1 = false;
    this.isAge1 = false;
    this.isAlreadyregistered = true;
    this.isError1 = false;
    this.isNewregistered = false;
    this.validation = _validation;

    if (Config.portal && Config.portal.customizations && Config.portal.customizations.emailPrimaryConsumerLogin) {
      this.emailPrimaryConsumerLogin = Config.portal.customizations.emailPrimaryConsumerLogin;
      this.mandateEmail = true;
    }

    if (Config.portal && Config.portal.customizations && Config.portal.customizations.mandateAlertnateContactNo) {
      this.mandateAlertnateContactNo = Config.portal.customizations.mandateAlertnateContactNo;
    }

    if (Config.portal && Config.portal.customizations && Config.portal.customizations.dobOptional) {
      this.optionalDOB = Config.portal.customizations.dobOptional;
    }

    if (Config.portal && Config.portal.customizations && Config.portal.customizations.enableEmployeeReferral) {
      this.enableEmployeeReferral = Config.portal.customizations.enableEmployeeReferral;
    }

    if (Config.portal && Config.portal.customizations && Config.portal.customizations.enableLisPrimaryUserSelection) {
      this.lisPrimaryUser = Config.portal.customizations.enableLisPrimaryUserSelection;
    }

    this.hideSidenavUserMetrics = Config.portal.customizations && Config.portal.customizations.hideSidenavUserMetrics;
  }

  ngOnInit() {
    var reset = this;
    this.resetAllFields();
    this.emailSubscription = this.emailModelChanged
      .pipe(
        debounceTime(this.debounceTime),
      ).subscribe((email) => {
        this.onEmailChange(email);
      });

    if (this.isFromAppReq && this.reqDetail && this.reqDetail.patientProfileDetails.contactInfo.mobile) {
      this.onNumberChange(this.reqDetail.patientProfileDetails.contactInfo.mobile)
    }
  }

  emailInputChanged(email) {
    this.emailModelChanged.next(email);
  }

  ngOnDestroy(): void {
    this.emailSubscription.unsubscribe();
  }

  onTitleChange1(event) {
    this.familyMember.title = event;

    // gender validation for vdc
    if (this.mandateAlertnateContactNo) {
      if (this.familyMember.title == "Mr" || this.familyMember.title == "Master" || this.familyMember.title == "Baby Boy") {
        this.familyMember.gender = "Male";
        this.isFamilyMemGender = true;
      }
      else if (this.familyMember.title == "Mrs" || this.familyMember.title == "Miss" || this.familyMember.title == "Baby Girl") {
        this.familyMember.gender = "Female";
        this.isFamilyMemGender = true;
      }
      else {
        this.isFamilyMemGender = false;
        this.familyMember.gender = null;
      }
    }
  }

  onTitleChange(event) {
    this.selfRegistered.title = event;

    // gender validation for vdc
    if (this.mandateAlertnateContactNo) {
      if (this.selfRegistered.title == "Mr" || this.selfRegistered.title == "Master" || this.selfRegistered.title == "Baby Boy") {
        this.selfRegistered.gender = "Male";
        this.isGender = true;
      }
      else if (this.selfRegistered.title == "Mrs" || this.selfRegistered.title == "Miss" || this.selfRegistered.title == "Baby Girl") {
        this.selfRegistered.gender = "Female";
        this.isGender = true;
      }
      else {
        this.isGender = false;
        this.selfRegistered.gender = null;
      }
    }
  }

  checkAgeSelection(index: number) {
    if (index == 0) {
      this.isAge = false;
      this.isDOB = true;
      this.isAge1 = false;
      this.isDOB1 = false;
      this.selfRegistered.providedOnlyAge = false;
      this.memberDate = new Date(this.common.getDobFromAge(this.ageYears, this.ageMonths));
    }
    else {
      this.isDOB = false;
      this.isAge = true;
      this.isAge1 = false;
      this.isDOB1 = false;
      this.selfRegistered.providedOnlyAge = true;
      this.ageYears = null;
      this.ageMonths = null;
      if (isNaN(parseInt(this.common.getAgeForall(this.memberDate.getTime()).split(",")[0]))) {
        this.ageYears = 0;
      } else {
        this.ageYears = parseInt(this.common.getAgeForall(this.memberDate.getTime()).split(",")[0]);
      }
      if (isNaN(parseInt(this.common.getAgeForall(this.memberDate.getTime()).split(",")[1]))) {
        this.ageMonths = 0;
      } else {
        this.ageMonths = parseInt(this.common.getAgeForall(this.memberDate.getTime()).split(",")[1]);
      }
    }
  }
  checkAgeYearvalidation(ageYear) {
    this.ageYears = ageYear;

    if (this.common.getDobFromAge(this.ageYears, 0) < -2209008600000) {
      this.ageYears = parseInt(this.common.getAgeForall(-2209008600000));
      this.ageMonths = null;
    } else {
      this.ageYears = ageYear;
    }

  }

  checkAgeMonthvalidation(ageMonth) {
    if (ageMonth > 12) {
      this.ageMonths = 12;
    }
  }

  checkNewMemberAgeSelection(index: number) {
    if (index == 0) {
      this.isNewMemberAge = false;
      this.isNewMemberDOB = true;
      this.familyMember.providedOnlyAge = false;
      if (this.common.getDobFromAge(this.ageYears, this.ageMonths) < -2209008600000) {
        this.ageYears = parseInt(this.common.getAgeForall(-2209008600000));
        this.ageMonths = 0;
        this.newMemberDate = new Date(this.common.getDobFromAge(this.ageYears, this.ageMonths));

      } else {
        this.newMemberDate = new Date(this.common.getDobFromAge(this.ageYears, this.ageMonths));
      }

    }
    else {
      this.isNewMemberDOB = false;
      this.isNewMemberAge = true;
      this.familyMember.providedOnlyAge = true;
      this.ageYears = null;
      this.ageMonths = null;
      if (this.newMemberDate) {
        if (isNaN(parseInt(this.common.getAgeForall(this.newMemberDate.getTime()).split(",")[0]))) {
          this.ageYears = 0;
        } else {
          this.ageYears = parseInt(this.common.getAgeForall(this.newMemberDate.getTime()).split(",")[0]);
        }

        if (isNaN(parseInt(this.common.getAgeForall(this.newMemberDate.getTime()).split(",")[1]))) {
          this.ageMonths = 0;
        } else {
          this.ageMonths = parseInt(this.common.getAgeForall(this.newMemberDate.getTime()).split(",")[1]);
        }
      }
    }
  }

  validateEmailId(email: string) {
    // if (!email || email == undefined || email == null || email.length <= 5) {
    //   return false;
    // }
    // var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
    // return re.test(email);
    return true
  }

  resetError() {
    this.isError = false;
    this.showMessage = false;
    this.errorMessages = new Array();
  }

  resetAltError() {
    this.altisError = false;
    this.alterrorMessage = new Array();
  }

  onAltNumberChange() {
    this.resetAltError();
    if (this.selfRegistered.contactInfo.alternateMobile && this.selfRegistered.contactInfo.alternateMobile.length == 10) {
      let re = /\d{10}/;
      if (!re.test(this.selfRegistered.contactInfo.alternateMobile)) {
        this.altisError = true;
        this.alterrorMessage = new Array();
        this.alterrorMessage[0] = "Enter a valid mobile number";
        return;
      }
    }
  }

  onNumberChange(mobileNo: any): void {
    this.resetError();
    if (this.selfRegistered.contactInfo.mobile && this.selfRegistered.contactInfo.mobile.length == 10) {
      let re = /\d{10}/;
      if (!re.test(this.selfRegistered.contactInfo.mobile)) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessages = new Array();
        this.errorMessages[0] = "Enter a valid mobile number";
        return;
      }
    }
    this.reset();
    $('.patient-registerpopup').css({ 'height': '100vh' });
    // console.log("=======>mobileNumber " + mobileNo)
    let tempSelf = this.selfRegistered;
    if (!this.selfRegistered.contactInfo.mobile) {
      this.tempNo = '';
      this.resetAllFields();
    }
    if (mobileNo.length < 10) {
      this.isTenAttended = false;
      if (tempSelf.fName && tempSelf.fName.trim().length > 0) {
        this.tempNo = mobileNo;
        this.resetAllFields();
        this.hsSelecteRefresh();
      }
      return;
    }

    if (mobileNo.length == 10) {
      this.isTenAttended = true;
      this.tempNo = mobileNo;
      this.vdcFirstname = true;
      this.vdcLastname = true;
      this.nonlisFlow = false;
      this.resetLisFlow();
      this.corporateName = '';
      this.employeeCorporateId = '';
      this.spinnerService.start();
      this.patientregisterservice.getRegisteredUser(mobileNo).then(usersList => {
        this.spinnerService.stop();

        if (this.lisPrimaryUser) {
          if (usersList && usersList.length > 0) {
            if (usersList[0].selectPrimaryUser == true) {
              this.lisUserList = usersList;
              this.lisUserList[0].selectPrimaryUser = false;
              (<any>$('#lisUserSelection')).modal('show');
            } else
              this.nonlisFlow = true;
          }
          else
            this.nonlisFlow = true;
        }
        if (!this.lisPrimaryUser || this.nonlisFlow) {
          this.NotRegMobile = mobileNo;
          this.registrationVOList = usersList;
          this.isAlreadyregistered = (this.registrationVOList && this.registrationVOList.length > 0 && this.registrationVOList[0].profileId > 0);
          this.setPatientDetails();
          this.hsSelecteRefresh();
        }
      });
    }
  }

  onEmailChange(email: any) {
    this.reset();
    $('.patient-registerpopup').css({ 'height': '100vh' });
    let tempSelf = this.selfRegistered;
    if (!this.validateEmailId(email)) {
      this.tempNo = '';
      this.resetAllFields();
      this.hsSelecteRefresh();
      return;
    }

    this.corporateName = '';
    this.employeeCorporateId = '';
    console.log('Searching for email address ' + email);
    this.patientregisterservice.getRegisteredUserByEmail(email).then(usersList => {
      console.log('Results from the service call are ', usersList);
      this.NotRegEmail = email;
      this.registrationVOList = usersList;
      this.isAlreadyregistered = (this.registrationVOList && this.registrationVOList.length > 0 && this.registrationVOList[0].profileId > 0);
      this.setPatientDetails();
      this.hsSelecteRefresh();
    });
  }

  setPatientDetails() {
    if (this.registrationVOList != null && this.registrationVOList != undefined && this.registrationVOList.length > 0) {
      this.isError = false;
      this.isError1 = false;
      this.showMessage = false;
      let index: number = 0;
      this.relationShipNames = new Array<RelationshipObj>();
      this.registrationVOList.forEach(element => {
        if (this.selectedProfileId && this.selectedProfileId == element.profileId) {
          this.relationShipNo = element.relationShip;
          // this.relationShipStatus = true;
        }
        this.relationShipNames[index] = new RelationshipObj();
        this.relationShipNames[index].profileId = element.profileId;
        this.relationShipNames[index].relationName = element.fName;
        this.relationShipNames[index].isPrivilegeUser = (element.privilegeType && element.privilegeType.includes(1));

        if (element.relationShip == Relationship.SELF) {
          this.ParentProfile = element;
          this.relationShipNames[index].relationId = Relationship.SELF;
          this.relationShipNames[index].relationshipType = "( Self )";
        }
        else if (element.relationShip == Relationship.SPOUSE) {
          this.relationShipNames[index].relationId = Relationship.SPOUSE;
          this.relationShipNames[index].relationshipType = "( Spouse )";
        }
        else if (element.relationShip == Relationship.MOTHER) {
          this.relationShipNames[index].relationId = Relationship.MOTHER;
          this.relationShipNames[index].relationshipType = "( Mother )";
        }
        else if (element.relationShip == Relationship.FATHER) {
          this.relationShipNames[index].relationId = Relationship.FATHER;
          this.relationShipNames[index].relationshipType = "( Father )";
        }
        else if (element.relationShip == Relationship.DAUGHTER) {
          this.relationShipNames[index].relationId = Relationship.DAUGHTER;
          this.relationShipNames[index].relationshipType = "( Daughter )";
        }
        else if (element.relationShip == Relationship.SON) {
          this.relationShipNames[index].relationId = Relationship.SON;
          this.relationShipNames[index].relationshipType = "( Son )";
        }
        else if (element.relationShip == Relationship.MOTHERINLAW) {
          this.relationShipNames[index].relationId = Relationship.MOTHERINLAW;
          this.relationShipNames[index].relationshipType = "( MotherInLaw )";
        }
        else if (element.relationShip == Relationship.FATHERINLAW) {
          this.relationShipNames[index].relationId = Relationship.FATHERINLAW;
          this.relationShipNames[index].relationshipType = "( FatherInLaw )";
        }
        else if (element.relationShip == Relationship.SIBLING) {
          this.relationShipNames[index].relationId = Relationship.SIBLING;
          this.relationShipNames[index].relationshipType = "( Sibling )";
        }
        else if (element.relationShip == Relationship.GRANDMOTHER) {
          this.relationShipNames[index].relationId = Relationship.GRANDMOTHER;
          this.relationShipNames[index].relationshipType = "( GrandMother )";
        }
        else if (element.relationShip == Relationship.GRANDFATHER) {
          this.relationShipNames[index].relationId = Relationship.GRANDFATHER;
          this.relationShipNames[index].relationshipType = "( GrandFather )";
        } else if (element.relationShip == Relationship.DAUGHTERINLAW) {
          this.relationShipNames[index].relationId = Relationship.DAUGHTERINLAW;
          this.relationShipNames[index].relationshipType = "( DaughterInLaw )";
        } else if (element.relationShip == Relationship.SONINLAW) {
          this.relationShipNames[index].relationId = Relationship.SONINLAW;
          this.relationShipNames[index].relationshipType = "( SonInLaw )";
        } else if (element.relationShip == Relationship.Others) {
          this.relationShipNames[index].relationId = Relationship.Others;
          this.relationShipNames[index].relationshipType = "( Others )";
        } else {
          this.relationShipNames[index].relationId = Relationship.SELF;
          this.relationShipNames[index].relationshipType = "( Self )";
          this.registrationVOList[index].relationShip = 0;
        }
        index++;
      });
      if (this.registrationVOList) {
        if (this.relationShipNo > 0) {
          for (let i = 0; i < this.registrationVOList.length; i++) {
            if (this.selectedProfileId == this.registrationVOList[i].profileId) {
              this.selfRegistered = this.registrationVOList[i];
              let email = '';
              (this.selfRegistered.contactInfo.email != null && this.selfRegistered.contactInfo.email != undefined) ? email = this.selfRegistered.contactInfo.email : email = '';
              // if (this.selfRegistered.title != undefined)
              // this.selfRegistered.title = (this.registrationVOList[i].title.replace(/[.]/g, '')).trim()
              this.selfRegistered.contactInfo = JSON.parse(JSON.stringify(this.registrationVOList[0].contactInfo));
              this.selfRegistered.contactInfo.email = email;
              if (this.selfRegistered.title) {
                this.hasTitle = true;
              }
            }
          }
        }
        else if (this.relationShipNo == 0) {
          this.selfRegistered = this.registrationVOList[0];
          if (this.selectedFamilyMem == false) {
            this.selectedProfileId = this.registrationVOList[0].profileId
          }
          // if (this.selfRegistered.title != undefined)
          //   this.selfRegistered.title = (this.registrationVOList[0].title.replace(/[.]/g, '')).trim()
          if (this.selfRegistered.title) {
            this.hasTitle = true;
          }
        }
        if (this.selfRegistered) {
          if (this.selfRegistered && this.selfRegistered.fName) {
            this.tempData = this.selfRegistered.fName;
          }
          if (this.selfRegistered &&
            this.selfRegistered.corporateDetailsList &&
            this.selfRegistered.corporateDetailsList[0] &&
            this.selfRegistered.corporateDetailsList[0].employeeCorporateId
          ) {
            this.employeeCorporateId = this.selfRegistered.corporateDetailsList[0].employeeCorporateId;
          }

          if (this.selfRegistered &&
            this.selfRegistered.corporateDetailsList &&
            this.selfRegistered.corporateDetailsList[0] &&
            this.selfRegistered.corporateDetailsList[0].idProofsList &&
            this.selfRegistered.corporateDetailsList[0].idProofsList.length > 0
          ) {
            this.toDisplayIdProofsList();
            this.employeeCorporateId = this.selfRegistered.corporateDetailsList[0].employeeCorporateId;
          }
          if (this.selfRegistered &&
            this.selfRegistered.corporateDetailsList &&
            this.selfRegistered.corporateDetailsList[0] &&
            this.selfRegistered.corporateDetailsList[0].corporateName
          ) {
            this.corporateName = this.selfRegistered.corporateDetailsList[0].corporateName;
          }
          //optional dob for yoda
          if (this.selfRegistered.dob != undefined) {
            if (isNaN(parseInt(this.common.getAgeForall(this.selfRegistered.dob).split(",")[0]))) {
              this.ageYears = 0
            } else {
              this.ageYears = parseInt(this.common.getAgeForall(this.selfRegistered.dob).split(",")[0]);
            }
            if (isNaN(parseInt(this.common.getAgeForall(this.selfRegistered.dob).split(",")[1]))) {
              this.ageMonths = 0
            } else {
              this.ageMonths = parseInt(this.common.getAgeForall(this.selfRegistered.dob).split(",")[1]);
            }
          } else {
            this.ageYears = null;
            this.ageMonths = null;
          }

          if (this.selfRegistered.fName != null && this.selfRegistered.fName != undefined && this.selfRegistered.fName != "") {
            this.isFname = true;

          }
          // if (this.selfRegistered.lName != null && this.selfRegistered.lName != undefined && this.selfRegistered.lName != "") {
          this.isLname = true;
          // }
          // dob optional 
          if (!this.optionalDOB) {
            if (this.selfRegistered.dob != null && this.selfRegistered.dob != undefined && this.selfRegistered.dob != 0) {
              this.isDOB1 = true;
            }
            if (this.ageYears != null && this.ageYears != undefined && this.ageMonths != null && this.ageMonths != undefined) {
              this.isAge1 = true;
            }
          }
          else {
            this.isAge1 = true;
            this.isDOB1 = true;
          }

          // if (this.selfRegistered.contactInfo.email != "" && this.selfRegistered.contactInfo.email != undefined && this.selfRegistered.contactInfo.email != null) {
          this.isEmail = true;
          if (this.mandateAlertnateContactNo) {
            if (this.selfRegistered.contactInfo.alternateMobile == "" || this.selfRegistered.contactInfo.alternateMobile == null
              || this.selfRegistered.contactInfo.alternateMobile == undefined || this.selfRegistered.contactInfo.alternateMobile.length < 10) {
              this.isAltno = false;
            }
            else
              this.isAltno = true;
          }
          else
            this.isAltno = true;
          // }
          if (this.selfRegistered.gender != null && this.selfRegistered.gender != undefined && this.selfRegistered.gender != "") {
            if (this.selfRegistered.gender != "Male" && this.selfRegistered.gender != "Female" && this.selfRegistered.gender != "Others") {
              this.selfRegistered.gender = this.selfRegistered.gender[0].toUpperCase() + this.selfRegistered.gender.slice(1, this.selfRegistered.gender.length).toLowerCase()
            }
            this.isGender = true;
          }
          if (this.selfRegistered.referralCode != null && this.selfRegistered.referralCode != undefined && this.selfRegistered.referralCode != "") {
            this.isRef1 = true;
          }
          if ((this.isFname != true || this.isDOB1 != true || this.isAge1 != true || this.isGender != true || this.isAltno != true)) {
            if (this.disableOptionalFeilds != true) {
              this.isError = false;
              this.isAge1 = false;
              this.isDOB1 = false;
              this.isRef = true;
              this.isRef1 = true;
              this.isAltno = false;
              this.isAlreadyregistered = true;
              this.isIncompleteData = true;
              this.errorMessage = new Array();
              this.errorMessage[0] = 'Please fill all mandatory fields';
              this.isError1 = true;
            }
            this.isSelected = true;
          }
          else {
            this.isIncompleteData = false;
            this.isSelected = true;
            this.isError = false;
            this.isActive = false;
            this.isAlreadyregistered = false;
            this.isRef = true;
            this.isRef1 = true;
          }

          this.selectedProfileVO = this.selfRegistered;
          this.getRevenueDetails();
        }
      }
      this.isAlreadyregistered = (this.registrationVOList && this.registrationVOList.length > 0 && this.registrationVOList[0].fName != "");
      if (this.selfRegistered.title == undefined || this.selfRegistered.title == "undefined") {
        this.UpdateRegisteredUser();
      }
      // this.hsSelecteRefresh();
    }

    else {
      this.resetAllFields();
      if (this.emailPrimaryConsumerLogin) {
        this.selfRegistered.contactInfo.email = this.NotRegEmail;
      } else {
        this.selfRegistered.contactInfo.mobile = this.NotRegMobile;
      }
      this.isError = true;
      this.showMessage = true;
      this.errorMessages = new Array();
      this.errorMessages[0] = "Not registered";
    }

  }
  toDisplayIdProofsList() {
    this.idProofsList = new Array<string>();
    this.tempIdProofsList = new Array<string>();
    this.idProofsList = this.selfRegistered.corporateDetailsList[0].idProofsList;
    this.selfRegistered.corporateDetailsList[0].idProofsList = new Array<string>();
    this.idProofsList.forEach(proof => {
      let IdProofType = proof.split('/')[0];
      let IdProofUUID = proof.split('/')[1];
      this.authService.getTempUrlFiles(this.ParentProfile.profileId, IdProofType, IdProofUUID).then(response => {
        let framedUrls = { "framedUrl": '', "displayUrl": '' };
        framedUrls.framedUrl = proof;
        framedUrls.displayUrl = response.data;
        this.tempIdProofsList.push(framedUrls);
      })
    })
  }

  hsSelecteRefresh() {
    this.hsSelectBoolean = false;
    setTimeout(() => { this.hsSelectBoolean = true; }, 10);
  }

  reset() {
    let tempSelf = this.selfRegistered;
    this.patientFirstNameSearchResults = null;
    this.patientFirstNameSelectTotal = 0;
    this.patientLastNameSearchResults = null;
    this.patientLastNameSelectTotal = 0;
    this.patientFirstNameHardReset = false;
    this.patientLastNameHardReset = false;
    if (!this.selfRegistered.contactInfo
      || (!this.emailPrimaryConsumerLogin && !this.selfRegistered.contactInfo.mobile)
      || (this.emailPrimaryConsumerLogin && this.selfRegistered.contactInfo.email)) {
      this.selfRegistered = new RegistrationVO();
    }
    if (tempSelf.fName && tempSelf.fName.trim().length > 0) {
      // this.tempNo = mobileNo;
      // this.resetAllFields();
      this.hsSelecteRefresh();
    }
    // $("hs-select>div>input").val("");
  }

  onEditRegisterUser(selectedRegisteredProfile: SelectedRegisteredProfile) {
    this.selectedRegisteredProfile = selectedRegisteredProfile;
  }

  PatientFirstNameSearchTrigger(searchTerm: string): void {
    this.disableOptionalFeilds = true;
    this.searchProduct(searchTerm, 1);
    this.selfRegistered.fName = searchTerm;
  }
  PatientLastNameSearchTrigger(searchTerm: string): void {
    this.disableOptionalFeilds = true;
    this.searchProduct(searchTerm, 2);
    this.selfRegistered.lName = searchTerm;
  }

  searchProduct(searchTerm: string, searchCriteria) {
    let searchName = searchTerm;
    // disabled name search for vdc
    if (this.mandateAlertnateContactNo)
      return;

    if (searchName.length > 2 && this.tempData != searchName) {
      // this.selfRegistered = new RegistrationVO();
      this.patientregisterservice.getRegisteredUserByName(searchName).then(response => {
        if (searchCriteria == 1) {
          this.patientFirstNameSearchResults = response;
          this.patientFirstNameSelectTotal = response.length;
        }
        else if (searchCriteria == 2) {
          this.patientLastNameSearchResults = response;
          this.patientLastNameSelectTotal = response.length;
        }
      });
    }
  }

  selectTrigger(selectedName: RegistrationVO): void {
    this.reset();
    this.patientFirstNameHardReset = true;
    this.patientLastNameHardReset = true;
    this.patientFirstNameSelectTotal = 1;
    this.patientLastNameSelectTotal = 1;
    if (this.selfRegistered.fName) {
      this.editFname = false;
    }
    else {
      this.editLname = false;
    }
    this.selfRegistered = new RegistrationVO()
    this.selfRegistered = selectedName;
    this.selectedFamilyMem = true;
    this.selectedProfileId = selectedName.profileId;
    this.selfRegistered.contactInfo.mobile = this.selfRegistered.contactInfo.mobile;
    if (!this.emailPrimaryConsumerLogin && this.selfRegistered.contactInfo.mobile != null && this.selfRegistered.contactInfo.mobile != undefined && this.selfRegistered.contactInfo.mobile != "") {
      this.hsPrimaryIdentifier = true;
    } else if (this.emailPrimaryConsumerLogin && this.selfRegistered.contactInfo.email != null && this.selfRegistered.contactInfo.email != undefined && this.selfRegistered.contactInfo.email != "") {
      this.hsPrimaryIdentifier = true;
    }
    if (this.selfRegistered.contactInfo.mobile.length > 9) {
      this.isTenAttended = true;
      this.onNumberChange(this.selfRegistered.contactInfo.mobile);
    }
  }


  getRevenueDetails() {
    if (!this.hideSidenavUserMetrics) {
      this.receptionService.getRevenueDetailsForDoctor(this.selfRegistered.relationShipId, this.selfRegistered.profileId, this.authService.userAuth.pocId).then(response => {
        this.profileVisitedDetailsforDoctor = response;
      });
      $('.patient-registerpopup').css({ 'height': '100vh' });
    }
  }

  registerNewUser(isValid: boolean): void {
    this.isError1 = false;
    if ((this.errorMessage && this.errorMessage[0] == "Enter a valid mobile number") || this.altisError) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.altisError ? this.errorMessage[0] = "Enter valid alternate mobile number" : this.errorMessage[0] = "Enter a valid mobile number";
      return;
    }
    if (this.emailPrimaryConsumerLogin && !this.validateEmailId(this.selfRegistered.contactInfo.email)) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid email address";
      return;
    } else if (!this.selfRegistered.contactInfo.mobile || this.selfRegistered.contactInfo.mobile.length < 9 || isNaN(Number(this.selfRegistered.contactInfo.mobile))) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter a valid mobile number";
      return;
    }

    if (this.selfRegistered.title == undefined || this.selfRegistered.title == "undefined" || this.selfRegistered.title == null || this.selfRegistered.title == "") {
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Please select title';
      this.isError1 = true;
      return;
    }

    if (this.selfRegistered.fName == null || this.selfRegistered.fName == undefined || this.selfRegistered.fName == "") {
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Please enter a valid first name';
      this.isError1 = true;
      return;
    }

    if (this.selfRegistered.gender == undefined && this.isGenSelect == true) {
      this.isGenSelect = false;
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Please select a valid gender';
      this.isError1 = true;
      return;
    }

    if (this.mandateEmail && (!this.selfRegistered.contactInfo.email || this.selfRegistered.contactInfo.email.length == 0)) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid email address";
      return;
    } else if (this.selfRegistered.contactInfo.email && this.selfRegistered.contactInfo.email.length > 0 && !this.validateEmailId(this.selfRegistered.contactInfo.email)) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid email address";
      return;
    }

    if (!this.isGenSelect) {
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Please select a valid gender';
      this.isError1 = true;
      return;
    }
    // this.selfRegistered.otpNotRequired = true;
    if (this.selfRegistered.otpNumber == undefined || this.selfRegistered.otpNumber == null) {
      this.selfRegistered.otpNotRequired = true;
    }
    if ((!this.emailPrimaryConsumerLogin && this.isTenAttended == false)
      || (this.selfRegistered.contactInfo && this.selfRegistered.contactInfo.mobile &&
        (this.selfRegistered.contactInfo.mobile.length < 9 || isNaN(Number(this.selfRegistered.contactInfo.mobile))))) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid mobile number";
      this.showMessage = true;
      return;
    }

    if ((this.mandateAlertnateContactNo && (!this.selfRegistered.contactInfo.alternateMobile
      || this.selfRegistered.contactInfo.alternateMobile == "" || this.selfRegistered.contactInfo.alternateMobile.length < 10
      || !this._validation.onlyNumbers(this.selfRegistered.contactInfo.alternateMobile)))
      || (this.selfRegistered.contactInfo.alternateMobile != "" && this.selfRegistered.contactInfo.alternateMobile != null
        && this.selfRegistered.contactInfo.alternateMobile != undefined && this.selfRegistered.contactInfo.alternateMobile.length < 10)) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid alternate mobile number";
      this.showMessage = true;
      return;
    }

    if (this.optionalDOB) {
      this.selfRegistered.dob = null;
      if (this.isDOB && this.memberDate != null && this.memberDate != undefined) {
        if (this.memberDate.getTime() != this.common.convertOnlyDateToTimestamp(new Date()))
          this.selfRegistered.dob = this.memberDate.getTime();
      }

      if (this.isAge && ((this.ageYears != null && this.ageYears != undefined) || (this.ageMonths != undefined && this.ageMonths != null))) {
        this.ageYears = this.ageYears != null ? +this.ageYears : 0;
        this.ageMonths = this.ageMonths != null ? +this.ageMonths : 0;
        if (this.ageYears != 0 || this.ageMonths != 0)
          this.selfRegistered.dob = this.common.getDobFromAge(this.ageYears, this.ageMonths);
      }
    }


    if (!this.optionalDOB) {
      if (this.isAge) {
        if (this.ageYears == 0 && this.ageMonths == 0) {
          this.isError1 = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please enter a valid age or DOB";
          this.showMessage = true;
          return;
        } else if (this.ageYears == null && this.ageMonths == null) {
          this.isError1 = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please enter a valid age or DOB";
          this.showMessage = true;
          return;
        } else {
          this.selfRegistered.dob = this.common.getDobFromAge(this.ageYears, this.ageMonths);
        }
      }

      if (this.isDOB) {
        if (this.memberDate == null) {
          this.isError1 = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please enter a valid age or DOB";
          this.showMessage = true;
        } else {
          this.selfRegistered.dob = this.memberDate.getTime();
        }
      }
    }

    if (this.isSBR == true) {
      this.checkAge = parseInt(this.common.getAge(this.selfRegistered.dob).split(",")[0]);
      if (this.checkAge < 13) {
        alert("You are not eligible for symptom based advices because your age is below 13");
        return;
      }
    }
    if (!isValid) {
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Please fill all mandatory fields';
      this.isError1 = true;
      return;
    }

    this.selfRegistered.updateEmail = false;
    this.selfRegistered.updateMobile = false;
    if (!this.selfRegistered.source || this.selfRegistered.source == 0) {
      this.selfRegistered.source = 3;
    }
    this.selfRegistered.loginType = 4;
    this.selfRegistered.portal = true;
    this.selfRegistered.pocId = this.authService.userAuth.pocId;

    if (((this.router.url).toString().split("/").indexOf("reception") > -1)) {
      this.selfRegistered.doctorId = parseInt((this.router.url).toString().split("/")[4]);
    }

    this.patientregisterservice.registration(this.selfRegistered).then(response => {
      this.registrationResponseVo = response;
      if (response != undefined && response != null && response.statusCode != 406 && response.statusCode != 409 && response.statusCode != 500) {

        let selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
        selectedRegisteredProfile.selfProfile = this.registrationResponseVo;
        selectedRegisteredProfile.selectedProfile = this.registrationResponseVo;
        this.onRegisterNewUser.emit(selectedRegisteredProfile);
        this.errorMessage = new Array();
        this.errorMessage[0] = response.statusMessage;
        this.isError1 = false; //successfully created
        this.resetAllFields();
        // (<any>$('#registerPatientModal')).modal('hide');
        this.closeModel.emit();
        alert(response.statusMessage);

      }
      else {
        this.isError1 = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = response.statusMessage;
      }
    });
  }


  updateUser(isValid: boolean): void {
    if (this.mandateEmail && (!this.selfRegistered.contactInfo.email || this.selfRegistered.contactInfo.email.length == 0)) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid email address";
      return;
    } else if (this.selfRegistered.contactInfo.email && this.selfRegistered.contactInfo.email.length > 0 && !this.validateEmailId(this.selfRegistered.contactInfo.email)) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid email address";
      return;
    }
    if ((this.errorMessage && this.errorMessage[0] == "Enter a valid mobile number") || this.altisError) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.altisError ? this.errorMessage[0] = "Enter valid alternate mobile number" : this.errorMessage[0] = "Enter a valid mobile number";
      return;
    }
    if ((this.mandateAlertnateContactNo && (!this.selfRegistered.contactInfo.alternateMobile || this.selfRegistered.contactInfo.alternateMobile == "" || this.selfRegistered.contactInfo.alternateMobile.length < 10))
      || (this.selfRegistered.contactInfo.alternateMobile != "" && this.selfRegistered.contactInfo.alternateMobile != null && this.selfRegistered.contactInfo.alternateMobile != undefined && this.selfRegistered.contactInfo.alternateMobile.length < 10)) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid alternate mobile number";
      this.showMessage = true;
      return;
    }
    if (this.selfRegistered.relationShip > 0 && !this.isChoose) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Select the relationship";
      return
    }

    if (this.optionalDOB) {
      this.selfRegistered.dob = null;
      if (this.isDOB && this.memberDate != null && this.memberDate != undefined) {
        if (this.memberDate.getTime() != this.common.convertOnlyDateToTimestamp(new Date()))
          this.selfRegistered.dob = this.memberDate.getTime();
      }

      if (this.isAge && ((this.ageYears != null && this.ageYears != undefined) || (this.ageMonths != undefined && this.ageMonths != null))) {
        this.ageYears = this.ageYears != null ? +this.ageYears : 0;
        this.ageMonths = this.ageMonths != null ? +this.ageMonths : 0;
        if (this.ageYears != 0 || this.ageMonths != 0)
          this.selfRegistered.dob = this.common.getDobFromAge(this.ageYears, this.ageMonths);
      }
    }

    if (!this.optionalDOB) {
      if (this.isAge) {
        if (this.ageYears == 0) {
          this.isError1 = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please enter a valid age or DOB";
          this.showMessage = true;
          return;
        }

        if (this.ageYears == null && this.ageMonths == null) {
          this.isError1 = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please enter a valid age or DOB";
          this.showMessage = true;
          return;
        }
        else
          this.selfRegistered.dob = this.common.getDobFromAge(this.ageYears, this.ageMonths);
      }
      else if (this.isDOB) {
        this.ageYears = null;
        this.ageMonths = null;
        this.selfRegistered.dob = this.memberDate.getTime();
      }
      else {
        this.ageYears = null;
        this.ageMonths = null;
        this.selfRegistered.dob = null;
      }
    }
    if (this.isSBR == true) {
      this.checkAge = parseInt(this.common.getAge(this.selfRegistered.dob).split(",")[0]);
      if (this.checkAge < 13) {
        alert("You are not eligible for symptom based advices as your age is below 13");
        return;
      }
    }
    if (!isValid) {
      this.errorMessage = new Array();
      this.isError1 = true;
      this.errorMessage[0] = "Please fill all mandatory fields";
      return;
    }


    if ((this.selfRegistered.fName == null || this.selfRegistered.fName == undefined || this.selfRegistered.fName == "")
      // || (this.selfRegistered.lName == null || this.selfRegistered.lName == undefined || this.selfRegistered.lName == "")
      || (!(this.isAge) && (!(this.isDOB)))
      || (this.selfRegistered.title == undefined || this.selfRegistered.title == "undefined" || this.selfRegistered.title == null || this.selfRegistered.title == "")
      || (this.selfRegistered.gender == null || this.selfRegistered.gender == undefined || this.selfRegistered.gender == "")) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please fill all mandatory fields";
    }
    else {
      this.spinnerService.start();
      this.checkParent();
      if (this.selfRegistered.relationShip > 0) {
        let email = '';
        (this.selfRegistered.contactInfo.email != null && this.selfRegistered.contactInfo.email != undefined) ? email = this.selfRegistered.contactInfo.email : email = '';
        this.selfRegistered.contactInfo = new ContactInfo();
        this.selfRegistered.contactInfo.email = email;
      }
      this.isError1 = false;
      this.selfRegistered.age = this.selectedProfileVO.age;
      this.selfRegistered.contactInfo.email = this.selectedProfileVO.contactInfo.email;
      this.selfRegistered.gender = this.selectedProfileVO.gender;
      this.selfRegistered.dob = this.selectedProfileVO.dob;
      this.selfRegistered.otpNotRequired = true;
      this.selfRegistered.portal = true;
      if (!this.selfRegistered.contactInfo.addresses)
        this.selfRegistered.contactInfo.addresses = new Array<Address>();
      if (this.isEmail == false && (this.selfRegistered.contactInfo.email != null || this.selfRegistered.contactInfo.email != undefined || this.selfRegistered.contactInfo.email != "")) {
        this.selfRegistered.updateEmail = true;
      }
      if (!this.selfRegistered.corporateDetailsList) {
        this.selfRegistered.corporateDetailsList = new Array<CorporateDetails>();
        this.selfRegistered.corporateDetailsList[0] = new CorporateDetails();
      }
      if (this.tempIdProofsList.length > 0) {
        this.tempIdProofsList.forEach(ele => {
          this.selfRegistered.corporateDetailsList[0].idProofsList.push(ele.framedUrl)
        });
      }
      this.onboardingService.updateProfile(this.selfRegistered).then((data: RegistrationResponseVo) => {
        this.spinnerService.stop();
        if (data.contactInfo)
          data.contactInfo.addresses = this.ParentProfile.contactInfo.addresses;
        if (this.relationAltnoChange != null && this.relationAltnoChange != undefined && this.relationAltnoChange.contactInfo)
          data.contactInfo = this.relationAltnoChange.contactInfo;
        this.registrationResponseVo = data;
        if (data.statusCode == 409 || data.statusCode == 500) {
          this.isError1 = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = data.statusMessage;
          return;
        }
        if (data != undefined && data != null && data.statusCode && data.statusMessage && data.statusCode != 406) {

          let selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
          if (this.selfRegistered.relationShip > 0) {
            selectedRegisteredProfile.selfProfile = this.ParentProfile;
          } else {
            selectedRegisteredProfile.selfProfile = this.registrationResponseVo;
          }
          selectedRegisteredProfile.selectedProfile = this.registrationResponseVo;
          this.vdcFirstname = true;
          this.vdcLastname = true;
          this.onRegisterNewUser.emit(selectedRegisteredProfile);
          this.errorMessage = new Array();
          this.errorMessage[0] = data.statusMessage; //successfully created
          this.resetAllFields();
          this.isAlreadyregistered = false;
          // (<any>$('#registerPatientModal')).modal('hide');
          this.closeModel.emit();
          alert(data.statusMessage);

        }
        else {
          this.errorMessage = new Array();
          this.errorMessage[0] = data.statusMessage ? data.statusMessage : 'Something went wrong! Please contact administrator.';
          alert(this.errorMessage[0])
        }
      })
    }
  }
  getSelectedProfile(event: any, profileId: number): void {
    if (event.target.checked) {
      this.selectedProfileId = profileId;
      this.selectedProfileVO = this.registrationVOList.find(item => item.profileId == profileId);
      // if (this.registrationVOList[index].title != undefined)
      // this.selectedProfileVO.title = this.registrationVOList[index].title.replace(/[.]/g, '').trim()
      if (this.selectedProfileVO.title) {
        this.hasTitle = true;
      }
      if (this.selectedProfileVO.contactInfo && this.selectedProfileVO.contactInfo.email) {
        var email = this.selectedProfileVO.contactInfo.email;
      }
      this.selectedProfileVO.contactInfo = new ContactInfo();
      this.selectedProfileVO.contactInfo = JSON.parse(JSON.stringify(this.selfRegistered.contactInfo));
      (email && email.length) ? this.selectedProfileVO.contactInfo.email = email : this.selectedProfileVO.contactInfo.email = '';
      this.selfRegistered = this.selectedProfileVO;
      if (this.selfRegistered.corporateDetailsList && this.selfRegistered.corporateDetailsList[0] != undefined && this.selfRegistered.corporateDetailsList[0].idProofsList.length > 0) {
        this.toDisplayIdProofsList();
      }
      else {
        this.idProofsList = new Array<string>();
        this.tempIdProofsList = new Array<string>();
      }
      if (this.selfRegistered.title == undefined || this.selfRegistered.title == "undefined") {
        this.UpdateRegisteredUser();
      }
      this.hsSelecteRefresh()
      this.profileVisitedDetailsforDoctor = new ProfileVisitedDetails();
      if (this.selfRegistered.dob != undefined) {
        if (isNaN(parseInt(this.common.getAgeForall(this.selfRegistered.dob).split(",")[0]))) {
          this.ageYears = 0
        } else {
          this.ageYears = parseInt(this.common.getAgeForall(this.selfRegistered.dob).split(",")[0]);
        }
        if (isNaN(parseInt(this.common.getAgeForall(this.selfRegistered.dob).split(",")[1]))) {
          this.ageMonths = 0
        } else {
          this.ageMonths = parseInt(this.common.getAgeForall(this.selfRegistered.dob).split(",")[1]);
        }
      } else {
        this.ageYears = null;
        this.ageMonths = null;
      }
    }
  }
  UpdateRegisteredUser(): void {
    $('#myrecption').animate({ scrollTop: 0 }, '300');
    $('.patient-registerpopup').css({ 'height': '' });
    this.isAlreadyregistered = false;
    this.isSelected = false;
    this.isIncompleteData = false;
    this.isActive = true;
    this.hsPrimaryIdentifier = true;
    this.hasTitle = false;
    this.isFname = false;
    this.isLname = false;
    this.isAge1 = false;
    this.isDOB1 = false;
    this.isEmail = false;
    this.isAltno = false;
    this.isGender = false;
    this.isRef = false;
    this.isRef1 = true;
    this.isError1 = false;

    // gender validation for vdc
    if (this.mandateAlertnateContactNo) {
      if (this.selfRegistered.title == "Mr" || this.selfRegistered.title == "Master" || this.selfRegistered.title == "Baby Boy") {
        this.selfRegistered.gender = "Male";
        this.isGender = true;
      }
      else if (this.selfRegistered.title == "Mrs" || this.selfRegistered.title == "Miss" || this.selfRegistered.title == "Baby Girl") {
        this.selfRegistered.gender = "Female";
        this.isGender = true;
      }
      else
        this.isGender = false;


      //adding conditons to disable which have data
      if (this.selfRegistered.title != null && this.selfRegistered.title != undefined && this.selfRegistered.title)
        this.hasTitle = true;

      if (this.selfRegistered.fName != null && this.selfRegistered.fName != undefined && this.selfRegistered.fName != "") {
        this.isFname = true;
        this.vdcFirstname = false;
      }

      if (this.selfRegistered.lName != null && this.selfRegistered.lName != undefined && this.selfRegistered.lName != "") {
        this.isLname = true;
        this.vdcLastname = false;
      }

      if (this.selfRegistered.dob != null && this.selfRegistered.dob != undefined && this.selfRegistered.dob != 0) {
        this.isDOB1 = true;
        this.isAge1 = true;
      }

      if (this.selfRegistered.gender != undefined && this.selfRegistered.gender != null && this.selfRegistered.gender != "")
        this.isGender = true;

    }
  }

  onNumberEdit() {
    if (this.emailPrimaryConsumerLogin && this.hsPrimaryIdentifier) {
      this.selfRegistered.updateMobile = true;
    }
  }

  alreadyRegisteredUser(): void {
    if (this.isSBR == true) {
      this.checkAge = parseInt(this.common.getAge(this.selectedProfileVO.dob).split(",")[0]);
      if (this.checkAge < 13) {
        alert("You are not eligible for symptom based advices as your age is below 13");
        return;
      }
    }

    this.mobElement.nativeElement.focus();
    this.isAge = false;
    this.isDOB = true;
    this.isDOB1 = false;
    if (this.selectedProfileVO && this.selectedProfileVO.contactInfo &&
      (!this.selectedProfileVO.contactInfo.addresses || !this.selectedProfileVO.contactInfo.addresses.length)) {
      this.selectedProfileVO.contactInfo.addresses = this.ParentProfile.contactInfo.addresses;
    }
    let selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
    selectedRegisteredProfile.selfProfile = this.ParentProfile;
    // this.selectedProfileVO.title = this.selectedProfileVO.title.replace(/[.]/g, '').trim();
    selectedRegisteredProfile.selectedProfile = this.selectedProfileVO;
    this.onRegisterNewUser.emit(selectedRegisteredProfile);

    let profileVisitedDetails: ProfileVisitedDetails = new ProfileVisitedDetails();
    profileVisitedDetails.revenue = this.profileVisitedDetailsforDoctor.revenue;
    profileVisitedDetails.noOfVisits = this.profileVisitedDetailsforDoctor.noOfVisits;
    profileVisitedDetails.lastVisitedDate = this.profileVisitedDetailsforDoctor.lastVisitedDate;
    this.profileVisitedDetails.emit(profileVisitedDetails);
    // (<any>$('#registerPatientModal')).modal('hide');
    this.closeModel.emit();

    this.tempNo = '';
    this.resetAllFields();

  }

  onRelationShipDropDownChange(index: number) {
    if (index > 0) {
      if (this.selfRegistered.relationShip > 0) this.selfRegistered.relationShip = index
      this.isChoose = true;
      this.relationshipChoosen = true;
    } else {
      this.isChoose = false;
      this.relationshipChoosen = false;
    }
  }

  onRelationShipDropDownChange1(index: number) {
    if (index > 0) {
      this.newFamilyMemberRelationShip = index;
      this.isChoose = true;
      this.relationshipChoosen = true;
    } else {
      this.isChoose = false;
      this.relationshipChoosen = false;
    }
  }


  resetAllFields(): void {
    this.registrationVOList = Array<RegistrationVO>();
    this.selectedProfileVO = new RegistrationVO();
    this.reset();
    this.selfRegistered = new RegistrationVO();
    this.registrationResponseVo = new RegistrationResponseVo();
    this.profileVisitedDetailsforDoctor = new ProfileVisitedDetails();
    this.customResponse = new ReportResponse();
    this.relationShipNames = new Array<RelationshipObj>();
    this.otpVo = new OtpVo();
    this.selfRegistered.contactInfo.mobile = '';
    if (this.tempNo != '0')
      this.selfRegistered.contactInfo.mobile = this.tempNo;
    this.isEnterOtp = false;
    this.isActive = false;
    this.memberDate = null;
    this.isSelected = false;    // toggle between submit and next button
    this.isIncompleteData = false;
    this.isSent = false;
    this.isSent1 = false;
    // this.isNumComplete = false;
    this.errorMessage = new Array();
    this.isError = false;
    this.showMessage = false;
    this.customResponse.statusMessage = null;
    this.isAlreadyregistered = true;
    this.isAge = true;
    this.isDOB = false;
    this.isAge1 = false;
    this.isDOB1 = false;
    this.isEmail = false;
    this.isAltno = false;
    this.hsPrimaryIdentifier = false;
    this.hasTitle = false;
    this.isFname = false;
    this.editFname = true;
    this.editLname = true;
    this.isLname = false;
    this.disableOptionalFeilds = false;
    this.isGender = false;
    this.ageYears = null;
    this.ageMonths = null;
    this.isRef = false;
    this.isRef1 = false;
    this.isReferral = false;
    this.isError1 = false;
    this.errorMessages = new Array();
    this.tempNo = "0";
    this.relationShipNo = 0;
    // this.relationShipStatus = false;
    this.selectedProfileId = 0;
  }

  onModelClose(): void {
    this.tempNo = '0';
    this.resetAllFields();
  }

  onAddMemberButtonSubmitClick() {

    this.familyMember.relationShipId = this.selfRegistered.relationShipId;
    if (this.familyMember.title == undefined || this.familyMember.title == "undefined" || this.familyMember.title == null || this.familyMember.title == "") {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please select title";
      this.showMessage = true;
      return;
    }
    if (this.familyMember.fName == "" || this.familyMember.fName == null || this.familyMember.fName == undefined) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter a valid first name";
      return;
    }
    if (this.familyMember.lName == null || this.familyMember.lName == undefined) {
      this.familyMember.lName == "";
    }

    if (this.mandateEmail && (!this.familyMember.contactInfo.email || this.familyMember.contactInfo.email.length == 0)) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid email address";
      return;
    } else if (this.familyMember.contactInfo.email && this.familyMember.contactInfo.email.length > 0 && !this.validateEmailId(this.familyMember.contactInfo.email)) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid email address";
      return;
    }

    //   this.errorMessage[0] = "please fill all fields";
    //   return;
    // }
    if (this.newFamilyMemberRelationShip == 0 && this.isChoose == true) {
      this.isChoose = false;
    }
    if (this.newFamilyMemberRelationShip > 0) {
      this.familyMember.relationShip = this.newFamilyMemberRelationShip;
    }

    if (!this.isChoose) {
      return;
    }

    if (this.familyMember.gender == undefined && this.isGenderChoose == true) {
      this.isGenderChoose = false;
    }

    if (!this.isGenderChoose) {
      return;
    }

    // optional dob for yoda
    if (this.optionalDOB) {
      this.familyMember.dob = null;
      if (this.isNewMemberDOB && this.newMemberDate != null && this.newMemberDate != undefined) {
        if (this.newMemberDate.getTime() != this.common.convertOnlyDateToTimestamp(new Date()))
          this.familyMember.dob = this.newMemberDate.getTime();
      }

      if (this.isNewMemberAge && ((this.ageYears != null && this.ageYears != undefined) || (this.ageMonths != undefined && this.ageMonths != null))) {
        this.ageYears = this.ageYears != null ? +this.ageYears : 0;
        this.ageMonths = this.ageMonths != null ? +this.ageMonths : 0;
        if (this.ageYears != 0 || this.ageMonths != 0)
          this.familyMember.dob = this.common.getDobFromAge(this.ageYears, this.ageMonths);
      }
    }

    if (!this.optionalDOB) {
      if (this.isNewMemberAge) {
        if (this.ageYears == null && this.ageMonths == null) {
          this.isError1 = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please enter valid age or DOB";
          return;
        } else {
          this.familyMember.dob = this.common.getDobFromAge(this.ageYears, this.ageMonths);
        }
      }
      if (this.isNewMemberDOB) {
        if (this.newMemberDate == null) {
          this.isError1 = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please enter valid age or DOB";
          return;
        } else {
          this.familyMember.dob = this.newMemberDate.getTime();
        }
      }
    }

    this.updateFamilyMember(this.familyMember);

  }

  onGenderChange() {
    this.isGenderChoose = true;
  }

  selectGender(event, ele) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == 13) {
      $(ele).trigger('click');
    }
    event.stopPropagation();
  }

  onGenderSelect() {
    this.isGenSelect = true;
  }

  updateFamilyMember(familyMember: ProfileDetailsVO) {
    this.spinnerService.start();
    this.patientregisterservice.updateFamilyMemberToServer(this.familyMember).then(response => {
      this.spinnerService.stop();
      // this.relationShipStatus = true;
      if (response != undefined && response != null && response.statusCode != 406 && response.statusCode != 409 && response.statusCode != 500) {
        this.isChoose = true;
        this.newFamilyMemberRelationShip = 0;
        this.familyMember = new ProfileDetailsVO();
        this.newMemberDate = new Date();
        this.addMemberCheck = !this.addMemberCheck;
        this.isNewMemberAge = false;
        this.isNewMemberDOB = true;
        this.isTenAttended = false;
        this.tempIdProofsList = new Array<string>();
        this.relationShipNo = response.relationShip;
        this.selectedProfileId = response.profileId;
        this.onNumberChange(this.selfRegistered.contactInfo.mobile);

        this.errorMessage = new Array();
        this.errorMessage[0] = "Family member added successfully";
        this.isError1 = false; //successfully created
        alert(response.statusMessage);

      }
      else {
        this.isError1 = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = response.statusMessage;
      }
    });
  }



  onAddMemberButtonClick() {
    this.addMemberCheck = !this.addMemberCheck;
    // this.ageYears = null;
    // this.ageMonths = null;
  }

  onAddMemberButtonCancelClick() {
    this.addMemberCheck = !this.addMemberCheck;
    this.isNewMemberAge = false;
    this.isNewMemberDOB = true;
    this.isChoose = true;
    this.familyMember = new ProfileDetailsVO();
    this.onNumberChange(this.selfRegistered.contactInfo.mobile);
  }

  validateNumberInputOnly(event) {
    // var key = window.event ? event.keyCode : event.which;
    // if (event.keyCode == 8 || event.keyCode == 46
    //   || event.keyCode == 37 || event.keyCode == 39) {
    //   return true;
    // }
    // else if (key < 48 || key > 57) {
    //   return false;
    // }
    // else return true;
    this.resetError();
    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }
  onReferralChange(referralCode: string): void {
    if (referralCode.length > 0 && this.isFname == false) {
      this.isReferral = true;
      this.isActive = true;
      this.referral = referralCode;
      this.isAlreadyregistered = false;
      this.isSelected = false;
      this.isError1 = false;
      this.isIncompleteData = false;
    }
    else if (this.isFname == false) {
      this.isReferral = false;
      this.isActive = true;
      this.isError1 = false;
    }

    else {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.isRef = true;
      this.isRef1 = true;
      this.isAlreadyregistered = false;
      return;
    }

  }
  getReferral() {
    if (this.selfRegistered.contactInfo.mobile == undefined) {
      this.errorMessage = new Array();
      this.isError1 = true;
      this.errorMessage[0] = 'Please enter your mobile no';
    }
    else {
      this.patientregisterservice.getCorporateReferral(this.referral, this.selfRegistered.contactInfo.mobile).then(response => {
        this.selfRegistered.brandId = response.brandId;
        if (response.statusCode == 200) {
          this.isReferral = false;
          this.isActive = false;
          this.isRef = true;
          this.isRef1 = true;
        }
        else {
          this.errorMessage = new Array();
          this.isError1 = true;
          this.errorMessage[0] = response.statusMessage;

        }
      });

    }
  }
  updateCorporateName(corporateName: string) {
    if (!this.selfRegistered.corporateDetailsList) {
      this.selfRegistered.corporateDetailsList = new Array<CorporateDetails>();
      let corporateDetails: CorporateDetails = new CorporateDetails();
      corporateDetails.corporateName = corporateName;
      this.selfRegistered.corporateDetailsList.push(corporateDetails);
      return
    }
    if (!this.selfRegistered.corporateDetailsList[0]) {
      let corporateDetails: CorporateDetails = new CorporateDetails();
      corporateDetails.corporateName = corporateName;
      this.selfRegistered.corporateDetailsList.push(corporateDetails);
      return
    }
    this.selfRegistered.corporateDetailsList[0].corporateName = corporateName;
  }

  updateEmployeeID(employeeCorporateId: string) {
    if (!this.selfRegistered.corporateDetailsList) {
      this.selfRegistered.corporateDetailsList = new Array<CorporateDetails>();
      let corporateDetails: CorporateDetails = new CorporateDetails();
      corporateDetails.employeeCorporateId = employeeCorporateId;
      this.selfRegistered.corporateDetailsList.push(corporateDetails);
      return
    }
    if (!this.selfRegistered.corporateDetailsList[0]) {
      let corporateDetails: CorporateDetails = new CorporateDetails();
      corporateDetails.employeeCorporateId = employeeCorporateId;
      this.selfRegistered.corporateDetailsList.push(corporateDetails);
      return
    }
    this.selfRegistered.corporateDetailsList[0].employeeCorporateId = employeeCorporateId;
  }
  getNameFromUrl(url: string) {
    return ('/' + url).split('/').pop().replace(/\%20/gi, ' ').substring(14, 50);
  }

  tempUrl(url) {
    this.authService.getTempFileURLFromSecureURL(url).then((resp) => {
      let framedUrls = { "framedUrl": '', "displayUrl": '' };
      framedUrls.framedUrl = url;
      framedUrls.displayUrl = resp.data;
      this.tempIdProofsList.push(framedUrls);
    })
  }
  fileUpload(event) {
    this.uploadFilesList = event.target.files;

    for (let i = 0; i < this.uploadFilesList.length; i++) {
      if (this.uploadFilesList[i].size >= 5000000) {
        alert("Select files less then 5MB");
        this.uploadFilesList = new Array();
        return;
      }
    }

    if (!this.selfRegistered.corporateDetailsList || !this.selfRegistered.corporateDetailsList[0]) {
      this.selfRegistered.corporateDetailsList = new Array<CorporateDetails>();
      this.selfRegistered.corporateDetailsList.push(new CorporateDetails());
    }
    if ((this.tempIdProofsList.length + this.uploadFilesList.length) > this.MAX_FILES_COUNT) {
      alert("Only " + this.MAX_FILES_COUNT + " files are allowed");
      return;
    }

    if (this.uploadFilesList.length >= 0) {
      for (let i = 0; i < this.uploadFilesList.length; i++) {
        if (this.uploadFilesList[i].name.toLowerCase().endsWith('.jpg') || this.uploadFilesList[i].name.toLowerCase().endsWith('.pdf') || this.uploadFilesList[i].name.toLowerCase().endsWith('.png') || this.uploadFilesList[i].name.toLowerCase().endsWith('.jpeg')) {
        }
        else {
          alert('Only jpg, png, jpeg, pdf file formats allowed');
          this.uploadFilesList.splice(i, 1);
        }
      }
    }
    else {
      this.uploadFilesList = new Array();
    }
    this.upload();
  }
  upload() {
    if (this.hasCheckBoxValidation) {
      return;
    }
    if (this.uploadFilesList === undefined || this.uploadFilesList === null ||
      this.uploadFilesList[0] === undefined || this.uploadFilesList[0] === null) {
      this.hasCheckBoxValidation = true;
      return;
    }

    $("html, body").animate({ scrollTop: "0px" }, 300);
    this.spinnerService.start();
    for (let i = 0; i < this.uploadFilesList.length; i++)
      this.fileUtil.fileUploadToAwsS3(null, this.uploadFilesList[i], this.selfRegistered.relationShipId, false, false).then(
        (awsS3FileResult: any) => {
          if (!awsS3FileResult) {
            this.spinnerService.stop();
            return;
          } else {
            this.spinnerService.stop();
            let url = awsS3FileResult.Location;
            this.tempUrl(url);
          }
        });
  }

  openUrlInNewTab(url) {
    this.authService.openPDF(url);
  }
  validateDate(e) {
    if (e.keyCode == 110 || e.keyCode == 9 || e.keyCode == 8) {
      // return;
    }
    if (('' + e.target.value).length >= 10) {
      e.preventDefault();
      return false;
    }
    if (e.keyCode == 191 || e.keyCode == 111) {
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

  async checkParent() {
    if (this.selfRegistered.relationShip > 0) {
      let selectedProfileVO = this.registrationVOList.find(item => item.relationShip == 0);
      selectedProfileVO.contactInfo.alternateMobile = this.selfRegistered.contactInfo.alternateMobile;
      await this.onboardingService.updateProfile(selectedProfileVO).then((data: RegistrationResponseVo) => {
        if (data.statusCode == 200 || data.statusCode == 201)
          this.relationAltnoChange = data;
      });
    }
  }

  closeLisModal() {
    this.tempNo = '';
    this.resetAllFields();
    (<any>$('#lisUserSelection')).modal('hide');
  }

  onLisGenderChange(val) {
    this.lisSelfUser.gender = val;
  }

  onChangeLisUser(number) {
    console.log("number", JSON.stringify(this.lisUserList[number]));
    this.lisIndex = number;
  }

  onLisContinue() {
    if (this.lisIndex == -1) {
      this.lisScreen3 = true;
      this.lisScreen1 = false;
      this.lisScreen2 = false;
      this.lisNewUser = false;
      this.lisSelfUser = new RegistrationVO();
      this.lisSelfUser.primaryUser = true;
      this.lisSelfUser.gender = null;
    }
    else {
      this.lisScreen1 = false;
      this.lisScreen3 = false;
      this.lisNewUser = true;
      this.lisScreen2 = true;
      this.lisUserList[this.lisIndex].primaryUser = true;
      this.lisSelfUser = this.lisUserList[this.lisIndex];
      this.lisUserList.splice(this.lisIndex, 1);
    }
    this.lisSelfUser.contactInfo = new ContactInfo();
    this.lisSelfUser.contactInfo.mobile = this.tempNo;

  }

  onlisRelation(number, index) {
    this.lisUserList[index].relationShip = +number;
    this.lisIsError = false;
  }

  onLisSubmit() {
    this.lisIsError = false;
    this.lisErrorMessages = new Array<string>();
    this.lisUserList.forEach((item) => {
      if (item.relationShip == 0)
        this.lisIsError = true;
    });

    if (this.lisIsError) {
      this.lisErrorMessages = new Array<string>();
      this.lisErrorMessages[0] = "Please select relationship for all members.";
      return;
    }
    let re = /\d{10}/;
    if (!re.test(this.lisSelfUser.contactInfo.alternateMobile) || this.lisSelfUser.contactInfo.alternateMobile.length < 10) {
      this.lisIsError = true;
      this.lisErrorMessages = new Array();
      this.lisErrorMessages[0] = "Enter a valid mobile number";
      return;
    }
    this.lisIsError = false;
    let req = {
      "lisExistingUsers": [],
      "registrationSource": 3
    }
    req.lisExistingUsers.push(this.lisSelfUser);
    req.lisExistingUsers.push.apply(req.lisExistingUsers, this.lisUserList);
    this.spinnerService.start();
    this.patientregisterservice.updateLisRegistration(req).then(response => {
      console.log("output", JSON.stringify(response));
      this.spinnerService.stop();
      (<any>$('#lisUserSelection')).modal('hide');
      this.NotRegMobile = this.tempNo;
      this.registrationVOList = response.lisExistingUsers;
      this.isAlreadyregistered = (this.registrationVOList && this.registrationVOList.length > 0 && this.registrationVOList[0].profileId > 0);
      this.setPatientDetails();
      this.hsSelecteRefresh();
    });
  }

  onLisTitleChange(event) {
    this.lisSelfUser.title = event;

    // gender validation for vdc
    if (this.mandateAlertnateContactNo) {
      if (this.lisSelfUser.title == "Mr" || this.lisSelfUser.title == "Master" || this.lisSelfUser.title == "Baby Boy") {
        this.lisSelfUser.gender = "Male";
        this.lisGender = true;
      }
      else if (this.lisSelfUser.title == "Mrs" || this.lisSelfUser.title == "Miss" || this.lisSelfUser.title == "Baby Girl") {
        this.lisSelfUser.gender = "Female";
        this.lisGender = true;
      }
      else {
        this.lisGender = false;
        this.lisSelfUser.gender = null;
      }
    }
  }
  resetLisFlow() {
    this.lisScreen1 = true;
    this.lisScreen2 = false;
    this.lisScreen3 = false;
  }

  onNewLisReg() {
    if (this.lisSelfUser.title == undefined || this.lisSelfUser.title == "undefined" || this.lisSelfUser.title == null || this.lisSelfUser.title == "") {
      this.lisErrorMessages = new Array();
      this.lisErrorMessages[0] = 'Please select title';
      this.lisIsError = true;
      return;
    }

    if (this.lisSelfUser.fName == null || this.lisSelfUser.fName == undefined || this.lisSelfUser.fName == "") {
      this.lisErrorMessages = new Array();
      this.lisErrorMessages[0] = 'Please enter a valid first name';
      this.lisIsError = true;
      return;
    }

    if (this.lisSelfUser.gender == null || this.lisSelfUser.gender == undefined) {
      this.lisErrorMessages = new Array();
      this.lisErrorMessages[0] = 'Please select a valid gender';
      this.lisIsError = true;
      return;
    }

    if (this.lismemberDate == null) {
      this.lisIsError = true;
      this.lisErrorMessages = new Array();
      this.lisErrorMessages[0] = "Please enter a valid DOB";
      return;
    }

    let re = /\d{10}/;
    if (!re.test(this.lisSelfUser.contactInfo.alternateMobile) || this.lisSelfUser.contactInfo.alternateMobile.length < 10) {
      this.lisIsError = true;
      this.lisErrorMessages = new Array();
      this.lisErrorMessages[0] = "Enter a valid mobile number";
      return;
    }

    this.lisSelfUser.dob = this.lismemberDate.getTime();
    this.lisScreen3 = false;
    this.lisScreen2 = true;
    this.lisIsError = false;
    this.lisNewUser = false;
  }

}

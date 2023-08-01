import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from '../../../../base/config';
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { Payment } from '../../../../model/basket/payment';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { SearchRequest } from '../../../../model/common/searchRequest';
import { DiscountType } from '../../../../model/package/discountType';
import { ServiceItem } from '../../../../model/service/serviceItem';
import { AuthService } from "./../../../../auth/auth.service";
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { DiagnosticDeliveryAdviceTrack } from './../../../../model/diagnostics/diagnosticListForAdmin';
import { InvestigationTestDetails } from './../../../../model/diagnostics/investigationTestDetails';
import { PaymentType } from './../../../../model/payment/paymentType';
import { PocAdviseData } from "./../../../../model/poc/poc-advise-data";
import { DiagnosticsService } from './../../../diagnostics.service';

@Component({
  templateUrl: './editorderdetails.template.html',
  styleUrls: ['./editorderdetails.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class EditOrderDetailsComponent implements OnInit, OnDestroy {

  investigationList: Array<InvestigationTestDetails> = new Array<InvestigationTestDetails>();
  diagnosticAdminOrderDetails: DiagnosticDeliveryAdviceTrack;
  investigationInfo: ServiceItem = new ServiceItem();

  discountType: number = DiscountType.TYPE_DIAGNOSTIC_DISCOUNT;
  paymentModeIndex: number = Payment.PAYMENT_TYPE_CASH;

  errorMessageTest: Array<string>;
  isErrorTest: boolean;
  showMessageTest: boolean;

  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;

  errorMsg: string;

  transationType: number;
  pocId: number;
  empId: number;
  empName: string;
  pocName: string;
  validation: any;

  isBackClick: boolean = false;

  searchTestsTotal: number = 0;
  searchedTests: any;
  promotionalDiscounts = 0;
  TIME_CONSTANT: number = -this.commonUtil.getTimezoneDifferential();

  crouselSelectedImage: String;
  prescriptionType = "";
  isVDC: boolean = false;
  isB2BUser: boolean = false;

  selectColumns: any[] = [
    {
      variable: 'serviceName',
      filter: 'text'
    }
  ];

  constructor(private diagnosticsService: DiagnosticsService, private authService: AuthService, private router: Router,
    private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService,
    private validationUtil: ValidationUtil, private cd: ChangeDetectorRef, private commonUtil: CommonUtil,) {
    this.pocId = this.authService.userAuth.pocId;
    this.pocName = authService.userAuth.pocName;
    this.empId = authService.userAuth.employeeId;
    this.empName = authService.userAuth.employeeName;
    this.validation = validationUtil;
  }

  ngOnInit(): void {
    this.diagnosticAdminOrderDetails = this.diagnosticsService.orderDetailAdviceTrack;
    //local storage , save all your data here
    if (this.diagnosticAdminOrderDetails) {
      let data = { 'diagnosticsAdminDetails': this.diagnosticAdminOrderDetails };
      this.hsLocalStorage.saveComponentData(data);
    } else {
      this.diagnosticAdminOrderDetails = this.hsLocalStorage.getComponentData().diagnosticsAdminDetails;
      this.diagnosticsService.orderDetailAdviceTrack = this.diagnosticAdminOrderDetails;
      if (!this.diagnosticAdminOrderDetails) {
        this.gotoDiagnosticsOrderList();
      }
    }
    if (this.diagnosticAdminOrderDetails && this.diagnosticAdminOrderDetails.pocId > 0) {
      this.pocId = this.diagnosticAdminOrderDetails.pocId;
    }
    if (this.diagnosticAdminOrderDetails && this.diagnosticAdminOrderDetails.pocDetails && this.diagnosticAdminOrderDetails.pocDetails.pocName) {
      this.pocName = this.diagnosticAdminOrderDetails.pocDetails.pocName;
    }

    this.investigationList = this.diagnosticAdminOrderDetails.serviceList;

    this.diagnosticAdminOrderDetails.convertedDocumentUrlList = new Array();
    if (this.diagnosticAdminOrderDetails && this.diagnosticAdminOrderDetails.proofDocumentUrlList && this.diagnosticAdminOrderDetails.proofDocumentUrlList.length > 0) {
      this.diagnosticAdminOrderDetails.proofDocumentUrlList.forEach(url => {
        if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
          this.diagnosticAdminOrderDetails.convertedDocumentUrlList.push(url);
        }
        else {
          if (url.includes("pdf"))
            this.diagnosticAdminOrderDetails.convertedDocumentUrlList.push(url);
          else {
            this.diagnosticsService.getPdfUrl(url).then(xdata => {
              this.diagnosticAdminOrderDetails.convertedDocumentUrlList.push(this.diagnosticsService.tempPdfUrl);
            });
          }
        }
      });
    }
    if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableInvoiceSplitting)
      this.isVDC = true;
    //for remove option of each test
    this.diagnosticAdminOrderDetails.serviceList.forEach(item => {
      if (item.paymentStatusPerTest == undefined || item.paymentStatusPerTest == null || item.paymentStatusPerTest != 1)
        item.paymentStatusPerTest = 0;
    });

    this.isB2BUser = (this.diagnosticAdminOrderDetails.b2bUserOrder && this.diagnosticAdminOrderDetails.b2bUserOrder == 2);
  }

  rejectOrder(status) {
    (<any>$("#rejectModal")).modal("hide");
    this.diagnosticAdminOrderDetails.cancellationStatus = 2;
    this.onSaveDetails(status);
  }

  onSaveDetails(status): void {

    this.errorMsg = "";

    // if (this.isError) {
    //   this.errorMsg = "Something went wrong";
    //   return;
    // }

    console.log("Payment: " + JSON.stringify(this.diagnosticAdminOrderDetails.payment));
    this.diagnosticAdminOrderDetails.sampleCollectionStatus = status;
    this.diagnosticAdminOrderDetails.acceptedEmpId = this.empId;
    this.diagnosticAdminOrderDetails.acceptedEmpName = this.empName;
    this.diagnosticAdminOrderDetails.payment.paymentStatus = (this.diagnosticAdminOrderDetails.payment.paymentStatus &&
      this.diagnosticAdminOrderDetails.payment.paymentStatus > 0) ? this.diagnosticAdminOrderDetails.payment.paymentStatus : PaymentType.PAYMENT_STATUS_NOT_PAID;

    if (this.paymentModeIndex == 0) {
      this.errorMsg = "Please select a payment mode";
      return;
    }

    this.diagnosticAdminOrderDetails.payment.transactionType = this.paymentModeIndex;
    if (!this.diagnosticAdminOrderDetails.pocDetails.pocId) {
      let data: PocAdviseData = new PocAdviseData();
      data.pocId = this.pocId;
      data.pocName = this.pocName;
      this.diagnosticAdminOrderDetails.pocDetails = data;
    }
    if (this.diagnosticAdminOrderDetails.serviceList.length < 1) {
      this.errorMsg = "No Items in Order list";
      return;
    }
    if (this.diagnosticAdminOrderDetails.payment.finalAmount < 0) {
      this.errorMsg = "Payable amount cannot be negative";
      return;
    }

    const isZero = this.diagnosticAdminOrderDetails.serviceList.find(service => service.netPrice <= 0 && service.packageSplitTest == false)
    if (isZero && !this.isB2BUser) {
      this.errorMsg = "Test price should be greater than zero";
      return;
    }

    let basketRequest: BasketRequest = new BasketRequest();
    basketRequest.orderId = this.diagnosticAdminOrderDetails.orderId;
    basketRequest.transactionSource = this.diagnosticAdminOrderDetails.paymentSource;
    basketRequest.totalOriginalAmount = this.diagnosticAdminOrderDetails.payment.originalAmount;
    basketRequest.totalFinalAmount = this.diagnosticAdminOrderDetails.payment.finalAmount;
    basketRequest.bookingSource = this.diagnosticAdminOrderDetails.bookingSource;
    basketRequest.parentProfileId = this.diagnosticAdminOrderDetails.parentProfileId;

    let detailsList: any = this.diagnosticAdminOrderDetails;
    detailsList.bookingType = SlotBookingDetails.BOOKING_TYPE_INVESTIGATION;
    detailsList.bookingSubType = this.diagnosticsService.diagBookingSubType;
    detailsList.slotDate = this.diagnosticAdminOrderDetails.pickupDate;
    detailsList.slotTime = this.diagnosticAdminOrderDetails.pickupTime;

    let currentTimestamp: Date = new Date();
    this.diagnosticAdminOrderDetails.updatedTimestamp = currentTimestamp.getTime();

    basketRequest.slotBookingDetailsList = new Array();
    basketRequest.slotBookingDetailsList.push(detailsList);
    basketRequest.updatedTimestamp = currentTimestamp.getTime();

    console.log("this.basketRequest: " + JSON.stringify(basketRequest));

    //commented temporarily
    /* this.diagnosticsService.deliveryAmount(basketRequest).then(data => {
      this.diagnosticAdminOrderDetails.deliveryAmount = data.slotBookingDetailsList[0].deliveryAmount;
      this.diagnosticAdminOrderDetails.deliveryType = data.slotBookingDetailsList[0].deliveryType;
      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.spinnerService.start();
      this.updateDiagnosticAdminReports();
    }); */
    this.spinnerService.start();
    this.updateDiagnosticAdminReports();
    console.log("diagnosticAdminOrderDetails: " + JSON.stringify(this.diagnosticAdminOrderDetails))
  }

  updateDiagnosticAdminReports() {
    this.diagnosticsService.updateDiagnosticAdminRemarks(this.diagnosticAdminOrderDetails).then(data => {
      this.spinnerService.stop();
      this.errorMsg = "";
      if (data.statusCode == 201 || data.statusCode == 200) {
        console.log('success-------------')
        console.log("EditOrderDetailsData: " + JSON.stringify(data));
        this.diagnosticAdminOrderDetails = data;
        this.diagnosticsService.centralAdminModify = true;
        this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
      }
      else {
        console.log('fails-------------')
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = data.statusMessage;
        this.isError = true;
        this.showMessage = true;
      }
    });
  }

  gotoDiagnosticsOrderList(): void {
    this.router.navigate(['/app/diagnostics']);
  }

  gotoDiagnosticadminlist(): void {
    this.router.navigate(['/app/diagnostics/homeorders/homeorderlist']);
  }

  onBackClick() {
    // if (this.diagnosticAdminOrderDetails.convertedDocumentUrlList.length > 0) {
    //   this.gotoDiagnosticadminlist();
    // }
    this.isBackClick = true;
    this.diagnosticsService.centralAdminModify = true;
    this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
  }

  removeItem(index) {
    this.diagnosticAdminOrderDetails.serviceList.splice(index, 1)
    /* if (this.diagnosticAdminOrderDetails.serviceList.length < 1) {
      this.diagnosticAdminOrderDetails.payment.finalAmount = 0;
      this.diagnosticAdminOrderDetails.payment.originalAmount = 0;
    } else {
      this.calculatePrice();
    } */
  }

  editPrice(price, index, isGrossPrice) {
    console.log("editPrice: " + price);
    this.errorMsg = "";

    if (isNaN(price) || price == "") {
      if (isGrossPrice)
        this.diagnosticAdminOrderDetails.serviceList[index].grossPrice = 0;
      else
        this.diagnosticAdminOrderDetails.serviceList[index].netPrice = 0;

      this.diagnosticAdminOrderDetails.serviceList[index].discountPrice = 0;
    } else {
      if (isGrossPrice) {

        this.diagnosticAdminOrderDetails.serviceList[index].grossPrice =
          this.diagnosticAdminOrderDetails.serviceList[index].originalAmount = parseInt(price);
        if (this.isVDC) {
          // added for vdc as offer price section removed
          this.diagnosticAdminOrderDetails.serviceList[index].netPrice =
            this.diagnosticAdminOrderDetails.serviceList[index].finalAmount = (parseInt(price));
        }
      } else {
        this.diagnosticAdminOrderDetails.serviceList[index].netPrice =
          this.diagnosticAdminOrderDetails.serviceList[index].finalAmount = (parseInt(price));
      }

      if (this.diagnosticAdminOrderDetails.serviceList[index].grossPrice < this.diagnosticAdminOrderDetails.serviceList[index].netPrice) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "OfferPrice should be less than OriginalPrice";
        this.showMessage = true;
        return;
      } else {
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        /* this.diagnosticAdminOrderDetails.serviceList[index].discountPrice =
          this.diagnosticAdminOrderDetails.serviceList[index].grossPrice - this.diagnosticAdminOrderDetails.serviceList[index].netPrice; */
      }

    }
  }

  onChangeTest(): void {
    this.isErrorTest = false;
    this.errorMessageTest = new Array();
    this.showMessageTest = false;
    this.investigationInfo = new ServiceItem();
    $("form>div>hs-select>div>input").val("");
  }

  addNewTest(): void {
    this.errorMsg = "";

    if (!this.investigationInfo.serviceName || (this.investigationInfo.grossPrice <= 0 && !this.isB2BUser)) {
      this.isErrorTest = true;
      this.errorMessageTest = new Array();
      this.errorMessageTest[0] = "Please enter valid data";
      this.showMessageTest = true;
      return;
    } else if (Number(this.investigationInfo.grossPrice) < Number(this.investigationInfo.netPrice)) {
      this.isErrorTest = true;
      this.errorMessageTest = new Array();
      this.errorMessageTest[0] = "OfferPrice should be less than OriginalPrice";
      this.showMessageTest = true;
      return;
    }

    if (this.investigationInfo && this.investigationInfo.serviceId && this.investigationInfo.serviceId > 0) {
      this.addTestToList(this.investigationInfo);
    } else {
      let testDetails: InvestigationTestDetails = new InvestigationTestDetails();
      testDetails.pocId = this.pocId;
      testDetails.serviceId = 0;
      testDetails.serviceName = this.investigationInfo.serviceName;
      this.diagnosticsService.addNewTest(testDetails).then(response => {
        response.grossPrice = this.investigationInfo.grossPrice;
        response.netPrice = this.investigationInfo.netPrice;

        this.addTestToList(response);
      });
    }
    this.cd.detectChanges();
  }

  addTestToList(response: any) {
    console.log("addTestToList: ", response);

    if (!this.diagnosticAdminOrderDetails.serviceList) {
      this.diagnosticAdminOrderDetails.serviceList = new Array<InvestigationTestDetails>();
    }

    let isExist = false;
    if (this.diagnosticAdminOrderDetails.serviceList.length >= 1) {
      this.diagnosticAdminOrderDetails.serviceList.forEach(item => {
        if (item.serviceId == response.serviceId) {
          isExist = true;
        }
      });
    }

    if (isExist) {
      this.isErrorTest = true;
      this.errorMessageTest = new Array();
      this.errorMessageTest[0] = "Test already exist";
      this.showMessageTest = true;
      return;
    } else {
      let serviceItem = new InvestigationTestDetails();
      serviceItem.serviceId = response.serviceId;
      serviceItem.serviceName = response.serviceName;
      serviceItem.parentServiceId = response.parentServiceId;
      serviceItem.parentServiceName = response.parentServiceName;
      serviceItem.grossPrice = response.grossPrice ? response.grossPrice : 0;
      serviceItem.netPrice = (response.netPrice > 0) ? response.netPrice : response.grossPrice;

      response.discountPrice = serviceItem.grossPrice - serviceItem.netPrice;

      serviceItem.discountPrice = response.discountPrice ? response.discountPrice : 0;
      serviceItem.quantity = 1;
      serviceItem.originalAmount = serviceItem.grossPrice;
      serviceItem.otherDiscountAmount = serviceItem.discountPrice;
      serviceItem.finalAmount = serviceItem.netPrice;
      if (response.note != null && response.note != undefined && response.note.length > 0)
        serviceItem.precaution = response.note[0].title;
      this.diagnosticAdminOrderDetails.serviceList.push(serviceItem);
    }
    this.onChangeTest();
  }

  searchTests(key) {
    console.log("...................")
    this.isErrorTest = false;
    this.errorMessageTest = new Array();
    this.showMessageTest = false;

    let searchRequest = new SearchRequest();
    // searchRequest.aliasSearchType = 1;
    searchRequest.from = 0;
    searchRequest.id = this.pocId;
    // searchRequest.searchCriteria = 0;
    searchRequest.searchTerm = key;
    searchRequest.size = 500;
    if (this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME)
      searchRequest.homeCollections = true;
    else if (this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN)
      searchRequest.homeCollections = false;
      
    if(key.length == 0){
      this.investigationInfo= new ServiceItem();
    }

    if (key.length > 2) {
      if (this.isB2BUser) {
        // For B2B API
        let req = {
          "privilegeType": this.diagnosticAdminOrderDetails.privilegeCardType,
          "pocId": this.diagnosticAdminOrderDetails.pocId,
          "searchTerm": key,
          "status": this.diagnosticAdminOrderDetails.bookingSubType
        }
        this.diagnosticsService.searchB2BClientScheduleTests(req).then((searchedTests) => {
          if (searchedTests == undefined || searchedTests == null || searchedTests.length == 0) {
            this.errorMessageTest = new Array();
            this.errorMessageTest[0] = 'No results found';
            this.isErrorTest = true;
            this.showMessageTest = true;
            $('html, body').animate({ scrollTop: '0px' }, 300);
          }
          this.searchTestsTotal = searchedTests.length;
          this.searchedTests = searchedTests;
          if (this.searchTestsTotal > 0) {
            this.investigationInfo.serviceName = searchRequest.searchTerm;
          }
          this.commonUtil.sleep(700);
        });

      } else {
        this.diagnosticsService.searchScheduleTests(searchRequest).then((searchedTests) => {
          if (searchedTests == undefined || searchedTests == null || searchedTests.length == 0) {
            this.errorMessageTest = new Array();
            this.errorMessageTest[0] = 'No results found';
            this.isErrorTest = true;
            this.showMessageTest = true;
            $('html, body').animate({ scrollTop: '0px' }, 300);
          }
          this.searchTestsTotal = searchedTests.length;
          this.searchedTests = searchedTests;
          if (this.searchTestsTotal > 0) {
            this.investigationInfo.serviceName = searchRequest.searchTerm;
          }
          this.commonUtil.sleep(700);
        })
      }
    }
  }

  getTestName(selectedTest) {
    this.investigationInfo = selectedTest;
    if (this.isB2BUser) {
      // Nothing to do
    } else {
      this.diagnosticsService.getTestAmount(selectedTest.serviceId, this.pocId, true).then(data => {
        let priceData;
        if (this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN) {
          priceData = data.walkinOrderPriceDetails;
        } else {
          priceData = data.homeOrderPriceDetails;
        }
        console.log("PriceData: " + this.diagnosticsService.diagBookingSubType + ">>>>: ", priceData);

        if (priceData && priceData.dayBasedPricing) {
          priceData.dayBasedPricing.forEach(day => {
            let currentTime = this.commonUtil.convertTimeToUTC(new Date()) + this.TIME_CONSTANT;
            console.log("currentTime: " + currentTime + ">>>>>" + this.commonUtil.convertDateToDayOfWeek(new Date()));
            if (day.dayOfWeek == this.commonUtil.convertDateToDayOfWeek(new Date())) {
              day.timeBasedPricing.forEach(timeInterval => {
                if (currentTime >= timeInterval.fromTime && currentTime < timeInterval.toTime) {
                  console.log("timeInterval: " + JSON.stringify(timeInterval));
                  this.investigationInfo.grossPrice = this.investigationInfo.originalAmount = timeInterval.grossPrice;
                  this.investigationInfo.netPrice = this.investigationInfo.finalAmount = timeInterval.netPrice;
                  this.investigationInfo.discountPrice = this.investigationInfo.otherDiscountAmount = timeInterval.discountPrice;
                }
              })
            }
          })
        }

        if (this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN &&
          data.walkinOrderPriceDetails) {
          this.investigationInfo.grossPrice = this.investigationInfo.originalAmount = data.walkinOrderPriceDetails.grossPrice;
          this.investigationInfo.netPrice = this.investigationInfo.finalAmount = data.walkinOrderPriceDetails.netPrice;
          this.investigationInfo.discountPrice = this.investigationInfo.otherDiscountAmount = data.walkinOrderPriceDetails.discountPrice;
        } else if (this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME &&
          data.homeOrderPriceDetails) {
          this.investigationInfo.grossPrice = this.investigationInfo.originalAmount = data.homeOrderPriceDetails.grossPrice;
          this.investigationInfo.netPrice = this.investigationInfo.finalAmount = data.homeOrderPriceDetails.netPrice;
          this.investigationInfo.discountPrice = this.investigationInfo.otherDiscountAmount = data.homeOrderPriceDetails.discountPrice;
        }
      });
    }
  }

  onAmountChange(value: number, index: number): void {
    console.log("onAmountChange: " + value + ">>>> " + index);
    if (index >= 0) {
      this.diagnosticAdminOrderDetails.serviceList[index].originalAmount =
        this.diagnosticAdminOrderDetails.serviceList[index].grossPrice;
      this.diagnosticAdminOrderDetails.serviceList[index].finalAmount =
        this.diagnosticAdminOrderDetails.serviceList[index].netPrice;
      this.diagnosticAdminOrderDetails.serviceList[index].otherDiscountAmount =
        this.diagnosticAdminOrderDetails.serviceList[index].discountPrice;
    } else {
      if (index == -1) {
        this.investigationInfo.grossPrice = this.investigationInfo.originalAmount = value;
        if (this.isVDC) // added for vdc as offer price section removed
          this.investigationInfo.netPrice = this.investigationInfo.finalAmount = value;
      } else {
        this.investigationInfo.netPrice = this.investigationInfo.finalAmount = value;
      }
      this.investigationInfo.discountPrice = this.investigationInfo.otherDiscountAmount =
        this.investigationInfo.grossPrice - this.investigationInfo.netPrice;
    }
  }

  validateNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 8 || event.keyCode == 46
      || event.keyCode == 37 || event.keyCode == 39) {
      return true;
    }
    else if (key < 48 || key > 57) {
      return false;
    }
    else return true;
  }

  roundToTwo(num) {
    num = num + 'e+2';
    return +(Math.round(num) + 'e-2');
  }

  sliderImage(imageSrc, type) {
    this.prescriptionType = type;
    this.crouselSelectedImage = undefined;
    if (type == "pdf") {
      this.authService.openPDF(imageSrc)
    } else {
      $('#prescription-modal').css('height', 'none');
      this.crouselSelectedImage = imageSrc;
    }
  }

  hideToolBar(e) {
    $('.toolbar').css('display', 'none');
    return false;
  }

  ngOnDestroy(): void {
    if (!this.isBackClick) {
      this.diagnosticsService.orderDetailAdviceTrack = this.diagnosticAdminOrderDetails;
    } else {
      this.diagnosticsService.orderDetailAdviceTrack = this.hsLocalStorage.getComponentData().diagnosticsAdminDetails;
    }
  }
}

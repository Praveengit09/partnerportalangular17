import { Router } from '@angular/router';
import { Component, ViewEncapsulation } from '@angular/core';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { UpdateReconciliationStatement } from '../../../../model/report/updatereconciliationstatement';
import { POCInvoiceSummary } from '../../../../model/report/pocInvoiceSummary';
import { PocAdviseData } from '../../../../model/poc/poc-advise-data';
import { ReconciliationReportRequest } from '../../../../model/report/reconciliationreportrequest';
import { InvoiceReconcilationConstant, PaymentModeTypeEnum, PaymentStatusTypeEnum } from '../../../../constants/report/invoicetypeconstants';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { AppConfig } from '../../../../app.config';
import { ReconciliationSummaryStatement } from '../../../../model/report/reconciliationsummarystatement';
import { AuthService } from '../../../../auth/auth.service';
import { BusinessAdminService } from '../../../businessadmin.service';
@Component({
    selector: 'settlePayment',
    templateUrl: './settlepayment.template.html',
    styleUrls: ['./settlepayment.style.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SettlePaymentComponent {
    config: any;
    reconciliationSummary: ReconciliationSummaryStatement;
    paymentModeTypeEnum = PaymentModeTypeEnum;
    paymentStatusTypeEnum = PaymentStatusTypeEnum;
    settleSubmitReconciliation: any;
    settleSubmitItem: any;
    reconcilitionAreaState: any;
    selectedItem: any;
    pocRolesList: Array<PocAdviseData>;
    selectedPOC: PocAdviseData;
    empId: number;
    showMessage: boolean;
    pocInvoiceSummary: Array<POCInvoiceSummary>;
    startDate: number;
    endDate: number;
    isError: boolean;
    message: Array<string>;
    errorMessage: Array<string>
    updatedSMS: any;
    reconciliationReport: any;
    settleRecocileUpdate: any;
    downloadXl: any;
    payableAmount: any;
    timeStamp: number;
    // updateStatementList: Array<any>;
    invoiceReconcilationConstant = InvoiceReconcilationConstant;
    responseList: any;
    constructor(config: AppConfig, private adminService: BusinessAdminService,
        private router: Router, private authService: AuthService, private spinnerService: SpinnerService) {
        this.config = config.getConfig();
        this.settleSubmitReconciliation = this.adminService.periodicFinanceAction;
        this.reconcilitionAreaState = this.adminService.reconciliationDeatilList;
        this.settleSubmitItem = this.adminService.selectedFinancePeriodic;
        this.startDate = this.adminService.startTime;
        this.endDate = this.adminService.endTime;
    }
    ngOnInit() {
        this.settleSubmitItem = this.adminService.selectedFinancePeriodic;
        this.pocRolesList = this.authService.employeePocMappingList;
        this.reconcilitionAreaState = this.adminService.reconciliationDeatilList;
        this.empId = this.authService.userAuth.employeeId;
        if (this.pocRolesList != null && this.pocRolesList.length > 0) {
            this.selectedPOC = this.pocRolesList[0];
        }
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.settleSubmitItem != undefined) {

            window.localStorage.setItem('selectedFinancePeriodic', cryptoUtil.encryptData(JSON.stringify(this.settleSubmitItem)));
            let dateDetails = { startTime: this.adminService.startTime, endTime: this.adminService.endTime };
            window.localStorage.setItem('s&eDate', cryptoUtil.encryptData(JSON.stringify(dateDetails)));
            //     this.settleSubmitItem.periodicFinancialStatementList.forEach((element, i) => {
            //     element.updateReconciliationStatementList = this.settleSubmitItem.periodicFinancialStatementList[0].updateReconciliationStatementList;
            //     this.settleSubmitItem.periodicFinancialStatementList[i].payDetails = element.updateReconciliationStatementList[element.updateReconciliationStatementList.length - 1];
            // })
            this.settleSubmitItem.periodicFinancialStatementList.forEach((element, i) => {
                    this.settleSubmitItem.periodicFinancialStatementList[i].payDetails = element.updateReconciliationStatementList != null
                        && element.updateReconciliationStatementList != undefined && element.updateReconciliationStatementList[element.updateReconciliationStatementList.length - 1]
     
            })
        }

        else {
            this.settleSubmitItem = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedFinancePeriodic')));
            this.adminService.selectedFinancePeriodic = this.settleSubmitItem;

            // this.settleSubmitItem.periodicFinancialStatementList.forEach((element, i) => {
            //     element.updateReconciliationStatementList = this.settleSubmitItem.periodicFinancialStatementList[0].updateReconciliationStatementList;
            //     this.settleSubmitItem.periodicFinancialStatementList[i].payDetails = element.updateReconciliationStatementList[element.updateReconciliationStatementList.length - 1];
            // })
            this.settleSubmitItem.periodicFinancialStatementList.forEach((element, i) => {
                    this.settleSubmitItem.periodicFinancialStatementList[i].payDetails =  element.updateReconciliationStatementList != null
                        &&  element.updateReconciliationStatementList != undefined &&  element.updateReconciliationStatementList[element.updateReconciliationStatementList.length - 1]           
            })
            let data = window.localStorage.getItem('s&eDate');
            let dateDetails = data ? JSON.parse(cryptoUtil.decryptData(data)) : undefined;
            if (dateDetails) {
                this.adminService.startTime = this.startDate = dateDetails.startTime;
                this.adminService.endTime = this.endDate = dateDetails.endTime;
            }
        }


        console.log("selectedFinance" + JSON.stringify(this.settleSubmitItem));

    }
    settlePaymentRecevied(itemPoc) {


        this.settleRecocileUpdate = itemPoc;
        console.log("ok============>" + JSON.stringify(this.settleRecocileUpdate))
        this.settleRecocileUpdate.payDetails = this.settleRecocileUpdate.updateReconciliationStatementList != null
            && this.settleRecocileUpdate.updateReconciliationStatementList != undefined && this.settleRecocileUpdate.updateReconciliationStatementList[this.settleRecocileUpdate.updateReconciliationStatementList.length - 1];

        console.log("emplk" + JSON.stringify(this.settleRecocileUpdate.payDetails))

        this.payableAmount = (this.settleRecocileUpdate.totalPayableAmount - this.settleRecocileUpdate.totalReceivableAmount) - this.settleRecocileUpdate.reconciledAmount;
        console.log("pay==>" + JSON.stringify(this.payableAmount))
        if (itemPoc.pocPayable == true) {
            if (itemPoc.reconciliationPendingAmount > 0) {
                (<any>$("#settleRecevied")).modal("show");
            }
            else {
                // (<any>$(".Updatereport")).css("background-color", "yellow");
                (<any>$(".Updatereport")).addClass('disabled');
            }

        }
        else {
            if ((itemPoc.totalPayableAmount - itemPoc.totalReceivableAmount) > itemPoc.reconciledAmount) {
                (<any>$("#settleRecevied")).modal("show");
            }
        }




        console.log('selectedFinancePeriodic' + JSON.stringify(itemPoc));

    }
    settleSubmitRecocile() {

        this.spinnerService.start();
        //let reportRequest: any;
        let reportRequest: UpdateReconciliationStatement = new UpdateReconciliationStatement();
        reportRequest.invoiceId = this.settleRecocileUpdate.invoiceId;
        if (this.settleRecocileUpdate.pocPayable == true) {
            reportRequest.receivable = this.settleRecocileUpdate.reconciliationPendingAmount;
        }
        if (this.settleRecocileUpdate.pocPayable == false) {
            reportRequest.payable = this.payableAmount;
        }

        reportRequest.reconciliationStatus = this.settleRecocileUpdate.reconciliationStatus;
        reportRequest.paymentMode = this.settleRecocileUpdate.payDetails.paymentMode;
        reportRequest.paymentStatus = this.settleRecocileUpdate.payDetails.paymentStatus;
        reportRequest.timeStamp = new Date().getTime();
        reportRequest.comment = this.settleRecocileUpdate.comment;
        console.log("emp123===>" + JSON.stringify(reportRequest))
        this.adminService.updateReconciliationAmount(reportRequest).then((data) => {
            this.spinnerService.stop();
            let response = data;
            console.log("update" + JSON.stringify(response))

            if (response.statusCode == 200 || response.statusCode == 201) {
                
                this.updatedSMS = response;
                alert(response.statusMessage);
                (<any>$)('#settleRecevied').modal('hide');
                this.settleUpdated();
            }
            else if (response.statusCode == 405) {
                alert(response.statusMessage);
            }
        })
        console.log("emp========>" + JSON.stringify(this.settleRecocileUpdate))
    }

    settleSummary(item) {
        this.adminService.reconciliationDeatilList = item;
        this.router.navigate(['/app/finance/platform/reconciliationdetails']);
    }
    backButton() {
        this.router.navigate(['/app/finance/platform/reconciliation']);
    }
    settleUpdated() {
        (<any>$)('#settleupdated').modal('hide');
        (<any>$)('#settleRecevied').modal('hide');
        $(".modal-backdrop").not(':first').remove();
        //this.router.navigate(['app/finance/settlepayment']);

        let reportRequest: ReconciliationReportRequest = new ReconciliationReportRequest()
        reportRequest.employeeId = this.empId;
        reportRequest.fromDate = this.settleRecocileUpdate.invoiceFromDate;
        reportRequest.toDate = this.settleRecocileUpdate.invoiceToDate;
        reportRequest.skip = 0;
        reportRequest.limit = 4;
        this.adminService.getReconciliationReports(reportRequest).then((data) => {
            this.spinnerService.stop();
            let response = data;
            if (response == null || response == undefined || response <= 0) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "No Reports Found";
                this.showMessage = true;
                this.message = new Array();
            }
            else {
                this.reconciliationReport = response;
                this.settleSubmitItem.periodicFinancialStatementList.forEach((element, i) => {
                    if (element.invoiceFromDate == this.reconciliationReport.periodicSummaryFinancialStatementList[0].periodicFinancialStatementList[0].invoiceFromDate) {
                        this.adminService.selectedFinancePeriodic.periodicFinancialStatementList[i] =
                            this.settleSubmitItem.periodicFinancialStatementList[i] = this.reconciliationReport.periodicSummaryFinancialStatementList[0].periodicFinancialStatementList[0];


                        element.updateReconciliationStatementList = this.reconciliationReport.periodicSummaryFinancialStatementList[0].periodicFinancialStatementList[0].updateReconciliationStatementList;
                    
                        this.settleSubmitItem.periodicFinancialStatementList[i].payDetails = element.updateReconciliationStatementList[element.updateReconciliationStatementList.length - 1];
                        
                    }
                });

                let cryptoUtil: CryptoUtil = new CryptoUtil();
                if (this.settleSubmitItem != undefined) {
                    window.localStorage.setItem('selectedFinancePeriodic', cryptoUtil.encryptData(JSON.stringify(this.settleSubmitItem.periodicFinancialStatementList.payDetails)));
                    console.log("settleSubmitItem1233" + JSON.stringify(this.settleSubmitItem.periodicFinancialStatementList.payDetails))
                }

                // this.updateStatementList = this.settleSubmitItem.periodicFinancialStatementList;
                console.log("settleSubmitItem" + JSON.stringify(this.settleSubmitItem.periodicFinancialStatementList.payDetails))



            }

            console.log("reconcilemp" + JSON.stringify(this.reconciliationReport))
        })

    }
    exlDownload() {

        let pocId, fromDate, toDate;
        this.spinnerService.start();
        fromDate = this.adminService.startTime,
            toDate = this.adminService.endTime,
            pocId = new Array<number>();
        if (this.selectedPOC != undefined && this.selectedPOC != null && this.selectedPOC.pocId > 0) {
            pocId = new Array<number>();
            pocId.push(this.selectedPOC.pocId);
        } else {
            pocId = this.authService.employeeDetails.pocIdList;
        }
        console.log(JSON.stringify(pocId, fromDate, toDate))
        this.adminService.getmonthlyTransactionReportsXsl(pocId, fromDate, toDate).then(response => {
            this.spinnerService.stop();
            if (response == undefined || response == null || response.length <= 0) {
                this.isError = true;
                this.showMessage = true;
                this.message = new Array();
                this.errorMessage = new Array();
                this.errorMessage[0] = "No Reports Found";
            } else {
                this.downloadXl = response;
                if (response.statusCode == 0) {
                    window.location.href = response.data;
                }
            }
        })


    }
}

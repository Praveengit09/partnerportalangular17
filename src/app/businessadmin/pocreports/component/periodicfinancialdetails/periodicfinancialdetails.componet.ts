import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Router } from '@angular/router';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { PocAdviseData } from '../../../../model/poc/poc-advise-data';
import { Component, ViewEncapsulation, OnChanges } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { InvoiceTypeEnum, InvoiceTypeConstant } from '../../../../constants/report/invoicetypeconstants';
import { PeriodcFinancialStatement } from '../../../../model/report/periodicfinancialstatement ';
import { POCInvoiceSummary } from '../../../../model/report/pocInvoiceSummary';
import { AuthService } from '../../../../auth/auth.service';
import { BusinessAdminService } from '../../../businessadmin.service';
import { DateUtil } from '../../../../base/util/dateutil';
@Component({
    selector: 'periodicfinancialdetails',
    templateUrl: './periodicfinancialdetails.template.html',
    styleUrls: ['./periodicfinancialdetails.style.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class PeriodicFinancialDetailComponent {
    pocInvoiceSummary: POCInvoiceSummary;
    invoiceReport: Array<PeriodcFinancialStatement>;
    pocRolesList: Array<PocAdviseData>;
    invoiceTypeEnum = InvoiceTypeEnum;
    periodicList: any;
    dateList: Array<any>;
    config: any;
    showMessage: boolean;
    startDate: number;
    endDate: number;
    selectedPoc: PocAdviseData;
    isError: boolean;
    message: Array<string>;
    errorMessage: Array<string>
    selectPeriodic: any;
    viewListFinance: any;
    invoiceTypeConstant = InvoiceTypeConstant;
    isDisplay = true;
    isDate = true;
    downloadReport:any;
    constructor(config: AppConfig,
        private adminService: BusinessAdminService,
        private authService: AuthService, private router: Router,private spinnerService:SpinnerService) {
        this.config = config.getConfig();
        this.dateList = DateUtil.getMonthsList((new Date().getFullYear() - 1));
        this.invoiceTypeEnum = InvoiceTypeEnum;
        this.periodicList = this.adminService.periodicFinanceAction;
        this.selectPeriodic = this.adminService.selectedFinancePeriodic;

    }
    ngOnInit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.selectPeriodic != undefined) {
            window.localStorage.setItem('selectedFinancePeriodic', cryptoUtil.encryptData(JSON.stringify(this.selectPeriodic)));
        } else {
            this.selectPeriodic = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedFinancePeriodic')));
            this.adminService.selectedFinancePeriodic = this.selectPeriodic;
        }
        console.log(("periodicList") + JSON.stringify(this.adminService.periodicFinanceAction));
        console.log("selectperiod" + JSON.stringify(this.adminService.selectedFinancePeriodic));
        if (this.selectPeriodic.summaryTransactionsList && this.selectPeriodic.summaryTransactionsList.length > 0)
            this.selectPeriodic.summaryTransactionsList.forEach(element => {
                element.invoiceTypeLabel = this.getInvoiceTypeLabel(element);
            });
    }
    getInvoiceTypeLabel(summaryList) {
        let label = InvoiceTypeConstant.getLabel(summaryList);
        return label;
    }

    onImageClicked() {
        if (this.selectPeriodic.pdfUrl != undefined) {
            this.authService.openPDF(this.selectPeriodic.pdfUrl);
        }
    }
    backButton() {
        this.router.navigate(['/app/finance/poc/monthlyreport']);
    }
    viewFinance(item) {
        item.invoiceId = this.selectPeriodic.invoiceId;
        this.adminService.viewFinanceTransactionsList = item;
        this.adminService.checkRoutingParameter = 'periodicFinance';
        this.spinnerService.start();
        this.router.navigate(['/app/finance/poc/viewtransactions']);
    }
    exlDownload() {
        let invoiceId;
        invoiceId = this.selectPeriodic.invoiceId,
        // 
        this.adminService.getmonthlyParticularPocReportsXSL(invoiceId).then(response => {
          if (response == undefined || response == null || response.length <= 0) {
            this.isError = true;
            this.showMessage = true;
            this.message = new Array();
            this.errorMessage = new Array();
            this.errorMessage[0] = "No Reports Found";
          } else {
            this.downloadReport = response;
            console.log("download"+JSON.stringify( this.downloadReport))
            if (response.statusCode==200){
              window.location.href = response.data;
            }
          }
        })
        
      }
    }

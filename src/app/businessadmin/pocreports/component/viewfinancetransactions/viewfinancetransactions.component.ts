
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { BusinessAdminService } from '../../../businessadmin.service';
import { AppConfig } from '../../../../app.config';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { TransactionType, InvoiceTypeConstant } from '../../../../constants/report/invoicetypeconstants';
import { PaymentConnst } from '../../../../model/basket/payment';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { PeriodcFinancialStatement } from '../../../../model/report/periodicfinancialstatement ';
import { POCInvoiceSummary } from '../../../../model/report/pocInvoiceSummary';
@Component({
    selector: 'viewfinancetransactions',
    templateUrl: './viewfinancetransactions.template.html',
    styleUrls: ['./viewfinancetransactions.style.scss']
})

export class ViewFinanceTransactionsComponent {
    config: any;
    showMessage: boolean;
    periodicFinancialStatementList: Array<PeriodcFinancialStatement>
    cartItemType: number;
    invoiceId: string;
    bookingType: number;
    bookingSubType: number;
    isError: boolean;
    message: Array<string>;
    errorMessage: Array<string>;
    viewFinancialTransactions: any;
    viewFinanceList: any;
    summaryViewList: any;
    pocInvoiceSummary: Array<POCInvoiceSummary>;
    selectPeriodicList: any;
    PaymentConnst = PaymentConnst;
    TransactionType = TransactionType;
    viewDetail: any;
    viewList: any;
    viewsummaryList: any;
    constructor(config: AppConfig,
        private adminService: BusinessAdminService,
        private authService: AuthService, private router: Router, private spinnerService: SpinnerService) {
        this.config = config.getConfig();
        this.viewFinanceList = this.adminService.viewFinanceTransactionsList;
        this.viewsummaryList = this.adminService.reconciliationDeatilList;
        this.selectPeriodicList = this.adminService.selectedFinancePeriodic;
        this.TransactionType = TransactionType;
        //this.viewDetail = JSON.parse(JSON.stringify(this.adminService.reconciliationDeatilList));
    }
    ngOnInit(): void {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.viewFinanceList != undefined) {
            window.localStorage.setItem('viewFinanceTransactionsList', cryptoUtil.encryptData(JSON.stringify(this.viewFinanceList)));
        } else {
            this.viewFinanceList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('viewFinanceTransactionsList')));
            this.adminService.viewFinanceTransactionsList = this.viewFinanceList;
        }
        console.log(("periodicList") + JSON.stringify(this.adminService.selectedFinancePeriodic));
        this.spinnerService.start();
        this.getViewFinancialTransaction();
    }
    getViewFinancialTransaction() {
        this.showMessage = false;
        this.pocInvoiceSummary = new Array<any>();
        this.spinnerService.start();
        let invoiceId, bookingType, bookingSubType, cartItemType;
        invoiceId = this.viewFinanceList.invoiceId;
        bookingType = this.viewFinanceList.bookingType;
        bookingSubType = this.viewFinanceList.bookingSubType;
        cartItemType = this.viewFinanceList.cartItemType;
        this.adminService.getViewFinancialTransactions(invoiceId, bookingType, bookingSubType, cartItemType).then(response => {
            this.spinnerService.stop();
            if (response == undefined || response == null || response.length <= 0) {
                this.isError = true;
                this.showMessage = true;
                this.message = new Array();
                this.errorMessage = new Array();
                this.errorMessage[0] = "No Reports Found";
            } else {
                this.viewFinancialTransactions = response;
                console.log("view==>" + JSON.stringify(this.viewFinancialTransactions))
                console.log("view123==>" + JSON.stringify(this.viewFinanceList.invoiceId))

            }

            if (this.viewFinancialTransactions && this.viewFinancialTransactions.length > 0) {
                this.viewFinancialTransactions.forEach(viewItem => {
                    viewItem.bookingType = this.getInvoiceTypeLable(this.viewFinanceList);
                });
            }


        })
    }
    backButton() {
        if (this.adminService.checkRoutingParameter == 'periodicFinance') {
            this.router.navigate(['/app/finance/poc/periodicdetails'])

        } else if (this.adminService.checkRoutingParameter == 'reconciliation') {
            this.router.navigate(['/app/finance/platform/reconciliationdetails']);
        }

    }
    getInvoiceTypeLable(viewList) {
        let purchases = InvoiceTypeConstant.getLabel(viewList);
        return purchases
    }


}
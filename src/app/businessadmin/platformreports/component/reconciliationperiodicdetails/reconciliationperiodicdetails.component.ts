import { Router } from '@angular/router';
import { Component, ViewEncapsulation, OnChanges } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { BusinessAdminService } from '../../../businessadmin.service';
import { AuthService } from '../../../../auth/auth.service';
import { InvoiceTypeEnum, InvoiceTypeConstant } from '../../../../constants/report/invoicetypeconstants';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';

@Component({
    selector: 'reconciliationperiodicdetails',
    templateUrl: './reconciliationperiodicdetails.template.html',
    styleUrls: ['./reconciliationperiodicdetails.style.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class ReconciliationPeriodicDetails {
    config: any;
    reconciliationDetail: any;
    invoiceTypeEnum = InvoiceTypeEnum;
    isError = true;
    showMessage = true;
    errorMessage = new Array();
    message = "No Data Found";
    isDisplay = true;
    isDate = true;

    constructor(private authService: AuthService, private adminService: BusinessAdminService,
        config: AppConfig, private router: Router) {
        this.config = config.getConfig();
        this.invoiceTypeEnum = InvoiceTypeEnum;
        this.reconciliationDetail = JSON.parse(JSON.stringify(this.adminService.reconciliationDeatilList));
    }

    ngOnInit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.reconciliationDetail != undefined) {
            window.localStorage.setItem('reconciliationDeatilList', cryptoUtil.encryptData(JSON.stringify(this.reconciliationDetail)));
        }
        else {
            this.reconciliationDetail = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('reconciliationDeatils')));
            this.adminService.reconciliationDeatilList = this.reconciliationDetail;
        }
        if (this.reconciliationDetail.summaryTransactionsList && this.reconciliationDetail.summaryTransactionsList.length > 0) {
            this.reconciliationDetail.summaryTransactionsList.forEach(element => {
                element.invoiceTypeLabel = this.getInvoiceTypeLable(element);
            });
        }
        console.log("reconciliation" + JSON.stringify(this.reconciliationDetail))

    }
    getInvoiceTypeLable(summaryList) {
        let invoice = InvoiceTypeConstant.getLabel(summaryList);
        return invoice
    }
    backButton() {
        this.router.navigate(['/app/finance/platform/settlepayment']);
    }
    onImageClicked() {
        if (this.reconciliationDetail.pdfUrl != undefined) {
            this.authService.openPDF(this.reconciliationDetail.pdfUrl);
        }
    }
    viewReconciliation(item){
        item.invoiceId=this.reconciliationDetail.invoiceId;
        this.adminService.viewFinanceTransactionsList=item;
        this.adminService.checkRoutingParameter = 'reconciliation';
        console.log(JSON.stringify(this.adminService.viewFinanceTransactionsList))
        this.router.navigate(['./app/finance/poc/viewtransactions'])
        
    }


}
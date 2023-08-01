import { InvestigationTestDetails } from "./../../model/diagnostics/investigationTestDetails";
import { InvoiceBaseDetails } from '../basket/invoicebasedetails';
import { ReportFile } from '../phr/reportFile';

export class DiagnosticsAdviseTrack extends InvoiceBaseDetails {

    public serviceList: Array<InvestigationTestDetails> = new Array<InvestigationTestDetails>();
    public fileUrlList: Array<ReportFile> = new Array<ReportFile>();
    public proofDocumentUrlList: Array<String> = new Array<String>();

    public reportId: number;
    public reportUpdatedEmpId: number;


    public doctorAdvise: boolean;
    public date: number;

    public reportPdfUrlWithHeader: string;
    public reportPdfUrlWithoutHeader: string;


    public amountToBePaid: number;
    public amountPaid: number;
    public amountToBeRefunded: number;

    public employeeAccepted: number;
    public employeeAcceptedName: string;

    public acceptedEmpId: number;
    public acceptedEmpName: string;
}

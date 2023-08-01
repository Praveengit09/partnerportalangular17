import { BaseResponse } from './../../model/base/baseresponse'

export class doctordashboardresponse extends BaseResponse {

    public pdfUrlWithHeader: string;
    public pdfUrlWithoutHeader: string;
    public transactionType: number;
    public time: number;
    public avgTime: string;
}

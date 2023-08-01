import { SubTypeAdvise } from './../reception/subTypeAdvise';

import { InvestigationDetails } from "../diagnostics/investigationDetails";
import { InvestigationReportInformation } from '../reception/investigationReportInformation';

export class InvestigationAdvises extends SubTypeAdvise{

    public investigationList: Array<InvestigationDetails>=new Array();
    public investigationReportList: Array<InvestigationReportInformation>=new Array();

}
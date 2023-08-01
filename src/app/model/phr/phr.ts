import { BaseResponse } from './../../model/base/baseresponse'
import { PhrCategory } from './phrCategory'

export class PHR extends BaseResponse {
    public profileId: number;
    public phrType: number;
    public createdTime: number;
    public phr: PhrCategory[] = new Array<PhrCategory>();
    public phrVersion: string;
    public orderId: string;
    public doctorId: number;
}

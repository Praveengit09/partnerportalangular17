import { FileType } from './../../model/common/fileType';
export class IdValue {
    public id: number;
    public value: string;
    public updatedTime: number;
    public userType: number;
    public userId: number;
    public ignoreType: number;
    public unit: string;
    public reportId: number;
    public reportUrl: Array<FileType> = Array();

}

import { FileType } from "./../../model/common/fileType";

export class UploadFileStatusRequest {
    public profileId: number;
    public referenceId: number;
    public reportId: number;
    public type: number;
    public fileUrlList: Array<FileType>;
}

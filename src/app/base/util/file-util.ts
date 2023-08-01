import { Injectable } from '@angular/core'
import { AppConstants } from '../appconstants';
import { HttpService } from '../http.service';
import { URLStringFormatter } from './url-string-formatter';

@Injectable()
export class FileUtil {

    constructor(private httpService: HttpService, private urlStringFormatter: URLStringFormatter) {

    }

    fileUploadToAwsS3(dirName, uploadFile, parentProfileId, unsecured: boolean, retainFileName: boolean): Promise<any> {
        let fileName: string = retainFileName ? uploadFile.name : `${Date.now()}_${uploadFile.name}`.replace(/[<>:"\/\\|?*]+/g, '');
        let dirFileName = dirName && dirName.length > 0 ? `${dirName}/${fileName}` : fileName;
        return new Promise((resolve, reject) => {
            this.httpService.httpGetPromise(
                (parentProfileId && parentProfileId > 0 ?
                    this.urlStringFormatter.format(this.httpService.getPaths().GET_TEMP_UPLOAD_PROFILE_FILE_URL_FROM_SECURE, parentProfileId, dirFileName, unsecured ? true : false)
                    : this.urlStringFormatter.format(this.httpService.getPaths().GET_TEMP_UPLOAD_FILE_URL_FROM_SECURE, dirFileName, unsecured ? true : false)
                ), AppConstants.POZ_BASE_URL_INDEX).then((response) => {
                    let fileData = response.data;
                    this.httpService.uploadFile(fileData.signedUrl, uploadFile).then(res => {
                        return resolve({ key: fileData.fileName, Location: fileData.fileUrl });
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    });
                }).catch((err) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                });
        });
    }
}
import { FileType } from '../common/fileType';
import { BasePhrAnswer } from './basePhrAnswer';

export class ReportFile extends FileType{
    
    public uploadedDate: number;
    public testList:  Array<BasePhrAnswer> ;
}
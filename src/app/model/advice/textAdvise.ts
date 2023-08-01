import { MedicalNote } from "../pharmacy/medicalNote";

export class TextAdvise {
    public  id:number;
    public  title:string="";
    public  note:MedicalNote[]=new Array();

    //local use
    public isSelected:boolean=false;
}
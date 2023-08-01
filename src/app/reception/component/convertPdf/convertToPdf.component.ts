import { Component } from "@angular/core";
import * as _html2canvas from "html2canvas";
// import jsPDF from 'jspdf';
import { ReceptionService } from "../../reception.service";




@Component({
    selector: 'convertToPdf',
    templateUrl: './convertToPdf.template.html',
    styleUrls: ['./convertToPdf.style.scss'],
})

export class ConvertToPdf {
    selectedDoctor: any;
    patientDetails: any;
    currentDate: any


    constructor(private receptionService: ReceptionService) {

    }


    ngOnInit() {
        this.selectedDoctor = this.receptionService.selectedDoctor;
        this.patientDetails = this.receptionService.patientDataToPdf
        this.currentDate = new Date()
        // this.handleExport()
        setTimeout(() => {
            this.handleExport()
        }, 500);
        console.log(this.selectedDoctor);
    }




    handleExport() {
        // const html2canvas: any = _html2canvas;
        // const invoiceContentElement = document.getElementById('invoice_container') as HTMLElement;
        // console.log(invoiceContentElement);

        // html2canvas(invoiceContentElement, {}).then(canvas => {
        //     // is convert the canvas into base64 string url
        //     const imgData = canvas.toDataURL('image/png');
        //     console.log(imgData);

        //     // page width
        //     const pageWidth = 210;
        //     const pageHeight = 297;
        //     // calcuate the image actual height to fit with canvas and pdf
        //     const height = canvas.height * pageWidth / canvas.width;
        //     // initialize the PDF
        //     const pdf = new jsPDF("p", "mm", "a4");
        //     // add the image into pdf
        //     pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, height);

        //     // pdf.save('invoice.pdf');
        //     // pdf.output('dataurlnewwindow');
        //     // pdf.output('bloburi')
        //     window.open(URL.createObjectURL(pdf.output("blob")))
        //     let a = pdf.output('bloburi')
        //     // window.open(a)
        // })
    }

}

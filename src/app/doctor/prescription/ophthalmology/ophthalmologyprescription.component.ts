import { OcularExamination } from "./../../../model/advice/ophthalmology/ocularexamination";
import { EyePower } from "./../../../model/advice/ophthalmology/eyepower";
import { Ophthalmology } from "./../../../model/advice/ophthalmology/ophthalmology";
import { AuthService } from "./../../../auth/auth.service";
import { PatientMedicalAdvise } from "./../../../model/advice/patientMedicalAdvise";
import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { DoctorService } from '../../doctor.service';
import { VideoCardService } from '../videocard/videocard.service';

@Component({
  selector: "ophthalmologyprescription",
  templateUrl: "./ophthalmologyprescription.template.html",
  styleUrls: ["./ophthalmologyprescription.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class OphthalmologyPrescriptionComponent implements OnInit, OnDestroy {

  patientMedicalAdvise: PatientMedicalAdvise;
  print=console.log;

  constructor(
    private doctorService: DoctorService,
    private videoCardService: VideoCardService,
    private authService: AuthService
  ) {
    this.patientMedicalAdvise = this.doctorService.patientMedicalAdvise;
    if (this.patientMedicalAdvise == undefined || this.patientMedicalAdvise == null) {
      this.patientMedicalAdvise = new PatientMedicalAdvise();
    }
    if (!this.patientMedicalAdvise.ophthalmology)
      this.patientMedicalAdvise.ophthalmology = new Ophthalmology();

    if (!this.patientMedicalAdvise.ophthalmology.right)
      this.patientMedicalAdvise.ophthalmology.right = new EyePower();

    if (!this.patientMedicalAdvise.ophthalmology.left)
      this.patientMedicalAdvise.ophthalmology.left = new EyePower();

    if (!this.patientMedicalAdvise.ophthalmology.oe)
      this.patientMedicalAdvise.ophthalmology.oe = new OcularExamination();


  }

  ngOnInit() {

    $("input[type=number]").on("focus", function () {
      $(this).on("keydown", function (event) {
        if (event.keyCode === 38 || event.keyCode === 40) {
          event.preventDefault();
        }
      });
    });

    $('input[type=number]').on('mousewheel.disableScroll', function (e) {
      e.preventDefault()
    });

  }


  ngOnDestroy() {
    this.doctorService.patientMedicalAdvise = this.patientMedicalAdvise;
  }


}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Config } from '../../../../base/config';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Doctor } from '../../../../model/employee/doctor';
import { GetDoctorsBySpecializationRequest } from '../../../../model/reception/getdoctorsbyspecializationrequest';
import { ServiceItem } from '../../../../model/service/serviceItem';
import { ReceptionService } from '../../../reception.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';


@Component({
  selector: 'doctorsearch',
  templateUrl: './doctorsearch.template.html',
  styleUrls: ['./doctorsearch.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class DoctorSearchComponent implements OnInit {

  serviceList: ServiceItem[] = new Array<ServiceItem>();
  serviceId: number;
  searchTerm: string
  serviceName: string;
  emptyString: string = " ";
  doctorsBySpecializationRequest: GetDoctorsBySpecializationRequest = new GetDoctorsBySpecializationRequest();
  doctorList: Doctor[] = new Array<Doctor>();
  defaultDoctorImgUrl = "assets/img/doctor.png";
  error: boolean = false;
  reqDetail: any;

  constructor(private spinnerService: SpinnerService, private router: Router,
    private activatedRoute: ActivatedRoute, private receptionService: ReceptionService) {

  }

  ngOnInit(): void {
    this.getAllServices();
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem('appReqPatDet') != null) {
      this.reqDetail = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('appReqPatDet')));
      this.serviceName = this.reqDetail.serviceName;
      this.serviceId = this.reqDetail.serviceId;
    }
    else {
      this.serviceId = 0;
    }
  }

  getdigiroomBookedSlots(event: any): void {
    this.receptionService.docData = event;
    this.router.navigate(['/app/reception/digibooking/digiroomslots']);
  }

  getAllServices() {
    this.receptionService.getAllServices().then((data) => {
      this.serviceList = data;
    })
  }
  onServiceItemChange(index: number) {
    if (index > 0) {
      this.serviceId = this.serviceList[index - 1].serviceId;
      this.serviceName = this.serviceList[index - 1].serviceName;
    } else {
      this.serviceId = null;
      this.serviceName = undefined;
      this.error = false;
      this.doctorList = new Array<Doctor>();
    }

  }

  onSearchClick() {
    this.doctorsBySpecializationRequest = new GetDoctorsBySpecializationRequest();
    if (this.searchTerm != undefined && this.searchTerm != null && this.searchTerm.length > 0) {
      this.doctorsBySpecializationRequest.searchTerm = this.searchTerm;
    }
    if (this.serviceId != undefined && this.serviceId != null && this.serviceId > 0) {
      this.doctorsBySpecializationRequest.serviceIdList[0] = this.serviceId;
      this.doctorsBySpecializationRequest.serviceName = this.serviceName;
    }
    this.doctorsBySpecializationRequest.brandId = Config.portal.appId;

    this.doctorsBySpecializationRequest.timeConsidered = true;
    this.doctorsBySpecializationRequest.from = 0;
    this.doctorsBySpecializationRequest.size = 20;
    if ((this.searchTerm != null && this.searchTerm.length >= 2) || this.serviceId != null) {
      this.spinnerService.start();
      this.getDoctorsBySpecialization();
    }
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.onSearchClick();
    }
  }
  getDoctorsBySpecialization() {
    this.receptionService.getDoctorListBySpecialization(this.doctorsBySpecializationRequest).then((data) => {
      this.doctorList = data;
      this.spinnerService.stop();
      this.error = false;
      if (this.doctorList == null || this.doctorList == undefined || this.doctorList.length == 0) {
        this.doctorList = new Array();
        this.error = true;
        // alert("Data not found");
      }

    })
  }
}

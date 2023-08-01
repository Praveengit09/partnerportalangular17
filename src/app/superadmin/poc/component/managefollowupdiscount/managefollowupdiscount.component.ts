import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { SuperAdminService } from '../../../superadmin.service';
import { UpdateFollowUpRequest } from '../../../../model/followup/updatefollowuprequest';
import { ReceptionService } from '../../../../reception/reception.service';
import { FollowUpDiscount } from '../../../../model/followup/followupdiscount';
import { PocDetail } from '../../../../model/poc/pocDetails';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { Doctor } from '../../../../model/employee/doctor';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
@Component({
  selector: 'managefollowupdiscount',
  templateUrl: './managefollowupdiscount.template.html',
  styleUrls: ['./managefollowupdiscount.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class ManageFollowupDiscountComponent implements OnInit {
  config: any;
  manageFollowDiscount: UpdateFollowUpRequest = new UpdateFollowUpRequest();
  pocDetails: PocDetail;
  editableByAll: boolean = false;
  applicableToAll: boolean = false;
  fetchedDoctorList: Doctor[] = new Array<Doctor>();
  locPocFollowUpDiscountList: FollowUpDiscount[] = new Array<FollowUpDiscount>();

  constructor(config: AppConfig, private router: Router, private activatedRouter: ActivatedRoute, private authService: AuthService,
    private recepService: ReceptionService, private hsLocalStorage: HsLocalStorage, private superAdminService: SuperAdminService, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
  }

  async ngOnInit() {
    await this.fetchPocDetails();
    this.applicableToAll = this.pocDetails.followUp && this.pocDetails.followUp.applicableToAll;
    if (this.applicableToAll)
      this.applyTests();
    else
      this.getDoctorList(this.pocDetails.pocId);
  }

  fetchPocDetails() {


    this.pocDetails = this.superAdminService.pocDetail;

    if (this.pocDetails) {
      let data = { 'pocDetails': this.pocDetails };
      this.hsLocalStorage.setDataEncrypted('pocDetailloc', data);
    } else {
      let locData = this.hsLocalStorage.getDataEncrypted('pocDetailloc');
      this.pocDetails = locData.pocDetails;
      this.superAdminService.pocDetail = this.pocDetails;
    }
  }

  getDoctorList(pocId) {
    this.spinnerService.start();
    this.recepService.getDoctorList(pocId, 0, 0).then(respList => {
      this.manageFollowDiscount.doctorList = respList;
      this.spinnerService.stop();
      this.fetchedDoctorList = JSON.parse(JSON.stringify(respList));
    }).catch(error => {
      this.spinnerService.stop();
    });
  }
  setLocDiscountForAll() {
    this.locPocFollowUpDiscountList = this.manageFollowDiscount.pocFollowUpDiscountList = new Array();
    let followUp: FollowUpDiscount = new FollowUpDiscount();
    this.manageFollowDiscount.pocFollowUpDiscountList.push(followUp);
    this.locPocFollowUpDiscountList = this.manageFollowDiscount.pocFollowUpDiscountList;
  };
  saveButtonDoctor(index): void {
    this.manageFollowDiscount.editableByAll = false;
    this.manageFollowDiscount.applicableToAll = false;
    if (this.fetchedDoctorList[index].employeePocMappingList) {
      let docPoc = this.fetchedDoctorList[index].employeePocMappingList.filter(poc => poc.pocId == this.pocDetails.pocId)[0]
      this.manageFollowDiscount.doctorList[index].employeePocMappingList.forEach(selPoc => {
        if (selPoc.pocId == docPoc.pocId) {
          if (docPoc.participationSettings.followupDiscountList) {
            docPoc.participationSettings.followupDiscountList.sort(function (f1, f2) { return f1.validityDays - f2.validityDays; });
          }
          selPoc.participationSettings = docPoc.participationSettings;
        }
      });
      this.manageFollowDiscount.pocId = this.pocDetails.pocId
      this.superAdminService.getFollowUpDiscounts(this.manageFollowDiscount).then(data => {
        if (data.statusCode == 201 || data.statusCode == 200) {
          alert("Successfully Updated");
          this.getDoctorList(this.pocDetails.pocId);
        }
        else {
          alert(data.statusMessage)
        }
      });
    }
    else {
      alert("Please fill the Discount and Validity in Days");
    }
  }

  remove(i: number, k: number, j: number): void {
    this.fetchedDoctorList[i].employeePocMappingList[k].participationSettings.followupDiscountList.splice(j, 1);
  }
  removeclick(i: number): void {
    this.locPocFollowUpDiscountList.splice(i, 1);
  }

  addButton(i: number, k): void {
    let addButtonDoctorList = new FollowUpDiscount();
    let x = this.fetchedDoctorList[i].employeePocMappingList[k].participationSettings.followupDiscountList;
    if (!x) {
      this.fetchedDoctorList[i].employeePocMappingList[k].participationSettings.followupDiscountList = new Array();
    }
    this.fetchedDoctorList[i].employeePocMappingList[k].participationSettings.followupDiscountList.push(addButtonDoctorList);
  }

  addApplyButton(): void {
    let followUp: FollowUpDiscount = new FollowUpDiscount();
    this.locPocFollowUpDiscountList.push(followUp);
  }

  applyTests() {
    if (this.applicableToAll) {
      console.log('kri calling' + JSON.stringify(this.pocDetails))
      this.setLocDiscountForAll();
      this.getDoctorList(this.pocDetails.pocId);
    }
  }

  saveButton(): void {
    // this.pocDetails.followUp.editableByAll
    this.manageFollowDiscount.editableByAll = true;
    this.manageFollowDiscount.applicableToAll = true;
    this.manageFollowDiscount.pocId = this.pocDetails.pocId;
    this.fetchedDoctorList.forEach(element => {
      element.employeePocMappingList.forEach(ele => {
        let tempLocFUDList = this.locPocFollowUpDiscountList.filter(ser => ser.discountPercent && ser.validityDays);
        if (ele.pocId == this.pocDetails.pocId) {
          if (this.pocDetails.followUp && tempLocFUDList.length > 0) {
            ele.participationSettings.doctorFollowupDiscountEditable = this.pocDetails.followUp.editableByAll;
          }
          if (!ele.participationSettings.followupDiscountList || ele.participationSettings.followupDiscountList.length <= 0) {
            ele.participationSettings.followupDiscountList = new Array();
            ele.participationSettings.followupDiscountList = this.locPocFollowUpDiscountList;
          } else {
            this.locPocFollowUpDiscountList.forEach(pocFollowUp => {
              // let objn = { ...pocFollowUp, note: [] };
              // let isIncluded = ele.participationSettings.followupDiscountList.includes(objn);
              let isIncluded = ele.participationSettings.followupDiscountList.findIndex(fup => {
                return fup.discountPercent == pocFollowUp.discountPercent && fup.validityDays == pocFollowUp.validityDays
              }) >= 0;
              if (pocFollowUp.discountPercent && pocFollowUp.validityDays && !isIncluded)
                ele.participationSettings.followupDiscountList.push(pocFollowUp);
            });
            ele.participationSettings.followupDiscountList = Array.from(new Set(ele.participationSettings.followupDiscountList).values())
          }
        }
      });
    });

    if (this.locPocFollowUpDiscountList.length > 0) {
      let temp = false;
      this.locPocFollowUpDiscountList.forEach(e => {
        if (!e.discountPercent || !e.validityDays) {
          console.log('execution check');
          temp = true;
          return;
        }
      })

      if (temp) {
        alert("Please fill the Discount and Validity in Days");
        return;
      }
    }
    // else {
    this.manageFollowDiscount.doctorList = this.fetchedDoctorList;
    this.superAdminService.getFollowUpDiscounts(this.manageFollowDiscount).then(data => {
      if (data.statusCode == 201 || data.statusCode == 200) {
        this.getDoctorList(this.pocDetails.pocId);
        this.setLocDiscountForAll();
        alert("successfully updated");
      }
      else if (data.statusCode == 405) {
        alert("followup updation failed");
      }
    });
    // }
  }
}
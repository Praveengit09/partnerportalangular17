import { Component, ViewEncapsulation } from "@angular/core"; 
import { Router } from "@angular/router";
import { AppConfig } from "../../../app.config";
import { AuthService } from "../../../auth/auth.service";
import { HsLocalStorage } from "../../../base/hsLocalStorage.service";
import { CommonUtil } from "../../../base/util/common-util";
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { PocDetail } from "../../../model/poc/pocDetails";
import { ServiceItem } from "../../../model/service/serviceItem";
import { SuperAdminService } from "../../../superadmin/superadmin.service";


@Component({
    selector: 'servicesoffered',
    templateUrl: './servicesoffered.template.html',
    styleUrls: ['./servicesoffered.style.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ServicesOfferedComponent{
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    isErrorCheck: boolean = false;
    pocDetail: PocDetail;

    serviceIndex: number = 1;
    serviceItems: Array<ServiceItem> = new Array();
    itemsCheckedInServiceItemsList: Array<ServiceItem> = new Array();
    rolesMap: Map<number, Array<ServiceItem>> = new Map<number, Array<ServiceItem>>();
    serviceKey: number[] = [1 , 2, 3, 4, 5];
    serviceRole: string[] = ["Additional", "Diagnostic", "Medical", "Wellness", "Home Consultation"];
    list: Array<any>;
    isPocModify: boolean;
    
    constructor(config: AppConfig,
      private superAdminService: SuperAdminService, private auth: AuthService,
      private router: Router, private hsLocalStorage: HsLocalStorage,
       private spinnerService: SpinnerService, private commonUtil: CommonUtil, 
       ) {
  
  
    }

    ngOnInit() {
        window.addEventListener("beforeunload", function (e) {
          var confirmationMessage = "\o/";
          console.log("cond");
          e.returnValue = confirmationMessage;    
          return confirmationMessage;              
        });
        this.list = this.superAdminService.checkedList;
        
        this.pocDetail = this.superAdminService.pocDetail;
        this.isPocModify = this.superAdminService.isPocModify == undefined ? true : this.superAdminService.isPocModify;
        let createPocLoc = this.hsLocalStorage.getDataEncrypted('createPocLoc');
        if (this.pocDetail) {
          let data = { 'pocDetails': this.pocDetail, 'isPocModify': this.isPocModify };
          this.hsLocalStorage.setDataEncrypted('createPocLoc', data);
        } else {
          this.superAdminService.pocDetail = this.pocDetail = createPocLoc.pocDetails;
          this.superAdminService.isPocModify = this.isPocModify = createPocLoc.isPocModify;
          console.log(`pocdetails==>${JSON.stringify(this.pocDetail)}`);
        }
        this.serviceList();
        if (this.pocDetail.serviceList != null || this.pocDetail.serviceList != undefined) {
          this.rolesMap.forEach((value: Array<ServiceItem>, key: number) => {
            console.log(this.list);
    
            setTimeout(() => {
              this.checkedSavedItem();
            }, 200);
          });
        }
        this.auth.setPreventNavigation(true);
      }
    
    
      getValue(key) {
        return this.rolesMap.get(key);
      }
      serviceList(): void {
           $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.superAdminService.getallservices().then(
          response => {
            console.log("Response in serviceList==> " + JSON.stringify(response));
            this.spinnerService.stop();
            if (response != null && response != undefined) {
              this.serviceItems = response;
              for (let i = 0; i < this.serviceItems.length; i++) {
                let key = this.serviceItems[i].serviceType;
               
                if (this.rolesMap.has(key)) {
                  let arr2 = new Array<ServiceItem>();
                  arr2 = this.rolesMap.get(key);
                  arr2.push(this.serviceItems[i]);
                  this.rolesMap.set(key, arr2);
                } else {
                  let arr = new Array<ServiceItem>();
                  arr.push(this.serviceItems[i]);
                  this.rolesMap.set(key, arr);
                }
              }
              this.rolesMap.forEach((value: Array<ServiceItem>, key: number) => {
                console.log("Maps--->" + key, JSON.stringify(value));
              });
              setTimeout(() => {
                this.checkedSavedItem();
              }, 200);
            }
          });
        //  }
      }
    
      checkedSavedItem() {
        console.log("POC-DETAILS ServiceList-->" + JSON.stringify(this.pocDetail.serviceList));
        if (this.pocDetail.serviceList != null) {
          this.list = this.pocDetail.serviceList;
          for (let i = 0; i < this.list.length; i++) {
            console.log("Id-->" + this.list[i].serviceId);
            (<any>$("#" + this.list[i].serviceId)).prop("checked", true)
          }
        }
      }
    
      onValueChecked(item1): void {
        console.log("ooo" + JSON.stringify(item1));
        if (this.list == undefined)
          this.list = new Array<string>();
        if ((<any>$("#" + item1.serviceId + ":checked")).length > 0) {
          this.list.push(item1);
        } else {
          var index = this.list.findIndex(img => img.serviceId === item1.serviceId);;
          this.list.splice(index, 1);
        }
      }
      onWorkplaceSettings(){
        if (this.list == null || this.list == undefined) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "please select atleast one service.";
          this.showMessage = true;
          return;
        }
        else {
          this.isError = false;
          this.errorMessage = new Array();
          this.showMessage = false;
        }
        this.router.navigate(['./pocadmin/sidebar/softweresetting'])
      }
    
      ngOnDestroy(): void {
        console.log('lisssssst---->' + this.list);
        this.superAdminService.checkedList = this.list;
        this.itemsCheckedInServiceItemsList = this.superAdminService.checkedList;
        if (this.pocDetail != undefined && this.pocDetail != null) {
          this.superAdminService.pocDetail = this.pocDetail;
          this.superAdminService.pocDetail.serviceList = this.itemsCheckedInServiceItemsList;
          console.log("POC-DETAILS ServiceList-->" + JSON.stringify(this.superAdminService.pocDetail.serviceList));
    
        }
        this.auth.setPreventNavigation(false);
      }

      skipForNow(){
        this.router.navigate(['./app/dashboard'])
      }
}

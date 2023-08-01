import { AuthService } from './../../auth/auth.service';
import { HttpService } from './../../base/http.service';
import { Injectable } from '@angular/core';
import { AppConstants } from './../../base/appconstants';
import { URLStringFormatter } from './../../base/util/url-string-formatter';

@Injectable()
export class CentralInventryService {

    columnsGetDiagnosisVsMedicineRes: any[];
    columnsManufacturarVsDoctorRes: any[];
    columnManufacturarVsDrugsSoldRes: any[];
    columnTopDrugsSoldRes: any[];
    columnManufacturarVsDiagnosisVsSalesRes: any[];

    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter
    ) {
        this.colomnSetting();
    }



    getMonthlySalesReport(time) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_CENTRAINVENTRY_MONTHLY_SALES_REPORT, time + ""),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getGraphOrderFulfillPerDay(time) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_CENTRAL_GRAPHORDERFULFILL, time + ""),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    diagnosisVsMedicine(disease) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DIAGNOSISVS_MEDICINE, disease + ""),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    manufacturarVsDoctor(drBrand) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_MANUFACTURERVS_DOCTOR, drBrand + ""),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    manufacturarVsDrugs(drBrand) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_MANUFACTURERVS_DRUGS, drBrand + ""),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    topDrugsSold() {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_TOPDRUGS_SOLD,
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    manufacturarVsDiagnosisVsSales(drBrand) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_MANF_VSDIAGNOSIS_VSSALES, drBrand + ""),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getBrandNames() {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_PHARMACY_BRANDNAME, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getSymtomNames() {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_PHARMACY_SYMTOMS, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getSymptomsAndDiagnosisAutocomplete(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SYMPTONMS_AND_DIAGNOSIS_AUTOCOMPLETE,
            JSON.stringify(body), AppConstants.ELASTIC_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getPharmacyDetailsByName(productName: string, productType: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_PHARMACY_DETAILs_BY_NAME, productName, productType),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    updatebasepharmacy(procedurePriceDetail: any): Promise<any> {
        console.log(procedurePriceDetail)
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PRODUCTS,
            JSON.stringify(procedurePriceDetail), AppConstants.POZ_BASE_URL_INDEX).then((data) => {

                return data;
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }


    // getpharmacydeliveries(x): any {
    //     let adminPharmacyDeliveryResponseList: any;
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().GET_PHARMACY_DELIVERIES, JSON.stringify(x), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
    //         adminPharmacyDeliveryResponseList = data;
    //         return Promise.resolve(adminPharmacyDeliveryResponseList);
    //     }).catch((err) => {
    //         if (err) {
    //             console.log(err);
    //             return Promise.reject(err);
    //         }
    //     });
    // }
    colomnSetting() {
        let medicineName = {
            display: 'Medicine Name',
            variable: 'productName',
            filter: 'text',
            sort: true
        };
        let Manufacturer = {
            display: 'Manufacturer',
            variable: 'brandName',
            filter: 'text',
            sort: false
        };
        let genericName = {
            display: 'Composition',
            variable: 'genericMedicine.genericMedicineName',
            filter: 'text',
            sort: true,
        };
        let quantitySold = {
            display: 'Quantity Sold',
            variable: 'quantity',
            filter: 'text',
            sort: true,
            conditions: [{
                value: '',
                condition: 'value',
                label: '0'
            }]
        };
        let totalRevenue = {
            display: 'Total Revenue',
            variable: 'netPrice',
            filter: 'text',
            sort: false,
            conditions: [{
                value: '',
                condition: 'value',
                label: '0'
            }]
        };
        let doctorName = {
            display: "Doctor's Name",
            variable: 'doctorFirstName doctorLastName',
            filter: 'text',
            sort: true
        };
        let diagnosisName = {
            display: "Diagnosis",
            variable: 'name',
            filter: 'text',
            sort: true
        };
        let drugName = {
            display: "Drug Name",
            variable: 'productName',
            filter: 'text',
            sort: true
        }
        let price = {
            display: "Price",
            variable: 'stockDetails.netPrice',
            filter: 'text',
            sort: true,
            conditions: [{
                value: '',
                condition: 'value',
                label: '0'
            }]
        };
        let totalSales = {
            display: "Total Sales",
            variable: 'stockDetails.purchasedQuantity',
            filter: 'text',
            sort: true,
            conditions: [{
                value: '',
                condition: 'value',
                label: '0'
            }]
        };
        let totalSales2 = {
            display: "Total Sales",
            variable: 'quantity',
            filter: 'text',
            sort: true,
            conditions: [{
                value: '',
                condition: 'value',
                label: '0'
            }]
        };
        let totalrevenue2 = {
            display: "Total Revenue",
            variable: 'totalRevenue',
            filter: 'text',
            sort: true,
            conditions: [{
                value: '',
                condition: 'value',
                label: '0'
            }]
        };
        let longdiagnosticName = {
            display: "Long Diagnosis Name",
            variable: 'name',
            filter: 'text',
            sort: true
        };
        let prescibedMedicine = {
            display: "Prescribed Medicine",
            variable: 'productName',
            filter: 'text',
            sort: true
        };

        this.columnsGetDiagnosisVsMedicineRes = [medicineName, Manufacturer, genericName, quantitySold, totalRevenue];
        this.columnsManufacturarVsDoctorRes = [doctorName, diagnosisName, medicineName, quantitySold, totalRevenue];
        this.columnManufacturarVsDrugsSoldRes = [drugName, genericName, price, totalSales, totalrevenue2];
        this.columnTopDrugsSoldRes = [drugName, genericName, Manufacturer, price, totalSales, totalrevenue2];
        this.columnManufacturarVsDiagnosisVsSalesRes = [longdiagnosticName, prescibedMedicine, genericName, price, totalSales2, totalrevenue2];
    }
}

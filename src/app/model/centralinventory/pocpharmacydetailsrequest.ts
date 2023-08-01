export class PocPharmacyDetailsRequest {
    pocId: number=0;
    quantityEquals: number=0;
    quantityGreater: number=0;
    quantityLess: number=0;
    expiryDate: number=0;
    suplierName: string='';
    drugForm: string='';
    genericMedicineName: string='';
    brandName: string='';
}
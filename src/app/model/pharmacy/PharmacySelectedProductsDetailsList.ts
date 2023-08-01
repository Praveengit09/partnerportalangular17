import { Taxes } from '../basket/taxes';
import { PackingInformation } from '../product/packinginformation';
export class PharmacySelectedProductsDetailsList {
    public selectedProductCode;
    public selectedProductname;
    public selectedBatchNumber;
    public selectedExpiry;
    public selectedNetPrice;
    public selectedPurchaseRate;
    public selectedMarginPercent;
    public selectedQuantity;
    public selectedValue;
    public selectedTotalAmount;
    public cgst;
    public sgst;
    public igst;
    /* Local use */
    public selectedSuppliercgst;
    public selectedSuppliersgst;
    public selectedSupplierigst;
    public selectedFreeQuantity;
    public selectedGenericMedicineName;
    public selectedUnitsInPackage;
    public selectedSchedule;
    public selectedRackNo;
    public selectedDrugForm;
    public selectedBrandName;
    public selectedPackingInformation: PackingInformation;
    public marketedBy: string = '';
}
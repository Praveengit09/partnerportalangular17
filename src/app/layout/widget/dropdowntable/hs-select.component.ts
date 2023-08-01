import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from "@angular/core";
import { Subject } from "rxjs/Subject";
import "rxjs/add/observable/of";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";

@Component({
  selector: "hs-select",
  templateUrl: "./hs-select.component.html",
  styleUrls: ["./hs-select.component.scss"]
})
export class HSSelectComponent implements OnInit, OnChanges, OnDestroy {
  // private searchTerms = new Subject<string>();
  selectedProduct: string;
  eventIndex: number = 1;
  scrollValue: number;

  fieldId: string;
  tableId: string;
  searchComponentId: string;
  searchingData: string = '';
  x: number = 5;
  @Input() isOnBlurEffect: boolean = false;
  @Input() isMatEnable: boolean = false;
  @Input() defaultSelectLabel: string;
  @Input() defaultSelectField: string = null;
  @Input() defaultSelected: any;
  @Input() selectColumns: any[];
  @Input() selectTotal: number;
  @Input() hardReset: boolean = false;
  @Input() selectResults: any[];
  @Input() disable: boolean = false;
  @Input() multiCheckVarName: string = '';
  @Output() searchTrigger: EventEmitter<any> = new EventEmitter();
  @Output() selectTrigger: EventEmitter<any> = new EventEmitter();
  @Output() enterTrigger: EventEmitter<any> = new EventEmitter();
  selectedData: any;
  isDataFetched: boolean;
  isSelected: boolean;
  debounceFn: any;

  constructor(private ref: ChangeDetectorRef) {
    this.debounceFn = this.debouncing();
  }

  debouncing() {
    var timer = setTimeout(() => { }, 100);
    return (fn, delay = 200) => {
      clearTimeout(timer);
      timer = setTimeout(() => { fn() }, delay);
    };
  }
  // Push a search term into the observable stream.
  search(term: string, event): void {
    // this.searchTerms.next(term);
    if (
      event.keyCode != 37 &&
      event.keyCode != 38 &&
      event.keyCode != 39 &&
      event.keyCode != 40 &&
      event.keyCode != 13
    ) {
      if (this.debounceFn)
        this.debounceFn(() => { this.emitSearchEvent(term) }, 600)
      else this.emitSearchEvent(term);
      // this.emitSearchEvent(term);
    }
    $("#" + this.tableId).show();
  }
  detectBrowser() {

    if (navigator.userAgent.indexOf("Firefox") > -1) {
      console.log("Firefox");
      this.scrollValue = $(".bg-info").height();
    } else if (navigator.userAgent.indexOf("Opera") > -1) {
      console.log("Opera");
      //did not test
      this.scrollValue = $(".bg-info").height();

    } else if (navigator.userAgent.indexOf("Trident") > -1) {
      console.log("Trident");
      //did not test
      this.scrollValue = $(".bg-info").height();

    } else if (navigator.userAgent.indexOf("Edge") > -1) {
      console.log("Edge");
      //did not test
      this.scrollValue = $(".bg-info").height();
    } else if (navigator.userAgent.indexOf("Chrome") > -1) {
      console.log("Chrome");
      this.scrollValue = $("#HSSelectTableRow" + this.tableId + (this.eventIndex - 1)).height() + 12;
    } else if (navigator.userAgent.indexOf("Safari") > -1) {
      console.log("Safari");
      //did not test
      this.scrollValue = $("#HSSelectTableRow" + this.tableId + (this.eventIndex - 1)).height() + 12;
    } else {
      alert('unkonw browser');
      this.scrollValue = $("#HSSelectTableRow" + this.tableId + (this.eventIndex - 1)).height() + 12;
    }
  }

  eventHandler(event, el) {
    this.detectBrowser();
    console.log(this.scrollValue);
    if (event.key == "ArrowDown") {
      event.preventDefault();
      if (this.eventIndex < this.selectTotal - 1) {
        this.eventIndex++;
        if (this.eventIndex > 2) {
          $(".select_protab" + this.tableId).scrollTop(
            $(".select_protab" + this.tableId).scrollTop() + this.scrollValue
          );
        }
      } else console.log("Down of table");
    } else if (event.key == "ArrowUp") {
      event.preventDefault();
      if (this.eventIndex > 0) {
        this.eventIndex--;
        if (this.eventIndex < this.selectTotal - 2) {
          $(".select_protab" + this.tableId).scrollTop(
            $(".select_protab" + this.tableId).scrollTop() - this.scrollValue
          );
        }
      } else console.log("top of table");
    }
    if (event.keyCode === 9) {
      this.eventIndex = 0;
      $("#" + this.tableId).hide();
    }
    if (
      event.keyCode === 13 &&
      this.selectResults != undefined &&
      this.selectResults != null &&
      this.selectResults.length > 0
    ) {
      var selected = this.selectResults[this.eventIndex];
      this.selected(selected);
      this.eventIndex = 0;
    }
    $("#" + this.fieldId).change(() => {
      var firstDropVal = $("#" + this.tableId).val();
    });
    console.log(this.eventIndex);
  }

  mouseLeaveEvent() {
    // $("#" + this.tableId)
    //   .find("#searchResultData" + (this.eventIndex - 1))
    //   .css({ "background-color": "white", color: "#000" });
    // this.eventIndex = 0;
  }

  mouseEnterEvent(i) {
    this.eventIndex = i;
  }

  eventHandlerTable(event) { }

  ngOnInit(): void {
    // $("#" + this.fieldId).focus();
    this.eventIndex == 1;
    if (this.defaultSelected != undefined && this.defaultSelected != null) {
      this.selectedProduct = this.getRenderString(
        this.defaultSelected,
        this.defaultSelectField,
        null
      );
      this.selectedData = { ...this.defaultSelected };
    }

    // Generating random searchbox text field id for having unique id if used in a list
    let random = Math.floor(Math.random() * 100);
    let random2 = Math.floor(Math.random() * 100);
    let random3 = Math.floor(Math.random() * 100);

    this.fieldId = "search-box-" + random + random2 + random3;
    this.tableId = "search-table-" + random + random2 + random3;
    console.log(this.tableId);
    this.searchComponentId =
      "search-component-" + random + this.defaultSelectField;

    let mouse_is_inside = false;

    $("#" + this.searchComponentId).mouseenter(
      () => {
        mouse_is_inside = true;
      },
      () => {
        mouse_is_inside = false;
      }
    );
    $("body").click(() => {
      if (!mouse_is_inside) {
        $("#" + this.tableId).hide();
      } else {
        $("#" + this.tableId).show();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isDataFetched = true;
    console.log(123)
    if (this.selectResults && this.selectResults.length > 0 && this.multiCheckVarName && this.multiCheckVarName != '') {
      let idList = new Array();
      this.selectResults = this.selectResults.filter(e => {
        if (!idList.includes(e[this.multiCheckVarName])) {
          idList.push(e[this.multiCheckVarName]);
          return true;
        } else return false;
      })
    }
    if (changes["selectTotal"] || changes["defaultSelected"]) {
      if (this.hardReset && (this.defaultSelected != undefined && this.defaultSelected != null) &&
        (this.selectResults == undefined || this.selectResults == null || this.selectResults.length <= 0)) {
        this.selectedProduct = this.getRenderString(this.defaultSelected, this.defaultSelectField, null);
        this.hardReset = false;
      } else if (this.defaultSelected != undefined && this.defaultSelected != null && (this.selectedProduct == null || this.selectedProduct.length <= 0) &&
        (this.selectResults == undefined || this.selectResults == null || this.selectResults.length <= 0)) {
        this.selectedProduct = this.getRenderString(this.defaultSelected, this.defaultSelectField, null);
      }
    }
  }

  emitSearchEvent(searchTerm: string): void {
    if (
      searchTerm != undefined &&
      searchTerm != null &&
      searchTerm.length >= 0
    ) {
      this.searchingData = searchTerm;
      this.searchTrigger.emit(searchTerm);
    } else {
      // $("#" + this.tableId)
      //   .find("#searchResultData" + (this.eventIndex - 1))
      //   .css({ "background-color": "white", color: "#000" });
      // this.eventIndex = 0;
    }
    this.selectResults = new Array<any>();
    this.isDataFetched = false;
    this.isSelected = false;
    this.eventIndex = -1;
  }

  selected(selected: any): void {
    this.selectedProduct = this.getRenderString(
      selected,
      this.defaultSelectField,
      null
    );
    this.selectedData = selected;
    this.isSelected = true;
    this.selectTrigger.emit(selected);
    this.selectResults = new Array<any>();
  }

  enter(enter: any): void {
    this.selectedProduct = this.getRenderString(
      enter,
      this.defaultSelectField,
      null
    );
    this.selectedData = enter;
    this.enterTrigger.emit(enter);
    this.selectResults = new Array<any>();
  }

  getDisplayString(object: any, column: any): string {
    let columnValue = "";
    let columnVariableTmp = column.variable;
    let columnFillerTmp = column.filler;
    columnValue = this.getRenderString(
      object,
      columnVariableTmp,
      columnFillerTmp
    );
    return columnValue;
  }

  //This is a generic method to split mutiple variables and get its value Eg. 'a.b d.e' is
  // two variables a.b and d.e with space as a seperator.
  // A filler value can be used to show between these variable values 'Ram#Lakshman'
  getRenderString(object: any, columnVariable: string, columnFiller: string): string {
    let columnValue: string = "";
    if (columnVariable != undefined && columnVariable != null && columnVariable.indexOf(" ") >= 0) {
      let splitValueColumns = columnVariable.split(" ");
      let i: number = 0;
      while (i < splitValueColumns.length) {
        if (i > 0 &&
          columnFiller != null && columnFiller != undefined && splitValueColumns[i] == columnFiller) {
          columnValue = columnValue + columnFiller;
        }
        columnValue = columnValue + this.generateDisplayString(object, splitValueColumns[i]) + " ";
        i++;
      }
    } else {
      columnValue = this.generateDisplayString(object, columnVariable);
    }
    return columnValue;
  }

  // This method gets the actual value of the varaible from the object.
  // For eg. value of 'a.b' could be 'Ram' in the object passed
  generateDisplayString(object: any, columnVariable: string): string {
    let columnValue = "";
    if (
      object != undefined &&
      object != null &&
      columnVariable != undefined &&
      columnVariable != null &&
      columnVariable.indexOf(".") >= 0
    ) {
      let splitValues = columnVariable.split(".");
      let i: number = 0;
      let obj: any = object;
      while (obj != null && splitValues != null && i < splitValues.length) {
        if (obj[splitValues[i]] != undefined && obj[splitValues[i]] != null) {
          obj = obj[splitValues[i]];
        } else {
          obj = null;
        }
        i++;
      }
      columnValue = obj;
    } else if (
      object != undefined &&
      object != null &&
      columnVariable != null &&
      object[columnVariable] != undefined &&
      object[columnVariable] != null
    ) {
      columnValue = object[columnVariable];
    }
    if (
      columnValue == undefined ||
      columnValue == null ||
      columnValue.length == 0
    ) {
      columnValue = "";
    }
    return columnValue;
  }
  ngOnDestroy() {
    this.eventIndex = -1;
    console.log("Exiting from HS-Select");
  }
  onBlur() {
    if (this.isOnBlurEffect)
      this.selectedProduct = this.getRenderString(
        this.selectedData,
        this.defaultSelectField,
        null
      );
  }
}

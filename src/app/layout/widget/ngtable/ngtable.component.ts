import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColumnDataSource } from './../../../model/ngtable/columnDataSource';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { Config } from './../../../base/config';


@Component({
  selector: 'hs-table',
  templateUrl: './ngtable.template.html',
  styleUrls: ['./ngtable.style.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class NGTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() displayedColumns: Array<string> = new Array<string>();
  @Input() pageSizeOptions = [5, 10, 20, 40];
  @Input() showFirstLastButtons = true;
  @Input() dataSource: MatTableDataSource<ColumnDataSource>;
  @Input() tableDate: any[];
  @Input() defaultSelected: any[] = [];
  @Input() searchPlaceholder: string = "Search";
  @Input() total: number;
  @Input() columns: Array<any> = new Array<any>();
  @Input() pagingList: Array<any> = new Array<any>();
  @Input() showPaging: boolean = true;
  @Input() componentId: string;
  @Input() perPage: number = 10;
  @Input() currentPage: number = 0;
  @Input() sort: any;
  @Input() isStaticPaging: boolean = false;
  @Input() canAddAndRemove: boolean = false;
  @Input() canSearchTableData: boolean = false;
  @Input() canSelectRows: boolean = false;
  @Input() selectedRows: any[] = [];
  @Input() enableDownload: boolean = false;

  //search clear in schedule location
  @Input() isDataChange: boolean = false;

  searchInput: string = "";

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) matSort: MatSort;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter();
  @Output() imageClick: EventEmitter<any> = new EventEmitter();
  @Output() hyperlinkClick: EventEmitter<any> = new EventEmitter();
  @Output() pageClick: EventEmitter<any> = new EventEmitter();
  @Output() pageEvent: EventEmitter<PageEvent> = new EventEmitter();

  @Output() clickEvent: EventEmitter<any> = new EventEmitter();

  selection = new SelectionModel<any>(true, []);
  removedColumns: Array<string> = new Array<string>();
  @Input() dataMsg: string = "";
  label: string;
  defaultSort;
  isFirstChange: boolean = true;
  window = Window;
  enableBackGroundColor: boolean;


  private pageClickSubject = new Subject();
  private pageClickSubscription: Subscription;


  constructor() {
    this.componentId = "NGTableComponent" + (Math.random() * 1000000);
  }

  ngOnInit() {
    console.log(this.columns);

    if (this.pagingList != null &&
      this.pagingList != undefined &&
      this.pagingList.length > 0) {
      this.setTableDate();
    }
    this.isFirstChange = false;
    this.pageClickSubscription = this.pageClickSubject.pipe(
      throttleTime(1000)
    ).subscribe(e => {
      this.pageClick.emit(e)
    });
    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableBackGroundColor) {
      this.enableBackGroundColor = true;
      jQuery(document).ready(function ($) {
        jQuery('thead').addClass('vdcheader');
        jQuery('thead').attr('style', 'background-color: #2e6e91 !important;');
        jQuery('tr.mat-header-row').attr('style', 'background-color: #2e6e91 !important;');
        // jQuery('.table-responsive').attr('style', 'height: 450px;!important');

      });
    } else {
      jQuery(document).ready(function ($) {
        jQuery('thead').addClass('allheader');
      });
    }
  }

  isNaN(data) {
    return isNaN(data);
  }

  setTableDate() {
    this.total = this.pagingList.length;
    let data: any[] = new Array();
    this.displayedColumns = new Array();
    if (this.canSelectRows) {
      this.displayedColumns.push('select')
    }
    this.removedColumns = new Array();
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].sticky && window && window.innerWidth < 1000) {
        this.columns[i].sticky = false;
      }
      if (this.sort != null && this.sort != undefined) {
        if ((this.sort.column + '') == (this.columns[i].variable + '')) {
          this.defaultSort = {
            id: "col_" + i,
            start: (this.sort.descending == true) ? 'desc' : 'asc'
          }
        }
      }
      this.displayedColumns.push("col_" + i);
    }

    for (let i = 0; i < this.pagingList.length; i++) {
      let col: ColumnDataSource = new ColumnDataSource();
      for (let j = 0; j < this.columns.length; j++) {
        if (this.columns[j].filter == 'index' && this.columns[j].type == 'index') {
          col["col_" + j] = '' + (i + 1);
        }
        else if (this.columns[j].filter == 'array-to-string') {
          let str = '';
          if (this.pagingList[i][this.columns[j].variable])
            for (let k = 0; k < this.pagingList[i][this.columns[j].variable].length; k++) {
              str = str + this.pagingList[i][this.columns[j].variable][k][this.columns[j].displayVariable];
              if (this.columns[j].breakFill != null &&
                this.columns[j].breakFill != undefined &&
                k != this.pagingList[i][this.columns[j].variable].length - 1
              ) {
                str = str + this.columns[j].breakFill;
              }
            }
          col["col_" + j] = str;
        } else if (this.columns[j].isMultiBtn) {
          col["col_" + j] = new Array();
          this.columns[j].buttonList.forEach((btn, ix) => {
            col["col_" + j][ix] = "" + this.getLabelOnConditionBased(this.pagingList[i], this.columns[j].variable, btn.conditions)
          });
        }
        else if (this.columns[j].conditions == null || this.columns[j].conditions == undefined || this.columns[j].conditions.length == 0) {
          col["col_" + j] = "" + this.getMultipleObjFromBackSlashN(this.pagingList[i], this.columns[j].variable);
        } else {
          col["col_" + j] = "" + this.getLabelOnConditionBased(this.pagingList[i], this.columns[j].variable, this.columns[j].conditions);
        }
      }
      col.obj = this.pagingList[i];
      for (let j = 0; j < this.defaultSelected.length; j++) {
        if (JSON.stringify(this.pagingList[i]) == JSON.stringify(this.defaultSelected[j])) {
          col.isSelected = true;
          this.selection.select(col);
          break;
        }
      }
      data.push(col);
    }
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    // this.setDefaultSort();
    this.dataSource.sort = this.matSort;
    this.getLabel();

  }

  // setDefaultSort() {
  //   if (this.defaultSort == null || this.defaultSort == undefined) {
  //     return;
  //   }
  //   this.matSort.sort(<MatSortable>{
  //     id: this.defaultSort.id,
  //     start: this.defaultSort.start
  //   }
  //   );
  // }

  getStyleByCondition(obj: any, pathOfValue: string, conditions: any[]) {
    if (conditions == null || conditions == undefined || conditions.length == 0) {
      return '';
    }
    let value: string = this.getMultipleObjFromComma(obj, pathOfValue);
    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i].condition != null &&
        conditions[i].condition != undefined
      ) {
        if (conditions[i].condition == "eq") {
          if (value == '' + conditions[i].value) {
            return conditions[i].style;
          }
        } else if (conditions[i].condition == "lte") {
          if (+value <= conditions[i].value) {
            return conditions[i].style;
          }
        } else if (conditions[i].condition == "gte") {
          if (+value >= conditions[i].value) {
            return conditions[i].style;
          }
        } else if (conditions[i].condition == "value") {
          if (value == conditions[i].value)
            return conditions[i].label;
          else
            return value;
        } else if (conditions[i].condition == "default") {
          return conditions[i].style;
        }
      }
    }
    return "";
  }

  getLabelByFilter(value: any, filter: string) {
    filter = filter.toLowerCase()
    if (filter == "date") {
      let date = new Date(parseInt("" + value));
      return date.toLocaleString().split(',')[0];
    }
    else if (filter == "time") {
      let date = new Date(parseInt("" + value));
      let hr: string = "" + date.getHours();
      let amPm = "AM"
      if (+hr > 12) {
        amPm = "PM";
        hr = '' + ((+hr) - 12);
      }
      if (hr.length == 1) {
        hr = "0" + hr;
      }
      let min: string = "" + date.getMinutes();
      if (min.length == 1) {
        min = "0" + min;
      }
      return hr + ":" + min + " " + amPm;
    } else if (filter == "text") {
      return value.toString();
    } else return value;
  }

  ngAfterViewInit() {
    // if (!this.dataSource.paginator)
    //   this.dataSource.paginator = this.paginator;
    // if (!this.dataSource.sort)
    //   this.dataSource.sort = this.matSort;
  }

  applyFilter(filterValue: string) {

    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource || this.dataSource.filteredData.length == 0) {
      this.dataMsg = 'No Data Found';
    }
  }

  getValueFromStringData(obj: any, pathOfValue: string) {
    let tempValue = JSON.parse(JSON.stringify(obj));
    let objCopy = JSON.stringify(obj);
    let pathArray = this.getPathArrayFromString(pathOfValue);
    for (let i = 0; i < pathArray.length; i++) {
      if (tempValue[pathArray[i]] != null && tempValue[pathArray[i]] != undefined) {
        tempValue = tempValue[pathArray[i]];
      } else if ((i + 1) == pathArray.length) {
        tempValue = tempValue[pathArray[i]];
      }
    }
    if (objCopy === JSON.stringify(tempValue)) {
      return '';
    } else if (tempValue != null && tempValue != undefined) {
      return tempValue;
    } else {
      return "";
    }
  }

  getButtonStyle(object: any, column: any, coldata = ''): string {
    let style = '';
    style = column.style;
    return style;
  }

  getNumberFormat(input) {
    let parsedFloat = !isNaN(parseFloat(input)) ? parseFloat(input).toFixed(2) : input;
    return parsedFloat;
  }

  getDisplayMultiString(object: any, column: any) {
    let columnVariableList = column.variable.split(" ");
    let nameList = column.nameList.split(" ");
    let multiLineList = [];
    if (column && column.isMultiRow && column.mainVar) {
      object && object[column.mainVar] &&
        object[column.mainVar].forEach((item, itemIndex) => {
          let data = [];
          nameList.forEach((element, i) => {
            let l = element.split("_");
            let rowData = (l[0] + "\t" + l[1]).toUpperCase() + "\t:\t" + this.getNumberFormat(item[columnVariableList[i]]) + "";
            data.push(rowData);
          });
          multiLineList[itemIndex] = data;
        })
    } else {
      nameList.forEach((element, i) => {
        let l = element.split("_");
        multiLineList[i] = (l[0] + "\t" + l[1]).toUpperCase() + "\t:\t" + object[columnVariableList[i]];
      });
    }
    return multiLineList;
  }

  getMultipleObjFromBackSlashN(obj: any, pathOfValue: string) {
    let arrayOfPathObj = new Array();
    let value: string = "";
    arrayOfPathObj = (pathOfValue + "").split(/\n/g);
    for (let i = 0; i < arrayOfPathObj.length; i++) {
      if (arrayOfPathObj[i] != "") {
        value = value + ((value.length == 0) ? '' : ' NgTableNewLineBreak ') + this.getMultipleObjFromComma(obj, arrayOfPathObj[i]);
      }
    }
    return value
  }

  getMultipleObjFromComma(obj: any, pathOfValue: string, xf?) {
    let arrayOfPathObj = new Array();
    let value: string = "";
    arrayOfPathObj = (pathOfValue + "").split(',');
    for (let i = 0; i < arrayOfPathObj.length; i++) {
      if (arrayOfPathObj[i] != "") {
        value = value + ((value.length == 0) ? '' : ', ') + this.getMultipleObjFromSpace(obj, arrayOfPathObj[i]);
      }
    }
    return value
  }

  getMultipleObjFromSpace(obj: any, pathOfValue: string) {
    let arrayOfPathObj = new Array();
    let value: string = "";
    arrayOfPathObj = (pathOfValue + "").split(' ');
    for (let i = 0; i < arrayOfPathObj.length; i++) {
      if (arrayOfPathObj[i] != "") {
        value = value + ((value.length == 0) ? '' : ' ') + this.getValueFromStringData(obj, arrayOfPathObj[i]);
      }
    }
    return value;
  }


  getLabelOnConditionBased(obj: any, pathOfValue: string, conditions: any[]) {
    let xs = pathOfValue == "sampleCollectionStatus";
    let value: string = this.getMultipleObjFromComma(obj, pathOfValue, xs);
    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i].condition != null &&
        conditions[i].condition != undefined
      ) {
        if (conditions[i].condition == "eq") {
          if (value == '' + conditions[i].value) {
            return conditions[i].label;
          }
        } else if (conditions[i].condition == "lte") {
          if (+value <= conditions[i].value) {
            return conditions[i].label;
          }
        } else if (conditions[i].condition == "gte") {
          if (+value >= conditions[i].value) {
            return conditions[i].label;
          }
        } else if (conditions[i].condition == "value") {
          if (value == conditions[i].value)
            return conditions[i].label;
          else
            return value;
        } else if (conditions[i].condition == "default") {
          return conditions[i].label;
        }
      }
    }
    return "";
  }

  getPathArrayFromString(pathOfValue: string): any[] {
    let pathArray = new Array();
    let path = pathOfValue.split('.');
    for (let i = 0; i < path.length; i++) {
      let arrayResolve = path[i].split('[');
      if (arrayResolve.length > 1) {
        pathArray.push(arrayResolve[0]);
        for (let j = 1; j < arrayResolve.length; j++) {
          arrayResolve[j] = '' + parseInt(arrayResolve[j].replace(']', ''));
          pathArray.push(arrayResolve[j]);
        }
      }
      else {
        pathArray.push(path[i]);
      }
    }
    return pathArray;
  }

  removeDisplayColumn(col: string) {
    this.displayedColumns.splice(
      this.displayedColumns.indexOf(col), 1
    );
    this.removedColumns.push(col);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isFirstChange == true) {
      return;
    }
    if (this.isDataChange) {
      this.resetTable();
    }
    if (changes['total'] || changes['pagingList']) {
      this.total = (this.pagingList && this.pagingList.length) ? this.pagingList.length : 0;
      if (this.pagingList != null &&
        this.pagingList != undefined &&
        this.pagingList.length > 0) {
        this.setTableDate();
      } else {
        this.setTableDate();
        this.resetTable();
      }
      this.getLabel();
    }


  }

  addColumnToDisplay(col: string) {
    this.removedColumns.splice(
      this.removedColumns.indexOf(col), 1
    );
    this.displayedColumns.push(col);
    this.displayedColumns.sort();
  }

  buttonClicked(response: any): void {
    this.buttonClick.emit(response);
  }

  imageClicked(response: any): void {
    this.imageClick.emit(response);
  }

  hyperlinkClicked(response: any): void {
    this.hyperlinkClick.emit(response);
  }

  clickEventHandler(event, obj) {
    this.clickEvent.emit(
      {
        event: event,
        val: obj
      }
    );
  }

  getPage(pageEvent: PageEvent): void {
    this.getLabel();
    this.pageEvent.emit(pageEvent);
    this.perPage = pageEvent.pageSize;
    this.currentPage = pageEvent.pageIndex;
    if (this.isStaticPaging == true) {
      return;
    }
    if (pageEvent.pageIndex >= ((pageEvent.length / pageEvent.pageSize) - 1)) {
      this.currentPage = pageEvent.pageIndex;
      this.pageClickSubject.next(pageEvent.pageIndex);
    }
  }

  resetTable() {
    this.searchInput = "";
    if (this.dataSource) {
      this.dataSource.filter = "";
    }
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.getLabel();
    this.selection.clear();
    $(".rotate").toggleClass("icon-rotate");
  }

  getLabel() {
    setTimeout(() => {
      let label = '';
      let labelElements = document.getElementById(this.componentId) ? document.getElementById(this.componentId).getElementsByClassName('mat-paginator-range-label') : '';
      let labelElement;
      if (labelElements != null && labelElements != undefined &&
        labelElements[0] != null && labelElements[0] != undefined) {
        labelElement = labelElements[0];
      } else {
        return ''
      }
      if (labelElement.innerText != null &&
        labelElement.innerText != undefined &&
        labelElement.innerText != '') {
        label = (labelElement.innerText + '').split('of')[0];
      } else {
        return '';
      }
      this.label = label;
      return label;
    }, 1);
  }

  isAllSelected(): boolean {
    let fromIndex = this.currentPage * this.perPage;
    let toIndex = fromIndex + this.perPage;
    if (this.dataSource.data.length < toIndex) {
      toIndex = this.dataSource.data.length;
    }
    for (let i = fromIndex; i < toIndex; i++) {
      if (!this.selection.isSelected(this.dataSource.data[i])) return false;
    }
    return true;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      for (let i = 0; i < this.dataSource.data.length; i++) {
        this.dataSource.data[i].isSelected = false;
      }
    }
    else {
      this.selectAllCurrentPageRow();
    }
    this.onSelectChange();
  }

  selectAllCurrentPageRow() {

    let fromIndex = this.currentPage * this.perPage;
    let toIndex = fromIndex + this.perPage;
    if (this.dataSource.data.length < toIndex) {
      toIndex = this.dataSource.data.length;
    }

    for (let i = fromIndex; i < toIndex; i++) {
      this.dataSource.data[i].isSelected = true;
      this.selection.select(this.dataSource.data[i]);
    }
  }

  // clearSelectedRowss(row) {
  //   this.dataSource.data.forEach((ele, i) => {
  //     if (ele.obj.orderId == row.obj.orderId) {
  //       this.dataSource.data[i].isSelected = false;
  //       console.log('currentRowElementclearSelectedRowss', JSON.stringify(this.dataSource.data[i].isSelected));

  //     }
  //   })
  //   this.setTableDate()


  // }

  clearSelectedRows() {
    let fromIndex = this.currentPage * this.perPage;
    let toIndex = fromIndex + this.perPage;
    for (let i = fromIndex; i < toIndex; i++) {
      if (this.dataSource.data[i].isSelected == true) {
        this.dataSource.data[i].isSelected = false;
        this.selection.deselect(this.dataSource.data[i]);
      }

    }
    this.setTableDate()

    // this.onSelectChange(row);

  }





  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  onSelectChange(row?) {
    if (row) {

      row.isSelected = !row.isSelected;
      this.selection.toggle(row);
    }
    let selectedList = new Array();
    for (let i = 0; i < this.selection.selected.length; i++) {
      selectedList.push(this.selection.selected[i].obj)
    }

    this.clickEvent.emit(
      {
        event: "onChecked",
        val: selectedList,
        currentRowElement: row
      }
    );
  }

  downloadExcel() {
    let dataList = [];
    if (this.pagingList && this.pagingList.length > 0 && this.columns && this.columns.length > 0) {
      for (let i = 0; i < this.pagingList.length; i++) {
        let record = {};
        this.columns.forEach(column => {
          if (column.filter != 'action' || (column.filter == 'action' && column.type == 'hyperlink')) {
            if (column.filter == 'array-to-string') {
              let str = '';
              if (this.pagingList[i][column.variable])
                for (let k = 0; k < this.pagingList[i][column.variable].length; k++) {
                  str = str + this.pagingList[i][column.variable][k][column.displayVariable];
                  if (column.breakFill != null &&
                    column.breakFill != undefined &&
                    k != this.pagingList[i][column.variable].length - 1
                  ) {
                    str = str + column.breakFill;
                  }
                }
              record[column.display] = str;
            }
            else if (column.conditions == null || column.conditions == undefined || column.conditions.length == 0) {
              record[column.display] = ("" + this.getMultipleObjFromBackSlashN(this.pagingList[i], column.variable));
              if (column.filter && (column.filter == 'date' || column.filter == 'datetime')) {
                let timeOnlyFormat = 'MMM d, y';
                let dateTimeFormat = 'MMM d, y, h:mm:ss a';
                record[column.display] = (new DatePipe('en')).transform(record[column.display], column.filter == 'date' ? timeOnlyFormat : dateTimeFormat);
              }
            } else {
              record[column.display] = "" + this.getLabelOnConditionBased(this.pagingList[i], column.variable, column.conditions);
              if (column.filter && (column.filter == 'date' || column.filter == 'datetime')) {
                let timeOnlyFormat = 'MMM d, y';
                let dateTimeFormat = 'MMM d, y, h:mm:ss a';
                record[column.display] = (new DatePipe('en')).transform(record[column.display], column.filter == 'date' ? timeOnlyFormat : dateTimeFormat);
              }
            }

          }
        });
        dataList.push(record);
      }
      if (dataList && dataList.length > 0) {
        let headers = Object.keys(dataList[0]);
        var options = {
          fieldSeparator: ',',
          quoteStrings: '"',
          decimalseparator: '.',
          showLabels: true,
          showTitle: false,
          useBom: true,
          noDownload: false,
          headers: headers,
          useHeader: true,
          nullToEmptyString: true,
        };
        new AngularCsv(dataList, 'Table Data', options);
      }
    }
  }

  ngOnDestroy() {
    this.pageClickSubscription.unsubscribe();
  }

}


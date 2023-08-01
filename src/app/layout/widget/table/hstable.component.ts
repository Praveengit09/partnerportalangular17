import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'hs-old-table',
  templateUrl: './hstable.template.html',
  styleUrls: ['./hstable.style.scss']
})
export class HSTableComponent implements OnChanges, OnInit {

  @Input() componentId: string;
  @Input() columns: any[];
  @Input() sort: any;
  @Input() perPage: number;
  @Input() currentPage: number = 1;
  @Input() total: number;
  @Input() pagingList: any[];
  @Input() isStaticPaging: boolean = false;
  @Input() showPaging: boolean = true;
  @Input('isNoDataFoundVisible') noDataFoundShow: boolean = false;

  data: any[] = new Array<any>();
  finalData: any[] = new Array<any>();
  dataSorted: number = 0;

  isError2: boolean;
  show: boolean;
  messages = new Array<string>();

  multiLineList = new Array();

  @Output() buttonClick: EventEmitter<any> = new EventEmitter();
  @Output() imageClick: EventEmitter<any> = new EventEmitter();
  @Output() hyperlinkClick: EventEmitter<any> = new EventEmitter();
  @Output() pageClick: EventEmitter<any> = new EventEmitter();

  constructor(private cd: ChangeDetectorRef) {
    this.getPage(1);
  }

  ngAfterViewInit() {
    if (this.cd)
      this.cd.detectChanges();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.nodataErrorCtrl();
    }, 500);
  }

  showMessages(messages: Array<string>, show: boolean) {
    return show && messages != null && messages.length > 0;
  }

  getMessageStyle() {
    return this.isError2 ? 'errorMessages' : 'successMessages';
  }

  selectedClass(columnName: string, sort: boolean): string {
    return (sort ? (columnName == this.sort.column ? 'sort-' + this.sort.descending : 'sort-default') : '');
  }

  changeSorting(columnName: string, canSort: boolean): void {

    if (!canSort) {
      return;
    }
    var sort = this.sort;

    if (sort.column == columnName) {
      this.data = this.sortData(sort.column, sort.descending);
      sort.descending = !sort.descending;
      this.dataSorted = 1;
    } else {
      sort.column = columnName;
      this.data = this.sortData(sort.column, sort.descending);
      sort.descending = !sort.descending;
      this.dataSorted = 1;
    }
  }

  //This method is sort whole data when clicked on particular column
  sortData(sortingValue, sortParameter) {
    if (sortParameter) {
      this.pagingList.sort(function (a, b) {
        let hsTableComponent = new HSTableComponent(null);
        let dataA = hsTableComponent.getRenderString(a, sortingValue, '');
        let dataB = hsTableComponent.getRenderString(b, sortingValue, '');
        if (typeof dataA == 'string' && typeof dataB == 'string') {
          if (dataA != undefined && dataB != undefined) {
            if (dataA.toLowerCase() < dataB.toLowerCase()) return -1;
            if (dataA.toLowerCase() > dataB.toLowerCase()) return 1;
            return 0;
          } else {
            return -1;
          }
        } else {
          if (dataA < dataB) return -1;
          if (dataA > dataB) return 1;
          return 0;
        }
      })
    } else {
      this.pagingList.sort(function (a, b) {
        let hsTableComponent = new HSTableComponent(null);
        let dataA = hsTableComponent.getRenderString(a, sortingValue, '');
        let dataB = hsTableComponent.getRenderString(b, sortingValue, '');
        if (typeof dataA == 'string' && typeof dataB == 'string') {
          if (dataA != undefined && dataB != undefined) {
            if (dataB.toLowerCase() < dataA.toLowerCase()) return -1;
            if (dataB.toLowerCase() > dataA.toLowerCase()) return 1;
            return 0;
          } else {
            return -1;
          }
        } else {
          if (dataB < dataA) return -1;
          if (dataB > dataA) return 1;
          return 0;
        }
      })
    }

    return this.pagingList;
  }

  convertSorting(): string {
    return this.sort.descending ? '-' + this.sort.column : this.sort.column;
  }


  getDisplayString(object: any, column: any): string {
    let columnValue = '';
    let columnVariableTmp = column.variable;
    let columnFillerTmp = column.filler;
    columnValue = this.getRenderString(object, columnVariableTmp, columnFillerTmp);
    columnValue = this.generateConditionalString(object, column, columnValue, false);
    return columnValue;
  }
  getDisplayMultiString(object: any, column: any) {
    let columnVariableList = column.variable.split(" ");
    let nameList = column.nameList.split(" ");
    // columnVariableList.forEach((element, i) => {
    // this.multiLineList[i] = (element).toUpperCase() + "\t:\t" + object[element];
    // });
    nameList.forEach((element, i) => {
      let l = element.split("_");
      // if (object[columnVariableList[i]])
      this.multiLineList[i] = (l[0] + "\t" + l[1]).toUpperCase() + "\t:\t" + object[columnVariableList[i]];
    });
    return this.multiLineList;
  }

  //This is a generic method to split mutiple variables and get its value Eg. 'a.b d.e' is 
  // two variables a.b and d.e with space as a seperator.
  // A filler value can be used to show between these variable values 'Ram#Lakshman'
  getRenderString(object: any, columnVariable: string, columnFiller: string): string {
    let columnValue: string = '';
    if (columnVariable != undefined && columnVariable != null && columnVariable.indexOf(' ') >= 0) {
      let splitValueColumns = columnVariable.split(" ");
      let i: number = 0;
      while (i < splitValueColumns.length) {
        if (i > 0 && columnFiller != null && columnFiller != undefined && splitValueColumns[i] == columnFiller) {
          if (columnValue != null && columnValue != undefined) {
            columnValue = columnValue.trim() + columnFiller;
          }
        }
        columnValue = columnValue + this.generateDisplayString(object, splitValueColumns[i]) + ' ';
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
    let columnValue = '';
    if (object != undefined && object != null && columnVariable != undefined && columnVariable != null && columnVariable.indexOf('.') >= 0) {
      let splitValues = columnVariable.split(".");
      let i: number = 0;
      let obj: any = object;
      while (obj != null && splitValues != null && i < splitValues.length) {
        if (splitValues[i].endsWith('[0]')) {
          obj = this.get0thIndexValue(splitValues[i], obj)
          // Added this condition to read the first element in an array
          // let tmpSplit: string = splitValues[i].replace('[0]', '');
          // let tmpObj = obj[tmpSplit];
          // if (tmpObj != undefined && tmpObj != null && tmpObj.length > 0) {
          //   obj = tmpObj[0];
          // }
        } else {
          obj = obj[splitValues[i]];
        }
        i++;
      }
      columnValue = obj;
    } else if (object != undefined && object != null && columnVariable != undefined && columnVariable != null && columnVariable.endsWith('[0]')) {
      columnValue = this.get0thIndexValue(columnVariable, object);
    } else if (object != undefined && object != null && columnVariable != null
      && object[columnVariable] != undefined && object[columnVariable] != null) {
      columnValue = object[columnVariable];
    }
    if (columnValue == undefined || columnValue == null || columnValue.length == 0 || columnValue == '[object Object]') {
      columnValue = '';
    }
    return columnValue;
  }

  get0thIndexValue(tempVariable: string, object: any): any {
    // This method reads the first element in an array
    let columnValue = '';
    let tmpSplit: string = tempVariable.replace('[0]', '');
    let tmpObj = object[tmpSplit];
    if (tmpObj != undefined && tmpObj != null && tmpObj.length > 0) {
      columnValue = tmpObj[0];
    }
    return columnValue;
  }

  generateConditionalString(object: any, column: any, columnValue: string, findStyle: boolean): string {
    if (column.conditions != undefined && column.conditions != null && column.conditions.length > 0) {
      for (let i: number = 0; i < column.conditions.length; i++) {
        let foundMatch: boolean = false;
        switch (column.conditions[i].condition) {
          case "eq":
            if (columnValue == column.conditions[i].value) {

              if (findStyle) {
                columnValue = column.conditions[i].style;
              } else if (column.conditions[i].fieldValue != undefined && column.conditions[i].fieldValue != null && column.conditions[i].fieldValue.length > 0) {
                let tempResponse = this.getRenderString(object, column.conditions[i].fieldValue, null);
                if (tempResponse != undefined && tempResponse != null && tempResponse.length > 0) {
                  columnValue = tempResponse;
                } else {
                  columnValue = '';
                }
              } else {
                columnValue = column.conditions[i].label;
              }
              foundMatch = true;
            }
            break;
          case "neq":
            if (columnValue != column.conditions[i].value) {
              if (findStyle) {
                columnValue = column.conditions[i].style;
              } else if (column.conditions[i].fieldValue != undefined && column.conditions[i].fieldValue != null && column.conditions[i].fieldValue.length > 0) {
                let tempResponse = this.getRenderString(object, column.conditions[i].fieldValue, null);
                if (tempResponse != undefined && tempResponse != null && tempResponse.length > 0) {
                  columnValue = tempResponse;
                } else {
                  columnValue = '';
                }
              } else {
                columnValue = column.conditions[i].label;
              }
              foundMatch = true;
            }
            break;
          case "gt":
            if (columnValue > column.conditions[i].value) {
              if (findStyle) {
                columnValue = column.conditions[i].style;
              } else if (column.conditions[i].fieldValue != undefined && column.conditions[i].fieldValue != null && column.conditions[i].fieldValue.length > 0) {
                let tempResponse = this.getRenderString(object, column.conditions[i].fieldValue, null);
                if (tempResponse != undefined && tempResponse != null && tempResponse.length > 0) {
                  columnValue = tempResponse;
                } else {
                  columnValue = '';
                }
              } else {
                columnValue = column.conditions[i].label;
              }
              foundMatch = true;
            }
            break;
          case "gte":
            if (columnValue >= column.conditions[i].value) {
              if (findStyle) {
                columnValue = column.conditions[i].style;
              } else if (column.conditions[i].fieldValue != undefined && column.conditions[i].fieldValue != null && column.conditions[i].fieldValue.length > 0) {
                let tempResponse = this.getRenderString(object, column.conditions[i].fieldValue, null);
                if (tempResponse != undefined && tempResponse != null && tempResponse.length > 0) {
                  columnValue = tempResponse;
                } else {
                  columnValue = '';
                }
              } else {
                columnValue = column.conditions[i].label;
              }
              foundMatch = true;
            }
            break;
          case "lt":
            if (columnValue < column.conditions[i].value) {
              if (findStyle) {
                columnValue = column.conditions[i].style;
              } else if (column.conditions[i].fieldValue != undefined && column.conditions[i].fieldValue != null && column.conditions[i].fieldValue.length > 0) {
                let tempResponse = this.getRenderString(object, column.conditions[i].fieldValue, null);
                if (tempResponse != undefined && tempResponse != null && tempResponse.length > 0) {
                  columnValue = tempResponse;
                } else {
                  columnValue = '';
                }
              } else {
                columnValue = column.conditions[i].label;
              }
              foundMatch = true;
            }
            break;
          case "lte":
            if (columnValue <= column.conditions[i].value) {
              if (findStyle) {
                columnValue = column.conditions[i].style;
              } else if (column.conditions[i].fieldValue != undefined && column.conditions[i].fieldValue != null && column.conditions[i].fieldValue.length > 0) {
                let tempResponse = this.getRenderString(object, column.conditions[i].fieldValue, null);
                if (tempResponse != undefined && tempResponse != null && tempResponse.length > 0) {
                  columnValue = tempResponse;
                } else {
                  columnValue = '';
                }
              } else {
                columnValue = column.conditions[i].label;
              }
              foundMatch = true;
            }
            break;
          case "default": {
            if (findStyle) {
              columnValue = column.conditions[i].style;
            } else if (column.conditions[i].fieldValue != undefined && column.conditions[i].fieldValue != null && column.conditions[i].fieldValue.length > 0) {
              let tempResponse = this.getRenderString(object, column.conditions[i].fieldValue, null);
              if (tempResponse != undefined && tempResponse != null && tempResponse.length > 0) {
                columnValue = tempResponse;
              } else {
                columnValue = '';
              }
            } else {
              columnValue = column.conditions[i].label;
            }
            foundMatch = true;
            break;
          }
        }
        if (foundMatch) {
          break;
        }
      }
    }
    return columnValue;
  }

  getButtonStyle(object: any, column: any): string {
    let style = '';
    if (column.conditions != undefined && column.conditions != null && column.conditions.length > 0) {
      style = this.generateDisplayString(object, column.variable);
      style = this.generateConditionalString(object, column, style, true);
    } else {
      style = column.style;
    }
    return style;
  }

  getButtonLabel(object: any, column: any): string {
    let label: string = '';
    if (column.conditions != undefined && column.conditions != null && column.conditions.length > 0) {
      label = this.generateDisplayString(object, column.variable);
      label = this.generateConditionalString(object, column, label, false);
      if (label == undefined && label == null && column.label != null) {
        label = column.label;
      }
    } else if (column.variable != undefined && column.variable != null) {
      label = this.generateDisplayString(object, column.variable);
      if ((label == undefined || label == null) && column.label != undefined && column.label != null) {
        // Added this block to be backward compatible with the already defined table configurations.
        // This column.variable block has been added later (12-03-18)
        label = column.label;
      }
    } else {
      label = column.label;
    }
    return label;
  }
  getHrefLabel(object: any, column: any): string {
    let href: string = '';
    if (column.conditions != undefined && column.conditions != null && column.conditions.length > 0) {
      href = this.generateDisplayString(object, column.variable);
      href = this.generateConditionalString(object, column, href, false);
      if (href == undefined && href == null && column.href != null) {
        href = column.href;
      }
    } else {
      href = column.href;
    }
    return href;
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

  //This method sort data at the time of page load and split it into pages
  arraySorting(sortingValue, sortParameter) {
    var Exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
    if (sortingValue.match(Exp)) {
      console.warn('In arraySorting >> Regex Matched');
      if (sortParameter) {
        this.pagingList.sort(function (a, b) {
          let hsTableComponent = new HSTableComponent(null);
          let aValue = hsTableComponent.getRenderString(a, sortingValue, '');
          let bValue = hsTableComponent.getRenderString(b, sortingValue, '');
          return parseInt(bValue) - parseInt(aValue);
        })
      } else {
        this.pagingList.sort(function (a, b) {
          let hsTableComponent = new HSTableComponent(null);
          let aValue = hsTableComponent.getRenderString(a, sortingValue, '');
          let bValue = hsTableComponent.getRenderString(b, sortingValue, '');
          return parseInt(aValue) - parseInt(bValue);
        })
      }
    } else {
      var reA = /[^a-zA-Z]/g;
      var reN = /[^0-9]/g;
      if (sortParameter && this.pagingList != undefined && this.pagingList != null && this.pagingList.length > 0) {
        this.pagingList.sort(
          function (a, b) {
            let hsTableComponent = new HSTableComponent(null);
            let aValue = hsTableComponent.getRenderString(a, sortingValue, '');
            let bValue = hsTableComponent.getRenderString(b, sortingValue, '');
            var AInt = parseInt(aValue, 10);
            var BInt = parseInt(bValue, 10);
            if (aValue != undefined && bValue != undefined) {
              if (isNaN(AInt) && isNaN(BInt)) {
                var aA = aValue.replace(reA, "");
                var bA = bValue.replace(reA, "");
                if (aA === bA) {
                  var aN = parseInt(aValue.replace(reN, ""), 10);
                  var bN = parseInt(bValue.replace(reN, ""), 10);
                  return aN === bN ? 0 : bN > aN ? 1 : -1;
                } else {
                  return bA > aA ? 1 : -1;
                }
              } else if (isNaN(AInt)) {//A is not an Int
                return 1;//to make alphanumeric sort first return -1 here
              } else if (isNaN(BInt)) {//B is not an Int
                return -1;//to make alphanumeric sort first return 1 here
              } else {
                return BInt > AInt ? 1 : -1;
              }
            }
            return 0;
          });
      } else if (this.pagingList != undefined && this.pagingList != null && this.pagingList.length > 0) {
        this.pagingList.sort(
          function (a, b) {
            let hsTableComponent = new HSTableComponent(null);
            let aValue = hsTableComponent.getRenderString(a, sortingValue, '');
            let bValue = hsTableComponent.getRenderString(b, sortingValue, '');
            var AInt = parseInt(aValue, 10);
            var BInt = parseInt(bValue, 10);
            if (aValue != undefined && bValue != undefined) {
              if (isNaN(AInt) && isNaN(BInt)) {
                var aA = aValue.replace(reA, "");
                var bA = bValue.replace(reA, "");
                if (aA === bA) {
                  var aN = parseInt(aValue.replace(reN, ""), 10);
                  var bN = parseInt(bValue.replace(reN, ""), 10);
                  return aN === bN ? 0 : aN > bN ? 1 : -1;
                } else {
                  return aA > bA ? 1 : -1;
                }
              } else if (isNaN(AInt)) {
                return 1;
              } else if (isNaN(BInt)) {
                return -1;
              } else {
                return AInt > BInt ? 1 : -1;
              }
            }
            return 0;
          });
      } else {
        console.log('Sort parameter is not defined, or paging list data is not loaded yet');
      }
    }
    return this.pagingList;
  }

  getPage(currPage: number): void {
    if (this.showPaging) {
      if (this.sort != undefined && this.dataSorted == 0) {
        this.finalData = this.arraySorting(this.sort.column, this.sort.descending);
      } else {
        this.finalData = this.pagingList;
      }
      this.currentPage = currPage;
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;

      if (this.finalData != undefined && this.finalData != null && this.finalData.length > 0) {
        this.data = this.finalData.slice(start, end);
      }
      if (!this.isStaticPaging && this.currentPage == (this.total / this.perPage) && this.total > this.perPage) {
        this.pageClick.emit(currPage);
      }
    } else if (this.finalData != undefined && this.finalData != null && this.finalData.length > 0) {
      this.data = this.finalData;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['total'] || changes['pagingList']) {
      this.data = this.pagingList;
      this.total = this.pagingList ? this.pagingList.length : 0;
      this.getPage(this.currentPage);
      this.nodataErrorCtrl();
    }
  }

  nodataErrorCtrl() {
    if (this.pagingList && this.pagingList.length == 0 && this.noDataFoundShow) {
      this.messages = new Array<string>();
      this.isError2 = true;
      this.show = true;
      this.messages.push("No Data Found");
    } else {
      this.isError2 = false;
      this.show = false;
    }
  }

  getCounter(object, column) {
    if (object && column && column.variable
      && object[column.variable]) {
      let columnValue = object[column.variable];
      let now: number = new Date().getTime();
      let timeDiff: number = (+columnValue - +new Date().getTime());
      timeDiff /= 1000;
      let seconds = Math.round(timeDiff % 60);
      timeDiff = Math.floor(timeDiff / 60);
      let minutes = Math.round(timeDiff % 60);
      timeDiff = Math.floor(timeDiff / 60);
      let hours = Math.round(timeDiff % 24);
      timeDiff = Math.floor(timeDiff / 24);
      let days = Math.round(timeDiff % 7);
      timeDiff = Math.floor(timeDiff / 7);
      let weeks = timeDiff;

      let returnString = weeks + "w " + days + "d";
      if (weeks <= 0) {
        returnString = days + "d " + hours + "h";
        if (days <= 0) {
          returnString = hours + "h " + minutes + "m";
          if (hours <= 0) {
            returnString = minutes + "m " + seconds + "s";
            if (minutes <= 0) {
              if (seconds <= 0) {
                returnString = '';
              } else {
                returnString = seconds + "s";
              }
            }
          }
        }
      }
      return returnString;
    } else {
      return '';
    }
  }

}
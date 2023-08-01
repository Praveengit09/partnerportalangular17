import { Config } from './../../../../base/config';
import { PocSearch } from './../../../../model/poc/pocSearch';
import { PocDetail } from './../../../../model/poc/pocDetails';
import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { UtilComponentsService } from '../uticomponent.service';

@Component({
  selector: 'pocsearch',
  templateUrl: './pocsearch.template.html',
  encapsulation: ViewEncapsulation.None,
})
export class PocSearchComponent implements OnInit, OnChanges {

  @Input() isMatEnable = true;
  @Input() placeholder: string = 'Enter Centre Name';
  @Input() excludePocIds = [];
  @Input() isDisable = false;
  @Input() isBrandBiased = false;
  @Input() selectedPoc = new PocDetail();
  @Output('onPocSelect') onPocSelect = new EventEmitter<PocDetail>();
  selectedPocVar: any = new PocDetail();
  selectColumns: any[] = [{ variable: 'pocName', filter: 'text' }];
  pocListLength = 0;
  searchedPocList = [];
  refreshHSSelect = true;
  constructor(private utilCompoService: UtilComponentsService) { }

  ngOnInit() {
    this.selectedPocVar = { ...this.selectedPoc };
  }
  ngOnChanges() {
    //refresh page
    if (!this.selectedPoc.pocName) {
      this.refreshHSSelect = !this.refreshHSSelect;
      this.searchedPocList = [];
      setTimeout(() => {
        this.refreshHSSelect = !this.refreshHSSelect;
        $('.hs-select').focus();
      }, 50)
    }
    this.pocListLength = 0;
    this.selectedPocVar = { ...this.selectedPoc };
  }

  searchPoc(key: string) {
    this.searchedPocList = new Array();
    let searchRequest = new PocSearch();
    searchRequest.searchTerm = key.trim();
    if (this.isBrandBiased) searchRequest.brandId = Config.portal.appId;
    if (searchRequest.searchTerm && key.length > 2) {
      this.utilCompoService.getPocDetails(searchRequest).then((searchedPocs) => {
        this.pocListLength = searchedPocs.length;
        this.searchedPocList = searchedPocs.filter(poc => { return !this.excludePocIds.includes(poc.pocId) });
      });
    }
  }
  onSelectPoc(selectedPoc) {
    this.onPocSelect.emit(selectedPoc);
  }
}


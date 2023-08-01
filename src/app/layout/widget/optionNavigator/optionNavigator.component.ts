import { Component, OnInit, ViewEncapsulation, EventEmitter, Output, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
@Component({
    selector: 'optionNavigator',
    templateUrl: './optionNavigator.template.html',
    styleUrls: ['./optionNavigator.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class OptionNavigatorComponent implements OnInit, OnChanges, OnDestroy {

    @Input() currentPageIndex: number = 0;
    @Input() tabData = [];
    @Input('allBtnActive') isModify: boolean = true;
    @Output() pageChange: EventEmitter<any> = new EventEmitter()
    @Input('lastEditedPage') lastEditedPage;
    tempEditPage = 0;
    saveIndex = { 'tempEditPage': this.tempEditPage };
    constructor() { this.getTempEdit(); }
    ngOnInit(): void { }
    ngOnChanges(changes: SimpleChanges) {
        if (this.lastEditedPage != null && this.lastEditedPage != undefined && this.lastEditedPage != this.tempEditPage) this.tempEditPage = this.lastEditedPage;
        this.tempEditPage < this.currentPageIndex ? this.tempEditPage = this.currentPageIndex : '';
        this.saveIndex.tempEditPage = this.tempEditPage;
        localStorage.setItem('lastEditIndex', JSON.stringify(this.saveIndex));
        console.log(this.isModify, this.currentPageIndex, this.tempEditPage, this.lastEditedPage);
    }
    ngOnDestroy(): void {
        localStorage.removeItem('lastEditIndex');
    }
    onPageNavigate(pageIndex) {
        if (pageIndex < this.currentPageIndex || this.isModify)
            this.currentPageIndex = pageIndex;
        else if (pageIndex <= this.tempEditPage) {
            this.currentPageIndex = pageIndex;
        }
        if (this.currentPageIndex == pageIndex)
            this.pageChange.emit({ pageControl: 'OptionNavChange', pageType: this.currentPageIndex, lastEditedPage: this.tempEditPage });
    }
    getTempEdit() {
        let dx: any = localStorage.getItem('lastEditIndex');
        if (dx && this.tempEditPage == 0) {
            this.saveIndex = JSON.parse(dx);
            this.tempEditPage = this.saveIndex.tempEditPage;
        }
    }

}
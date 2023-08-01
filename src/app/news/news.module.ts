import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ROUTES } from './news.routing';
import { CommonModule } from '@angular/common';
import { NewsComponent } from './news.component';






@NgModule({
    imports: [
        CommonModule,
      ROUTES,
      BrowserModule
      
    ],
    declarations: [
        NewsComponent
     
    ],
    providers: [
    
    ]
  })
  export class NewsModule {
  }
  
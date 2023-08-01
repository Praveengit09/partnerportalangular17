import { Component, ViewEncapsulation} from '@angular/core';
import { AppConstants } from '../base/appconstants';
import { HttpService } from '../base/http.service';
import { HttpClient } from '@angular/common/http';



@Component({
    selector: 'news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.css'],
    encapsulation: ViewEncapsulation.None
  })
  export class NewsComponent{
    constructor( private httpService: HttpService,private http:HttpClient){}
    ngOnInit(){
        this.apiCall()
    }
   
    // return this.httpService.httpGetPromise("mediastack/getnews", AppConstants.POZ_BASE_URL_INDEX).then((newsFeed) => {
       

    
    newsFeed:any=[]
    stockData:any=[]
    weatherReport:any=[]
    recipies:any=[]
    showData=[]
    stocks=[]
    stocksMeta=[]
    showStocks=false
    showNewsData=false
    showWeather=false
    showReciepe=false


    apiCall(){
        this.http.get("https://api-qa8.healthsignz.net/POZAppServices/mediastack/getnews")
        .subscribe((product:any) => { 
            console.log(product.newsFeed)
          this.newsFeed=product.data, 
          console.log(this.newsFeed);
        }
          )
          this.http.get("https://api-qa8.healthsignz.net/POZAppServices/mediastack/getstocks")
          .subscribe((product:any) => { 
              console.log(product.stockData)
            this.stocks=product.values, 
            this.stocksMeta=product.meta
            console.log(this.stockData);
          }
            )
            this.http.get(" https://api-qa8.healthsignz.net/POZAppServices/mediastack/getweather")
            .subscribe((product:any) => { 
                console.log(product.newsFeed)
              this.weatherReport=product, 
              console.log(this.weatherReport);
            }
              )
              this.http.get("https://api-qa8.healthsignz.net/POZAppServices/mediastack/getrecipe")
              .subscribe((product:any) => { 
                  console.log(product)
                this.recipies=product.hits, 
                console.log(this.recipies);
              }
                )
      }
      assignData(value:number){
        console.log(value);
        
         if(value==1){
        console.log(value);
        this.showData=[]
        this.showData=this.newsFeed
        this.showNewsData=true
        this.showReciepe=false
       this.showWeather=false
       this.showStocks=false




        }
        else if(value==2){
        console.log(value);
        this.showStocks=true
       this.stocks=this.stocks
       this.showNewsData=false
       this.showWeather=false
       this.showReciepe=false


        }
        else if(value==3){
        console.log(value);
        this.showWeather=true
        this.showNewsData=false
        this.showStocks=false
        this.showReciepe=false



        //  this.showData=this.weatherReport
        }
        else if(value==4){
        console.log(value);
        console.log(this.recipies);
         this.showWeather=false
        this.showNewsData=false
        this.showStocks=false
        this.showReciepe=true

        }
        
      }

  }
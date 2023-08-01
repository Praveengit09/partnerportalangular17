import { Routes, RouterModule } from '@angular/router';
import { NewsComponent } from './news.component';




const routes: Routes = [
  {
    path:'news', component: NewsComponent
  }  
];

export const ROUTES = RouterModule.forChild(routes);

import { NgModule } from '@angular/core';
import { ToasterComponent } from './toaster.component';
import { ToasterService } from './toaster.service';
@NgModule({
    declarations: [ToasterComponent],
    providers: [ToasterService],
    exports:[ToasterComponent]
})
export class ToasterModule {

}
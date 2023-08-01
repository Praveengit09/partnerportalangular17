import { editSavedTemplatesComponent } from './savedTemplates/editSavedTemplate/editSavedTemplates.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';

import { SavedFavoritesRoute } from './savedTemplates.routing';
import { savedTemplatesComponent } from './savedTemplates/savedTemplates.component';
import { cdssOptionsComponent } from './cdssOptions/cdssOptions.component';
import { PrescriptionFavoritesComponent } from './prescriptionFavorites/prescriptionFavorites.component';
import { ReferralNetworkComponent } from './referralNetwork/referralNetwork.component';


@NgModule({
    imports: [
        CommonModule,
        SavedFavoritesRoute,
        //Ng2CompleterModule,

        WidgetModule,
        UtilsModule,
        FormsModule
    ],
    declarations: [
        savedTemplatesComponent,
        ReferralNetworkComponent,
        editSavedTemplatesComponent,
        cdssOptionsComponent,
        PrescriptionFavoritesComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    exports: [
    ]
})
export class SavedFavoritesModule {
}
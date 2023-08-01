import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Config } from '../../base/config';

@NgModule({
    imports: [
        CommonModule,
        AgmCoreModule.forRoot({
            apiKey: Config.portal && Config.portal.googleMapAPIKey && Config.portal.googleMapAPIKey.length > 0 ? Config.portal.googleMapAPIKey : "AIzaSyCuOM5p-AskBenKaRqW1EGsr4EItt8d8PI",
            libraries: ["places", 'visualization']
        }),
    ],
    exports: [CommonModule, AgmCoreModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AgmKeyModule { }

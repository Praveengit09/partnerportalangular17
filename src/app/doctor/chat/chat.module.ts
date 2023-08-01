import { FormsModule } from '@angular/forms';
import { ChatRoomComponent } from './chatroom/chatroom.component';
import { ChatRoute } from './chat.routing';
import { ChatComponent } from './chat.component';
import { ChatService } from './chat.service';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { WidgetModule } from '../../layout/widget/widget.module';
import { ChatDateFormatterPipe } from './chatroom/chatDateFormatterPipe';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChatRoute,
        WidgetModule,
        MatFormFieldModule,
        MatInputModule
    ],
    declarations: [
        ChatComponent,
        ChatRoomComponent,
        ChatDateFormatterPipe
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        ChatService
    ],
    exports:[
        ChatComponent,
        ChatRoomComponent
    ]
})
export class ChatModule {
}
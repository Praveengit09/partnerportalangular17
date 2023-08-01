import { ChatRoomComponent } from './chatroom/chatroom.component';
import { ChatComponent } from './chat.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

export const routes = [
  {
    path: '', component: ChatComponent,
    children: [
      { path: 'room/:id', component: ChatRoomComponent },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoute { }
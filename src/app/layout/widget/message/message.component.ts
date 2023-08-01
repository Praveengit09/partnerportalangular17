import { Component, Input } from '@angular/core';

@Component({
  selector: 'hs-message',
  templateUrl: './message.template.html',
  styleUrls: ['./message.style.scss']
})
export class MessageComponent {
  @Input() messages: Array<string>;
  @Input() show: boolean;
  @Input() isError: boolean;

  showMessages(messages: Array<string>, show: boolean) {
    return show && messages != null && messages.length > 0;
  }

  getMessageStyle() {
    return this.isError ? 'errorMessages' : 'successMessages';
  }
}

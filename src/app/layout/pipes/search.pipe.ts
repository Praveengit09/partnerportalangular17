import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'SearchPipe',
  pure: true
})
@Injectable()
export class SearchPipe implements PipeTransform {

  transform(value, args?): Array<any> {
    // console.log("transform: " + value + ">>>" + JSON.stringify(args));
    let searchText = new RegExp(args, 'ig');
    /* if (value) {
      return value.filter(conversation => {
        console.log("conversation: " + conversation.name);
        if (conversation.name) {
          return conversation.name.search(searchText) !== -1 ||
            conversation.lastMessage.search(searchText) !== -1;
        } else {
          if (conversation.text) {
            return conversation.text.search(searchText) !== -1;
          }
        }
      });
    } */
    return args.filter(conversation => {
      return (conversation.slotBookingDetailsList[0].patientProfileDetails.contactInfo.mobile === value) ||
        (conversation.slotBookingDetailsList[0].patientProfileDetails.fName == value);
    })
  }
}

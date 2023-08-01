import { DoctorDetails } from './../../model/employee/doctordetails';
import { Router } from '@angular/router';
import { ChatUserRecord } from './../../model/chat/chatUserRecord';
import { ChatService } from './chat.service';
import { AuthService } from '../../auth/auth.service';
import { Component, ViewEncapsulation, OnInit, OnDestroy, HostListener } from "@angular/core";
import { SpinnerService } from '../../layout/widget/spinner/spinner.service';
import { ChatUtil } from '../../base/util/chat-util';
import { ToasterService } from '../../layout/toaster/toaster.service';


@Component({
  selector: "chat",
  templateUrl: "./chat.template.html",
  styleUrls: ["./chat.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class ChatComponent implements OnInit, OnDestroy {

  contactList: Array<ChatUserRecord>;
  doctorSearchResults: Array<DoctorDetails>;
  userId: number;
  constructor(private spinnerService: SpinnerService,
    private router: Router,
    private chatService: ChatService,
    private toast: ToasterService,
    private authService: AuthService) {
    this.getDoctorContactList(this.authService.userAuth.employeeId);
  }

  getDoctorContactList(doctorId: number) {
    this.contactList = this.chatService.contactList;
    if (!this.contactList || this.contactList.length == 0) {
      this.chatService.contactList = new Array();
      this.chatService.getDoctorContactList(doctorId).then((list) => {
        this.chatService.contactList = JSON.parse(JSON.stringify(list));
        if (this.chatService.contactList && this.chatService.contactList.length > 0 && this.chatService.contactList[0]) {
          this.router.navigate(['./app/doctor/chat/room/' + this.chatService.contactList[0].userType + '-' + (this.chatService.contactList[0].userType == ChatUserRecord.PATIENT_TYPE ? this.chatService.contactList[0].parentProfileId : this.chatService.contactList[0].empId)]);
          this.chatService.toContact = this.chatService.contactList[0];
          this.userId = (this.chatService.contactList[0].userType == ChatUserRecord.PATIENT_TYPE ? this.chatService.contactList[0].parentProfileId : this.chatService.contactList[0].empId);
        }
      });
    }
  }

  ngOnInit() {
    console.log('ngOnInit');
    this.initChatEvents();
  }

  updateChatRoom(note: string) {
    console.log(note);
    this.chatService.sortContacts();
    this.getContactList();
  }

  initChatEvents() {
    this.chatService.addUserToChat(this.authService.userAuth.employeeId);
    this.chatService
      .getAllContactConversation()
      .subscribe((response) => {
        if (response && (response.empId == this.authService.userAuth.employeeId)) {
          this.chatService.contactList = response.contactList;//con
          if (this.chatService.contactList && this.chatService.contactList.length > 0 && this.chatService.contactList[0]) {
            this.chatService.listenForContactOnlineStatus();
            let contact = this.chatService.contactList[0];
            this.router.navigate(['./app/doctor/chat/room/' + + contact.userType + '-' + (contact.userType == ChatUserRecord.PATIENT_TYPE ? contact.parentProfileId : contact.empId)]);
            this.chatService.toContact = this.chatService.contactList[0];
            this.userId = (contact.userType == ChatUserRecord.PATIENT_TYPE ? contact.parentProfileId : contact.empId);
          }
        }
      })
  }
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    this.chatService.disconnetSocket();
}


  ngOnDestroy() {
    console.log('ngOnDestroy');
    this.chatService.disconnetSocket();
  }

  getImageOfContact(contact: ChatUserRecord) {
    if ((contact.imageUrl) && (contact.imageUrl != '') && (contact.imageUrl != ' ')) {
      return contact.imageUrl;
    }
    else return 'assets/img/avatar.png';
  }

  openConversion(contact: ChatUserRecord) {
    contact.noOfUnreadConversations = 0;
    this.chatService.toContact = contact;
    if (contact && (contact.empId || contact.parentProfileId)) {
      this.router.navigate(['./app/doctor/chat/room/' + contact.userType + '-' + (contact.userType == ChatUserRecord.PATIENT_TYPE ? contact.parentProfileId : contact.empId)]);
      this.userId = (contact.userType == ChatUserRecord.PATIENT_TYPE ? contact.parentProfileId : contact.empId);
    }
  }

  getTimeFromNow(time) {
    return ChatUtil.getTimeFromNow(time);
  }

  isSelectedContact(contact: ChatUserRecord): boolean {
    if (contact.userType == this.chatService.toContact.userType
      && ((contact.userType == ChatUserRecord.PATIENT_TYPE &&
        contact.parentProfileId == this.chatService.toContact.parentProfileId)
        || (contact.userType == ChatUserRecord.EMP_TYPE &&
          contact.empId == this.chatService.toContact.empId))) {
      return true
    }
    return false;
  }

  searchContacts(searchElement) {
    if ((searchElement + '').length < 3) {
      this.doctorSearchResults = new Array();
      return;
    }
    this.chatService.searchForDoctors({
      from: 0,
      indexName: "Doctors",
      isDigi: false,
      searchTerm: searchElement,
      size: 50
    }).then((data) => {
      this.doctorSearchResults = JSON.parse(JSON.stringify(data));
    }).catch((err) => {
      console.log(err)
      this.doctorSearchResults = new Array();
    })
  }

  addDocToContactList(doctor: DoctorDetails) {
    let index = this.getContactList().findIndex(e => { return e.empId == doctor.empId });
    if (index >= 0) {
      this.toast.show('Doctor exists in your contact list', "bg-danger text-white font-weight-bold", 3000);
      return;
    }
    this.chatService.addDocToContactList({
      "empId": this.authService.userAuth.employeeId,
      "userType": ChatUserRecord.EMP_TYPE,
      "inviteContact": {
        "empId": doctor.empId,
        "userType": ChatUserRecord.EMP_TYPE
      }
    }).then((data) => {
      if (data.statusCode == 200 || data.statusCode == 201) {
        this.doctorSearchResults = new Array();
        this.getDoctorContactList(this.authService.userAuth.employeeId);
        let contact: ChatUserRecord = new ChatUserRecord();
        contact.empId = doctor.empId;
        contact.firstName = doctor.firstName;
        contact.lastName = doctor.lastName;
        contact.updatedTimestamp = new Date().getTime();
        contact.userType = ChatUserRecord.EMP_TYPE;
        contact.imageUrl = doctor.imageUrl;
        contact.gender = doctor.gender;
        contact.lastConversationTime = new Date().getTime();
        contact.noOfUnreadConversations = 0;
        contact.conversations = [];

        $('#doc-search-input').val('');
        if (this.chatService.contactList && this.chatService.contactList.length > 0)
          this.chatService.contactList.unshift(contact)
        else this.chatService.contactList = [contact]
      }
    }).catch((err) => {

    })
  }

  getContactList() {
    return this.chatService.contactList || [];
  }
}
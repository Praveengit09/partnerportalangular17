import { Component, ViewEncapsulation, OnInit, OnDestroy, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { ChatUserRecord } from './../../../model/chat/chatUserRecord';
import { ChatService } from './../chat.service';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../auth/auth.service';
import { ChatUtil } from '../../../base/util/chat-util';
import { ChatMessage } from '../../../model/chat/chatmessage';
import { FileUtil } from '../../../base/util/file-util';
import { DocumentInfo } from '../../../model/chat/documentinfo';

@Component({
  selector: "chatroom",
  templateUrl: "./chatroom.template.html",
  styleUrls: ["./chatroom.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class ChatRoomComponent implements OnInit, OnChanges, OnDestroy {
  files: any = '';
  fileLocation: any;
  imageDetails: DocumentInfo;
  message = '';
  typingName = '';
  typeTime = 0;
  @Input() userId: number;
  @Output("update") update = new EventEmitter<any>();
  doctorId: number;
  contactTo: ChatUserRecord;
  uploadFilesList: any

  ImageUrl: any;

  countFromMessage: number = 0;

  constructor(private spinnerService: SpinnerService,
    private chatService: ChatService,
    private authService: AuthService,
    private fileUtil: FileUtil) {
    this.doctorId = this.authService.userAuth.employeeId;
  }

  ngOnInit() {
    this.initChatEvents();
    if (this.contactTo && !this.contactTo.roomId) {
      this.contactTo.roomId = this.chatService.generateRoomId(this.contactTo);
    }
  }

  ngOnChanges() {
    this.contactTo = this.chatService.toContact;
    if (!this.contactTo.roomId) {
      this.contactTo.roomId = this.chatService.generateRoomId(this.contactTo);
    }
    console.log(this.userId);
    this.message = "";

    this.onScrollReachTop()

  }

  onScrollReachTop() {
    let self = this;
    $(document).ready(function () {
      $("#sent-messages").scroll(function () {
        var x = $("#sent-messages").scrollTop();
        if (x == 0) {
          self.countFromMessage = self.countFromMessage + 50;
          self.chatService.countFromMessage = self.countFromMessage;
          console.log(self.contactTo.conversations.length);
          self.chatService.loadChats()
        }
      });
    })
  }

  private initChatEvents() {

    this.chatService.getMessages()
      .subscribe((messages) => {
        if (!messages || +messages.receiverId == 0) {
          return
        }

        let isSameUserMessage = false;
        if (+messages.senderType == ChatUserRecord.EMP_TYPE && +messages.senderId == this.authService.userAuth.employeeId) {
          isSameUserMessage = true;
        }
        // If the sender is not self, or self from another window
        let contactIndex: number = -1;
        for (let index = 0; index < this.chatService.contactList.length; index++) {
          let tmpUserId = this.chatService.contactList[index].userType == ChatUserRecord.PATIENT_TYPE ? +this.chatService.contactList[index].parentProfileId : +this.chatService.contactList[index].empId;
          if ((isSameUserMessage && +messages.receiverId == +tmpUserId) || (+messages.senderId == +tmpUserId)) {
            contactIndex = index;
            break;
          }
        }
        if (!isSameUserMessage && contactIndex == -1) {
          let newDoc: ChatUserRecord = new ChatUserRecord();

          if (+messages.senderType == ChatUserRecord.EMP_TYPE) {
            newDoc.empId = +messages.senderId;
          } else {
            newDoc.parentProfileId = +messages.senderId;
          }
          newDoc.firstName = messages.senderName;
          newDoc.lastConversationTime = messages.sentTimestamp;
          newDoc.noOfUnreadConversations = 1;
          newDoc.conversations = [messages];
          newDoc.onlineStatus = 1;
          newDoc.userType = +messages.senderType;
          this.chatService.contactList.unshift(newDoc);
        } else {
          if (!this.chatService.contactList[contactIndex].conversations) {
            this.chatService.contactList[contactIndex].conversations = [];
          }
          this.chatService.contactList[contactIndex].conversations.push(messages);
          this.chatService.contactList[contactIndex].noOfUnreadConversations += 1;
        }

        this.chatService.sortContacts();
        $(document).ready(function () {
          $("#sent-messages").animate({ scrollTop: $('#sent-messages')[0].scrollHeight }, 1000);
        });
      });

    this.chatService
      .isUsertyping(this.contactTo.roomId)
      .subscribe(({ status }) => {
        console.log(status)
        if (status > 0) {
          this.typingName = this.contactTo.firstName;
          let typeTime = this.typeTime = new Date().getTime();
          setTimeout(() => {
            if (typeTime == this.typeTime) {
              console.log(typeTime + 2050 >= new Date().getTime());
              console.log(typeTime);
              console.log(new Date().getTime());
              this.typingName = ''
            }
          }, 2000);
        } else {
          this.typingName = '';
        }
      });
    this.chatService.onReconnect();
    $("#sent-messages").animate({ scrollTop: $('#sent-messages')[0].scrollHeight }, 1000);

    this.chatService.getPreviousChats().subscribe((prvMessages) => {
      prvMessages.forEach((prvmessage) => {
        this.contactTo.conversations.unshift(prvmessage);
      })
    })
  }

  ngOnDestroy() {

  }

  sendMessage() {
    if (this.fileLocation) {
      let imageContent = this.chatService.getChatImgContent(this.authService.userAuth, this.chatService.toContact, this.imageDetails)//,message=icon
      imageContent.isSelf = 0;
      this.chatService.contactList.forEach((contact) => {
        let tmpUserId = contact.userType == ChatUserRecord.PATIENT_TYPE ? contact.parentProfileId : contact.empId;
        if (tmpUserId == this.userId) {
          if (!contact.conversations) {
            contact.conversations = [];
          }
          contact.conversations.push(imageContent);
          contact.lastConversationTime = new Date().getTime();
        }
      });
      this.chatService.sendMessageImage(this.imageDetails);
      this.contactTo.noOfUnreadConversations = 0;
      this.imageDetails = null;
      this.message = ''
      this.fileLocation = ''
      this.chatService.sortContacts();
      this.update.emit('newMessageSent');
      $(document).ready(function () {
        $("#sent-messages").animate({ scrollTop: $('#sent-messages')[0].scrollHeight }, 1000);
      }); $(document).ready(function () {
      })
    }
    else {
      if (!this.message.trim()) {
        return;
      }
      let messageContent = this.chatService.getChatContent(this.authService.userAuth, this.chatService.toContact, this.message);
      messageContent.isSelf = 0;
      this.chatService.contactList.forEach(contact => {
        let tmpUserId = contact.userType == ChatUserRecord.PATIENT_TYPE ? contact.parentProfileId : contact.empId;
        if (tmpUserId == this.userId) {
          if (!contact.conversations) {
            contact.conversations = [];
          }
          contact.conversations.push(messageContent);
          contact.lastConversationTime = new Date().getTime();
        }
      });
      this.chatService.sendMessage(this.message);
      this.contactTo.noOfUnreadConversations = 0;
      this.message = '';
      this.chatService.sortContacts();
      this.update.emit('newMessageSent');
      $(document).ready(function () {
        $("#sent-messages").animate({ scrollTop: $('#sent-messages')[0].scrollHeight }, 1000);
      });
    }
  }
  onclickphoto(mes) {
    this.ImageUrl = mes.documentInfo.url;
  }

  getTimeFromNow(time) {
    return ChatUtil.getTimeFromNow(time);
  }

  typing(event) {
    if (event.keyCode == 13) {
      return this.sendMessage();
    } else {
      this.chatService.userTyping(this.contactTo.roomId);
    }
  }

  getImageOfContact(contact: ChatUserRecord) {
    if ((contact.imageUrl) && (contact.imageUrl != '') && (contact.imageUrl != ' ')) {
      return contact.imageUrl;
    }
    else return 'assets/img/avatar.png';
  }

  attachFile() {
    $("#fileLoader").click();
  }
  getImage(event) {
    console.log(event);
    this.files = event.target.files[0]
    console.log(this.files[0]);
    console.log(this.files.name + 'size:  ' + this.files.size + ' type: ' + this.files.type + ' path ' + this.files.webkitRelativePath);
    this.uploadPic()
  }

  uploadPic() {
    if (this.files === undefined || this.files === null) {
      return;
    }
    else if (this.files.length > 0) {
      for (let file of this.files) {
        if (file.name.endsWith('.jpg') || file.name.endsWith('.JPG') || file.name.endsWith('.png') || file.name.endsWith('.PNG')) {
        }
        else {
          console.log('in uploading image file does not math');
        }
      }
    }
    this.fileUtil.fileUploadToAwsS3('Image/chat', this.files, 0, true, false).then((awsS3FileResult: any) => {
      if (!awsS3FileResult) {
        console.log('err')
        return;
      }
      else {
        this.fileLocation = awsS3FileResult.Location
        console.log('awsurl' + awsS3FileResult.Location);
        this.imageDetails = {
          name: this.files.name,
          size: this.files.size,
          extension: this.files.type,
          url: awsS3FileResult.Location
        }
        console.log(this.imageDetails);
      }
    }).catch(err => {
    });
    console.log('upload file to aws');
  }

  remove() {
    this.fileLocation = ''
  }


  getRetrivalLabel(message: ChatMessage): string {
    if (message.messageDeliveryStatus == ChatMessage.MESSAGE_NOT_DELIVERED) {
      return '';//not delivered
    } else if (message.messageDeliveryStatus == ChatMessage.MESSAGE_DELIVERED) {
      return 'delivered';
    } else if (message.messageDeliveryStatus == ChatMessage.MESSAGE_READ) {
      return 'read';
    }
    else return "";
  }

  getConversations() {
    if (!this.contactTo.conversations) {
      this.contactTo.conversations = [];
    }
    console.log(this.contactTo.conversations);
    return this.contactTo.conversations;
  }

}
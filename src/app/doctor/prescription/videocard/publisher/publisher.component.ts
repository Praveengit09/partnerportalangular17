import { DoctorService } from './../../../doctor.service';
import { Component, ElementRef, AfterViewInit, ViewChild, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ToasterService } from '../../../../layout/toaster/toaster.service';

@Component({
  selector: 'app-publisher',
  templateUrl: './publisher.component.html',
  styleUrls: ['./publisher.component.css']
})
export class PublisherComponent implements AfterViewInit, OnChanges {
  @ViewChild('publisherDiv', { static: false }) publisherDiv: ElementRef;
  @Input() session: OT.Session;
  publisher: OT.Publisher;
  publishing: Boolean;

  @Input() maskVideoEnabled: Boolean = false;
  @Input() muteAudio: Boolean = false;
  @Input() muteVideo: Boolean = false;
  @Input() changeCamera: Boolean = false;

  constructor(private doctorService: DoctorService, private toast: ToasterService) {
    this.publishing = false;
  }

  ngAfterViewInit() {
    const OT = this.doctorService.getOT();
    let self = this;
    this.publisher = OT.initPublisher(this.publisherDiv.nativeElement,
      { insertMode: 'replace', name: 'Doctor', style: { buttonDisplayMode: 'auto' } }, function (error) {
        if (error) {
          if (error.name === 'OT_USER_MEDIA_ACCESS_DENIED') {
            self.toast.show('You have not given permissions for audio/video. Please provide audio/video permissions for patients to view you.', "bg-warning text-white font-weight-bold", 6000);
          } else {
            self.toast.show('Failed to get access to your camera or microphone. Please check that your webcam is connected and not being used by another application and try again.', "bg-warning text-white font-weight-bold", 6000);
          }
          self.publisher.destroy();
          self.publisher = null;
        } else {
          console.log('Publisher initialized.');
        }
      });

    if (this.session) {
      if (this.session['isConnected']()) {
        this.publish();
      }
      this.session.on('sessionConnected', () => this.publish());
    }
  }

  publish() {
    let self = this;
    if (this.publisher) {
      this.session.publish(this.publisher, (err) => {
        if (err) {
          switch (err.name) {
            case "OT_NOT_CONNECTED":
              self.toast.show('Publishing your video failed. You are not connected to the internet.', "bg-warning text-white font-weight-bold", 6000);
              break;
            case "OT_CREATE_PEER_CONNECTION_FAILED":
              self.toast.show('Publishing your video failed. This could be due to a restrictive firewall.', "bg-warning text-white font-weight-bold", 6000);
              break;
            default:
              self.toast.show("An unknown error occurred while trying to publish your video. Please try again later.", "bg-warning text-white font-weight-bold", 6000);
          }
          self.publisher.destroy();
          self.publisher = null;
          console.log("Error occurred while publishing the video", err);
          // this.reconnectVideo();
        } else {
          this.publishing = true;
          self.session.on("archiveStarted", (event) => {
            console.log("event-archiveStarted", event)
          })
          self.session.on("archiveStopped", (event) => {
            console.log("event-archiveStopped", event)
          })
          self.session.on("connectionCreated", (event) => {
            console.log("event-connectionCreated", event)
          })
          self.session.on("connectionDestroyed", (event) => {
            console.log("event-connectionDestroyed", event)
          })
          self.session.on("sessionConnected", (event) => {
            console.log("event-sessionConnected", event)
          })
          self.session.on("sessionDisconnected", (event) => {
            console.log("event-sessionDisconnected", event)
          })
          self.session.on("sessionReconnected", (event) => {
            console.log("event-sessionReconnected", event)
          })
          self.session.on("sessionReconnecting", (event) => {
            console.log("event-sessionReconnecting", event)
          })
          self.session.on("signal", (event) => {
            console.log("event-signal", event)
          })
          self.session.on("streamCreated", (event) => {
            console.log("event-streamCreated", event)
          })
          self.session.on("streamDestroyed", (event) => {
            console.log("event-streamDestroyed", event)
          })
          self.session.on("streamPropertyChanged", (event) => {
            console.log("event-streamPropertyChanged", event)
          })

        }
      });
    }
  }

  reconnectVideo() {
    this.toast.show('Reconnecting video . . .', "bg-warning text-white font-weight-bold", 3000);
    this.doctorService.isVideo = false;
    setTimeout(() => {
      this.doctorService.isVideo = true;
    }, 10)
  }

  ngOnDestroy() {
    if (this.publisher) {
      if (this.session) {
        this.session.unpublish(this.publisher);
      }
      this.publisher.destroy();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['maskVideoEnabled']) {
      this.toggleVideoBlur();
    }
    if (changes['muteAudio']) {
      this.onAudioToggle();
    }
    if (changes['muteVideo']) {
      this.onVideoToggle();
    }
    if (changes['changeCamera']) {
      this.onCameraChange();
    }
  }

  toggleVideoBlur() {
    if (this.publisher) {
      if (this.maskVideoEnabled) {
        this.publisher.applyVideoFilter({ "type": "backgroundBlur", "blurStrength": "high" });
      } else {
        this.publisher.clearVideoFilter();
      }
    }
  }

  onAudioToggle() {
    if (this.publisher) {
      if (this.muteAudio) {
        this.publisher.publishAudio(false);
      } else {
        this.publisher.publishAudio(true);
      }
    }
  }

  onVideoToggle() {
    if (this.publisher) {
      if (this.muteVideo) {
        this.publisher.publishVideo(false);
      } else {
        this.publisher.publishVideo(true);
      }
    }
  }

  onCameraChange() {
    if (this.publisher) {
      this.publisher.cycleVideo().then(result => { console.log('switching video') });
    }
  }
}

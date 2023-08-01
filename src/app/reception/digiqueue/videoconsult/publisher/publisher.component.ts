import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { Component, ElementRef, AfterViewInit, ViewChild, Input } from '@angular/core';
import { DigiQueueService } from '../../digiqueue.service';
import { Router } from '@angular/router';

const publish = () => {

};

@Component({
  selector: 'app-publisher',
  templateUrl: './publisher.component.html',
  styleUrls: ['./publisher.component.css']
})

export class PublisherComponent implements AfterViewInit {
  @ViewChild('publisherDiv', { static: false }) publisherDiv: ElementRef;
  @Input() session: OT.Session;
  publisher: OT.Publisher;
  publishing: Boolean;

  constructor(
    private digiQueueService: DigiQueueService,
    private toast: ToasterService,
    private router: Router
    
  ) {
    this.publishing = false;
  }

  ngAfterViewInit() {
    const OT = this.digiQueueService.getOT();
    this.publisher = OT.initPublisher(this.publisherDiv.nativeElement, { insertMode: 'append' });
    this.publisher.publishVideo(true);
    if (this.session) {
      if (this.session['isConnected']()) {
        this.publish();
      }
      this.session.on('sessionConnected', () => this.publish());
    }
  }

  publish() {
    this.session.publish(this.publisher, (err) => {
      if (err) {
        // alert(err.message);
        this.toast.show('Engage video consulation again. . .',"bg-warning text-white font-weight-bold",3000);
        this.router.navigate(["./app/reception/digiqueue/queue"]);
      } else {
        this.publishing = true;
      }
    });
  }

  ngOnDestroy() {
    this.session.unpublish(this.publisher);
    this.publisher.destroy();
  }

}

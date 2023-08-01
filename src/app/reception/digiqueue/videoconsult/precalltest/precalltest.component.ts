import { VideoCardService } from './../../../../doctor/prescription/videocard/videocard.service';

import { Component, ElementRef, AfterViewInit, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { DigiQueueService } from '../../digiqueue.service';


@Component({
  selector: 'precalltest',
  templateUrl: './precalltest.component.html',
  styleUrls: ['./precalltest.component.css']
})

export class PreCallTestComponent implements OnInit,OnDestroy {

  API_KEY;
  SESSION_ID;
  TOKEN;

  videoConnectionStatus = 'Acquiring camera';

  TEST_TIMEOUT_MS = 15000; // 15 seconds

  @ViewChild('publisherEl', { static: false }) publisherEl: ElementRef;
  @ViewChild('subscriberEl', { static: false }) subscriberEl: ElementRef;


  session;
  publisher;
  subscriber;
  statusContainerEl;
  statusTitleEl;
  statusMessageEl;
  statusIconEl;

  surl='./app/reception/digiqueue/video/consult';
  furl='./app/reception/digiqueue/queue';
  testPercent: number = 0;
  videoTestPlots = [];
  isTestingResultsDone = false;
  connectionsStatus: Array<string> = new Array<string>();
  constructor(private digiQueueService: DigiQueueService,
    private spinnerService: SpinnerService,
    private videoCardService:VideoCardService,
    private router: Router,
    private toast: ToasterService) {

  }
  ngOnInit(){
    this.spinnerService.start();
    this.getTestVideoSession();
  }

  getTestVideoSession(){
    this.digiQueueService.generateTestVideoSessionid().then((data)=>{
      this.API_KEY = data.apiKey;
      this.SESSION_ID = data.sessionId;
      this.TOKEN = data.tokenId;
      this.spinnerService.stop();
      this.initiateTest();
    }).catch((e)=>{
      this.navigateTo(this.furl,1);
    })
  }
  skipTest(){
    this.videoCardService.updateSessionStatus('Patient Skiped Network Test',2);
    this.digiQueueService.isNetworkQualityTested=true;
    this.navigateTo(this.surl,1);
  }

  initiateTest() {
    this.videoCardService.updateSessionStatus('Patient Network Test Started',3);
    (<any>$('#preTestVideoCall')).modal({
      show: true,
      escapeClose: false,
      clickClose: false,
      showClose: false,
      backdrop: "static",
      keyboard: false
    });
    // this.API_KEY = this.digiQueueService.API_KEY;
    // this.SESSION_ID = this.digiQueueService.SESSION_ID;
    // this.TOKEN = this.digiQueueService.TOKEN;
    //console.log(this.API_KEY);
    //console.log(this.SESSION_ID);
    //console.log(this.TOKEN);
    let self = this;

    this.publisher = OT.initPublisher(this.publisherEl.nativeElement, {}, (error) => {
      if (error) {
        self.setText('Could not acquire your camera', self);
        self.navigateTo(self.furl);
        return;
      }

      self.setText('Connecting to session', self);
    });
    try{
    self.session = OT.initSession(self.API_KEY, self.SESSION_ID);
    }catch (error) {
      self.setText('Unable to connect to video', self);
      //console.error(error);
      self.navigateTo(self.furl);
    }

    //console.log('Connecting to the session after timeout >>>');
    self.session.connect(self.TOKEN, (error) => {
      if (error) {
        self.setText('Could not connect to video server', self);//OpenTok
        self.navigateTo(self.furl);
        return;
      }
      //console.log('Publisher is ', self.publisher)
      self.setText('Publishing video', self);
      self.session.publish(self.publisher, () => self.onPublish(self));
    });


  }

  onPublish(self: any) {

    //console.log('onpublish');

    try {
      //console.log('Session in onpublish >> ', self.session);
      self.subscriber = self.session.subscribe(
        self.publisher.stream,
        self.subscriberEl.nativeElement,
        {
          audioVolume: 0,
          testNetwork: true
        },
        (error, subscriber) => {
          if (error) {
            self.setText('Could not subscribe to video', self);
            self.navigateTo(self.furl);
            return;
          }
          //console.log('Generating subscriber', self.subscriber);
          // self.setText('Checking your available bandwidth (' + (self.TEST_TIMEOUT_MS / 1000) + ' Seconds)',self);

          self.testStreamingCapability(subscriber, function (error, message) {
            if(error){
              self.setText('Unable to test your network streaming', self);
              self.navigateTo(self.furl);
            }
            // self.setText('Result', self);
            self.setText(message.text, self);
            // self.statusIconEl.src = message.icon;

            self.onTestComplete(self);

            self.cleanup();
          }, self);
        }
      );
    } catch (error) {
      //console.error(error);
      self.navigateTo(self.furl);
    }
    //console.log(self.subscriber);
  }

  testStreamingCapability(subscriber, callback, self) {
    self.performQualityTest({ subscriber: subscriber, timeout: self.TEST_TIMEOUT_MS }, function (error, results) {
      if(error){
        self.setText('Unable to test your quality', self);
        self.navigateTo(self.furl);
      }
      //console.log('Test concluded', results);
      if(!results.video || !results.audio){
        return
      }
      var audioVideoSupported = results.video.bitsPerSecond > 150000 &&
        results.video.packetLossRatioPerSecond < 0.03 &&
        results.audio.bitsPerSecond > 25000 &&
        results.audio.packetLossRatioPerSecond < 0.05;

      if (audioVideoSupported) {
        self.digiQueueService.videoSupported = true;
        self.digiQueueService.audioSupported = true;
        // self.toas
        self.navigateTo(self.surl);

        // self.toast.show('Your network can support video  . . .', "bg-success text-white font-weight-bold", 1000);
        return callback(false, {
          text: 'Your network can support video call',
          icon: 'assets/icon_tick.svg'
        });
      }

      if (results.audio.packetLossRatioPerSecond < 0.05) {
        self.digiQueueService.audioSupported = true;
        // self.setText('Your network quality is low', self);
        return callback(false, {
          text: 'Your network quality is low',
          icon: 'assets/icon_warning.svg'
        });
      }

      // try audio only to see if it reduces the packet loss
      self.setText(
        'Trying audio only', self
      );

      self.publisher.publishVideo(false);

      self.performQualityTest({ subscriber: subscriber, timeout: 5000 }, function (error, results) {

        if(error){
          self.setText('Unable to test your quality', self);
          self.navigateTo(self.furl);
        }

        self.digiQueueService.audioSupported = results.audio.bitsPerSecond > 25000 &&
          results.audio.packetLossRatioPerSecond < 0.05;


        if (self.digiQueueService.audioSupported) {
          // self.setText('Your network quality is bad', self);
          return callback(false, {
            text: 'Your network quality is bad',
            icon: 'assets/icon_warning.svg'
          });
        }

        // self.setText('Your network quality is bad', self);
        return callback(false, {
          text: 'Your network quality is bad',
          icon: 'assets/icon_error.svg'
        });
      }, self);
    }, self);
  }

  performQualityTest(config, callback, self) {
    let startMs = new Date().getTime();
    let testTimeout;
    let currentStats;
    let bandwidthCalculator = self.bandwidthCalculatorObj({
      subscriber: config.subscriber
    });

    let cleanupAndReport = function () {
      if(!currentStats)
      currentStats.elapsedTimeMs = new Date().getTime() - startMs;
      callback(undefined, currentStats);

      window.clearTimeout(testTimeout);
      bandwidthCalculator.stop();

      callback = function () { };
    };

    // bail out of the test after 30 seconds
    window.setTimeout(cleanupAndReport, config.timeout);
    self.setText('Checking your network speed . . .', self);
    bandwidthCalculator.start(function (stats) {
      //console.log(stats);
      self.videoTestPlots.push(stats);

      if (self.testPercent < 100) {
        self.testPercent = self.testPercent + (100 / 31);
        if (self.testPercent > 100) {
          self.testPercent = 100;
        }
        // self.setText('Checking your network speed ' + parseInt(self.testPercent + '') + ' %', self);
        self.digiQueueService.videoConnectionStatus = 'Checking your network speed ' + parseInt(self.testPercent + '') + ' %';
        self.videoConnectionStatus = 'Checking your network speed ' + parseInt(self.testPercent + '') + ' %';
        // $('.progress-bar').css('width', self.testPercent + '%').attr('aria-valuenow', self.testPercent)
      }
      // you could do something smart here like determine if the bandwidth is
      // stable or acceptable and exit early
      currentStats = stats;
    });
  }

  bandwidthCalculatorObj(config) {
    let intervalId;
    let self = this;
    config.pollingInterval = config.pollingInterval || 500;
    config.windowSize = config.windowSize || 2000;
    config.subscriber = config.subscriber || undefined;

    return {
      start: function (reportFunction) {
        var statsBuffer = [];
        var last = {
          audio: {},
          video: {}
        };

        intervalId = window.setInterval(function () {
          config.subscriber.getStats(function (error, stats) {
            var snapshot: any = {};
            var nowMs = new Date().getTime();
            var sampleWindowSize;

            ['audio', 'video'].forEach(function (type) {
              snapshot[type] = Object.keys(stats[type]).reduce(function (result, key) {
                result[key] = stats[type][key] - (last[type][key] || 0);
                last[type][key] = stats[type][key];
                return result;
              }, {});
            });

            // get a snapshot of now, and keep the last values for next round
            snapshot.timestamp = stats.timestamp;

            statsBuffer.push(snapshot);
            statsBuffer = statsBuffer.filter(function (value) {
              return nowMs - value.timestamp < config.windowSize;
            });

            sampleWindowSize = self.getSampleWindowSize(statsBuffer);

            if (sampleWindowSize !== 0) {
              reportFunction(self.calculatePerSecondStats(
                statsBuffer,
                sampleWindowSize
              ));
            }
          });
        }, config.pollingInterval);
      },

      stop: function () {
        window.clearInterval(intervalId);
      }
    };
  }
  calculatePerSecondStats(statsBuffer, seconds) {
    let self = this;
    let stats: any = {};
    ['video', 'audio'].forEach(function (type) {
      stats[type] = {
        packetsPerSecond: self.sum(self.pluck(statsBuffer, type), 'packetsReceived') / seconds,
        bitsPerSecond: (self.sum(self.pluck(statsBuffer, type), 'bytesReceived') * 8) / seconds,
        packetsLostPerSecond: self.sum(self.pluck(statsBuffer, type), 'packetsLost') / seconds
      };
      stats[type].packetLossRatioPerSecond = (
        stats[type].packetsLostPerSecond / stats[type].packetsPerSecond
      );
    });

    stats.windowSize = seconds;
    return stats;
  }
  getSampleWindowSize(samples) {
    let times = this.pluck(samples, 'timestamp');
    return (Math.max.apply(undefined, times) - Math.min.apply(undefined, times)) / 1000;
  }
  pluck(arr, propertName) {
    return arr.map(function (value) {
      return value[propertName];
    });
  }
  sum(arr, propertyName) {
    let self = this;
    if (typeof propertyName !== 'undefined') {
      arr = self.pluck(arr, propertyName);
    }

    return arr.reduce(function (previous, current) {
      return previous + current;
    }, 0);
  }

  setText(text, self) {
    if (!self) {
      return
    }
    self.digiQueueService.videoConnectionStatus = text;
    self.videoConnectionStatus = text;
    self.connectionsStatus.push(text);
    self.testPercent = self.testPercent + (100 / 31);
    //console.log('videoStatus ' + text);
  }

  onTestComplete(self) {
    // console.log('onTestComplete(): "Nothing to do".')
    // console.log(self.videoTestPlots);
    let quality='';
    if(self.digiQueueService.videoSupported==true){
     quality='GOOD';
    }else if(self.digiQueueService.audioSupported==true){
      quality='POOR';
    }else {
      quality='BAD';
    }
    self.videoCardService.updateSessionStatus('Patient Network Test Completed',5,quality);
    setTimeout(()=>{
      self.isTestingResultsDone = true;
    },3000);
    self.digiQueueService.isNetworkQualityTested = true;
  }
  ngOnDestroy() {
    (<any>$('.modal')).modal('hide')
    this.cleanup();
  }

  cleanup() {
    let self = this;
    if(!this.session){
      return;
    }
    if(self.subscriber!=null && self.subscriber!=undefined)
    self.session.unsubscribe(self.subscriber);
    if(self.publisher!=null && self.publisher!=undefined)
    self.session.unpublish(self.publisher);
  }
  navigateTo(path: string,delay=2990) {
    setTimeout(()=>{
    this.spinnerService.stop();
    (<any>$('#preTestVideoCall')).modal('hide')
    this.router.navigate([path]);
    },delay);
  }
}

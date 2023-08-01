import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { DigiQueueService } from './../../digiqueue.service';
import { Router } from '@angular/router';
import { Component, ElementRef, AfterViewInit, ViewChild, Input } from '@angular/core';
import * as OT from '@opentok/client';

@Component({
  selector: 'app-subscriber',
  templateUrl: './subscriber.component.html',
  styleUrls: ['./subscriber.component.css']
})

export class SubscriberComponent implements AfterViewInit {
  @ViewChild('subscriberDiv', { static: false }) subscriberDiv: ElementRef;
  @Input() session: OT.Session;
  @Input() stream: OT.Stream;
  subscriber: any;

  connectionsStatus=[];

  videoTestPlots = [];
  TEST_TIMEOUT_MS=5000;

  bandwidthCalculator;
  testTimeout;
  constructor(private toast:ToasterService,private router: Router, private digiQueueService: DigiQueueService) { }

  ngAfterViewInit() {
    let self=this;
    this.subscriber = this.session.subscribe(this.stream, this.subscriberDiv.nativeElement, null, (err) => {
      if(err){
      //console.error(err);
      self.toast.show('Engage video consulation again. . .',"bg-warning text-white font-weight-bold",3000);

        self.router.navigate(["./app/reception/digiqueue/queue"]);
     }
      
      self.setText('Checking your available bandwidth (' + (self.TEST_TIMEOUT_MS / 1000) + ' Seconds)',self);

      self.testVideoNetwork(self);
    });
  }
  testVideoNetwork(self: this) {
    try {
      self.testStreamingCapability(self.subscriber, function (error, message) {
        if (error) {
          self.setText('Unable to test your network streaming', self);
          // self.navigateTo('./app/doctor/');
        }
        // self.setText('Result', self);
        self.setText(message.text, self);
        // self.statusIconEl.src = message.icon;
        self.testVideoNetwork(self);
        // self.onTestComplete(self);
        // self.cleanup();
      }, self);
    } catch (error) {
      
    }
  }

  testStreamingCapability(subscriber, callback, self) {
    self.performQualityTest({ subscriber: subscriber, timeout: self.TEST_TIMEOUT_MS }, function (error, results) {
      self.digiQueueService.videoSupported = false;
      self.digiQueueService.audioSupported = false;
      if(error){
        self.setText('Unable to test your quality', self);
        self.navigateTo('./app/doctor/');
      }
      //console.log('Test concluded', results);
      if(!results.video){
        return;
      }
      let audioVideoSupported = results.video.bitsPerSecond > 150000 &&
        results.video.packetLossRatioPerSecond < 0.03 &&
        results.audio.bitsPerSecond > 25000 &&
        results.audio.packetLossRatioPerSecond < 0.05;

      if (audioVideoSupported) {
        self.digiQueueService.videoSupported = true;
        self.digiQueueService.audioSupported = true;
        // self.toas
        // self.navigateTo('./app/doctor/prescription');

        // self.toast.show('Your network can support video  . . .', "bg-success text-white font-weight-bold", 1000);
        return callback(false, {
          text: 'Your network can support video call',
          icon: 'assets/icon_tick.svg'
        });
      }

      if (results.audio.packetLossRatioPerSecond < 0.05) {
        self.digiQueueService.videoSupported = false;
        self.digiQueueService.audioSupported = true;
        self.setText('Your bandwidth can support audio only', self);
        return callback(false, {
          text: 'Your bandwidth can support audio only',
          icon: 'assets/icon_warning.svg'
        });
      }

      // try audio only to see if it reduces the packet loss
      // self.setText(
      //   'Trying audio only', self
      // );

      // self.publisher.publishVideo(false);

      self.performQualityTest({ subscriber: subscriber, timeout: 5000 }, function (error, results) {

        if(error){
          self.setText('Unable to test your quality', self);
          self.navigateTo('./app/doctor/');
        }

        self.digiQueueService.audioSupported = results.audio.bitsPerSecond > 25000 &&
          results.audio.packetLossRatioPerSecond < 0.05;


        if (self.digiQueueService.audioSupported) {
          self.setText('Your bandwidth can support audio only', self);
          return callback(false, {
            text: 'Your bandwidth can support audio only',
            icon: 'assets/icon_warning.svg'
          });
        }

        self.setText('Your bandwidth is too low for video audio also', self);
        return callback(false, {
          text: 'Your bandwidth is too low for audio',
          icon: 'assets/icon_error.svg'
        });
      }, self);
    }, self);
  }

  ngOnDestroy() {
    try {
      this.session.unsubscribe(this.subscriber);
      this.bandwidthCalculator.stop();
    } catch (error) {
      
    }
  }


  performQualityTest(config, callback, self) {
    let startMs = new Date().getTime();
    let testTimeout;
    let currentStats;
    self.bandwidthCalculator = self.bandwidthCalculatorObj({
      subscriber: config.subscriber
    });

    let cleanupAndReport = function () {
        if(!currentStats){
          currentStats={};
        }
        currentStats.elapsedTimeMs = new Date().getTime() - startMs;
        callback(undefined, currentStats);//to do
      window.clearTimeout(testTimeout);
      // self.bandwidthCalculator.stop();

      callback = function () { };
    };

    // bail out of the test after 30 seconds
    window.setTimeout(cleanupAndReport, config.timeout);
    self.setText('Checking your network speed . . .', self);
    self.bandwidthCalculator.start(function (stats) {
      // //console.log(stats);
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
        let statsBuffer = [];
        let last = {
          audio: {},
          video: {}
        };

        intervalId = window.setInterval(function () {
          config.subscriber.getStats(function (error, stats) {
            let snapshot: any = {};
            let nowMs = new Date().getTime();
            let sampleWindowSize;
            if(stats==null||stats==undefined){
              return;
            }

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
    //console.log('onTestComplete(): "Nothing to do".')
    //console.log(self.videoTestPlots);
    let quality='';
    if(self.doctorService.videoSupported==true){
     quality='GOOD';
    }else if(self.doctorService.audioSupported==true){
      quality='POOR';
    }else {
      quality='BAD';
    }
    self.videoCardService.updateSessionStatus('',6,quality);
      // self.isTestingResultsDone = true;
      this.testVideoNetwork(self);
    // self.digiQueueService.isNetworkQualityTested = true;
  }
}

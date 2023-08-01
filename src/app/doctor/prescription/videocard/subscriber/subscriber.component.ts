import { DoctorService } from './../../../doctor.service';
import { Component, ElementRef, AfterViewInit, ViewChild, Input } from '@angular/core';
import * as OT from '@opentok/client';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { VideoCardService } from '../videocard.service';

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
  connectionsStatus = [];

  videoTestPlots = [];
  TEST_TIMEOUT_MS = 5000;

  bandwidthCalculator;
  testTimeout;

  constructor(private videoCardService: VideoCardService, private doctorService: DoctorService, private toast: ToasterService) { }

  ngAfterViewInit() {
    let self = this;
    self.subscriber = self.session.subscribe(self.stream, self.subscriberDiv.nativeElement, { insertMode: 'replace' }, (err) => {
      if (err) {
        console.log(err, "video-log");
        this.reconnectVideo();
      }
      self.subscriber.subscribeToVideo(true);
      self.subscriber.subscribeToAudio(true);
      self.subscriber.on("videoDisabled", function (event) {
        // You may want to hide the subscriber video element:
        // domElement = document.getElementById(subscriber.id);
        // domElement.style["visibility"] = "hidden";
        console.log("event-videoDisabled", event)
        switch (event.reason) {
          case "publishVideo":
            // self.toast.show(
            //   self.doctorService.patientQueue.patientTitle + ' .' + self.doctorService.patientQueue.patientFirstName + ' ' + self.doctorService.patientQueue.patientLastName +' '+
            //   'video was ended'
            //   , "bg-warning text-white font-weight-bold",
            //   1000);
            break;
          case "quality":
            self.toast.show(
              'Poor Network'
              , "bg-warning text-white font-weight-bold",
              2000);
            // self.reconnectVideo();
            console.log('Poor Network', event);

            break;
          default:
            break;
        }
        // You may want to add or adjust other UI.
      });
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
        switch (event.reason) {
          case "clientDisconnected":
            self.toast.show(
              self.doctorService.patientQueue.patientTitle + ' .' + self.doctorService.patientQueue.patientFirstName + ' ' + (self.doctorService.patientQueue.patientLastName ? self.doctorService.patientQueue.patientLastName : '') + ' ' +
              'video was stopped'
              , "bg-danger text-white font-weight-bold",
              2000);
            break;

          default:
            break;
        }
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
        console.log("event", "streamPropertyChanged", event)
        if (self.session.connection.connectionId == (event.stream).connection.connectionId)
          return
        switch (event.changedProperty) {
          case "hasAudio":
            if (event.newValue) {
              self.toast.show(
                self.doctorService.patientQueue.patientTitle + ' .' + self.doctorService.patientQueue.patientFirstName + ' ' + (self.doctorService.patientQueue.patientLastName ? self.doctorService.patientQueue.patientLastName : '') + ' ' +
                'has unmuted audio'
                , "bg-warning text-white font-weight-bold",
                2000);
            }
            else {
              self.toast.show(
                self.doctorService.patientQueue.patientTitle + ' .' + self.doctorService.patientQueue.patientFirstName + ' ' + (self.doctorService.patientQueue.patientLastName ? self.doctorService.patientQueue.patientLastName : '') + ' ' +
                'has muted audio'
                , "bg-warning text-white font-weight-bold",
                2000);
            }
            break;
          case "hasVideo":
            if (event.newValue) {
              self.toast.show(
                self.doctorService.patientQueue.patientTitle + ' .' + self.doctorService.patientQueue.patientFirstName + ' ' + (self.doctorService.patientQueue.patientLastName ? self.doctorService.patientQueue.patientLastName : '') + ' ' +
                'has unmuted video'
                , "bg-warning text-white font-weight-bold",
                2000);
            }
            else {
              self.toast.show(
                self.doctorService.patientQueue.patientTitle + ' .' + self.doctorService.patientQueue.patientFirstName + ' ' + (self.doctorService.patientQueue.patientLastName ? self.doctorService.patientQueue.patientLastName : '') + ' ' +
                'has muted video'
                , "bg-warning text-white font-weight-bold",
                2000);
            }
            break;
          default:
            break;
        }
      })

      self.setText('Checking your available bandwidth (' + (self.TEST_TIMEOUT_MS / 1000) + ' Seconds)', self);

      self.testVideoNetwork(self);
    });
  }
  reconnectVideo() {
    this.toast.show('Reconnecting video. . .', "bg-warning text-white font-weight-bold", 3000);
    this.doctorService.isVideo = false;
    setTimeout(() => {
      this.doctorService.isVideo = true;
    }, 10)
  }

  testVideoNetwork(self: this) {
    try {
      self.testStreamingCapability(self.subscriber, function (error, message) {
        if (error) {
          self.setText('Unable to test your network streaming', self);
        }
        self.setText(message.text, self);
        // self.statusIconEl.src = message.icon;
        self.testVideoNetwork(self);
        // self.onTestComplete(self);
        // self.cleanup();
      }, self);
    } catch (error) {
      console.log("catch in testVideoNetwork")
    }
  }

  testStreamingCapability(subscriber, callback, self) {
    try {
      self.performQualityTest({ subscriber: subscriber, timeout: self.TEST_TIMEOUT_MS }, function (error, results) {
        self.doctorService.videoSupported = false;
        self.doctorService.audioSupported = false;
        self.doctorService.networkChecked = true;
        if (error) {
          self.setText('Unable to test your quality', self);
          self.navigateTo('./app/doctor/');
        }
        if (!results.video) {
          return;
        }
        //console.log('Test concluded', results);
        let audioVideoSupported = results.video.bitsPerSecond > 150000 &&
          results.video.packetLossRatioPerSecond < 0.03 &&
          results.audio.bitsPerSecond > 25000 &&
          results.audio.packetLossRatioPerSecond < 0.05;
        
        if (audioVideoSupported) {
          self.doctorService.videoSupported = true;
          self.doctorService.audioSupported = true;
          self.doctorService.networkChecked = true;
          // self.toas
          // self.navigateTo('./app/doctor/prescription');

          // self.toast.show('Your network can support video  . . .', "bg-success text-white font-weight-bold", 1000);
          return callback(false, {
            text: 'Your network can support video call',
            icon: 'assets/icon_tick.svg'
          });
        }

        if (results && results.audio && results.audio.packetLossRatioPerSecond < 0.05) {
          self.doctorService.videoSupported = false;
          self.doctorService.audioSupported = true;
          self.doctorService.networkChecked = true;
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

          if (error) {
            self.setText('Unable to test your quality', self);
            self.navigateTo('./app/doctor/');
          }

          self.doctorService.audioSupported = results && results.audio && results.audio.bitsPerSecond > 25000 &&
            results.audio.packetLossRatioPerSecond < 0.05;


          if (self.doctorService.audioSupported) {
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
    } catch (error) {
      console.log("catch in testStreamingCapability")
    }
  }

  ngOnDestroy() {
    this.bandwidthCalculator.stop();
    this.session.unsubscribe(this.subscriber);
  }


  performQualityTest(config, callback, self) {
    let startMs = new Date().getTime();
    let testTimeout;
    let currentStats;
    self.bandwidthCalculator = self.bandwidthCalculatorObj({
      subscriber: config.subscriber
    });

    let cleanupAndReport = function () {
      if (!currentStats) {
        currentStats = {};
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
        self.doctorService.videoConnectionStatus = 'Checking your network speed ' + parseInt(self.testPercent + '') + ' %';
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
            if (stats == null || stats == undefined) {
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
    self.doctorService.videoConnectionStatus = text;
    self.videoConnectionStatus = text;
    self.connectionsStatus.push(text);
    self.testPercent = self.testPercent + (100 / 31);
    //console.log('videoStatus ' + text);
  }

  onTestComplete(self) {
    //console.log('onTestComplete(): "Nothing to do".')
    //console.log(self.videoTestPlots);
    // self.isTestingResultsDone = true;
    let quality = '';
    if (self.doctorService.networkChecked) {
      if (self.doctorService.videoSupported == true) {
        quality = 'GOOD';
      } else if (self.doctorService.audioSupported == true) {
        quality = 'POOR';
      } else {
        quality = 'BAD';
      }
    }
    self.videoCardService.updateSessionStatus('', 6, quality);
    self.testVideoNetwork(self);
    // self.doctorService.isNetworkQualityTested = true;
  }
}

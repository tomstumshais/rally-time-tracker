import { Component, ViewChild, ChangeDetectorRef, ApplicationRef } from "@angular/core";
import { NavController, NavParams, ToastController } from "ionic-angular";
import { Serial } from "@ionic-native/serial";

import { ResultsHistoryPage } from "../results-history/results-history";
import { DataServiceProvider, Driver } from "../../providers/data-service/data-service";

@Component({
  selector: "page-time-tracker",
  templateUrl: "time-tracker.html"
})
export class TimeTrackerPage {
  @ViewChild("carNumberInput") carNumberInput;

  parameters: any;
  drivers: any;
  selectedPoint: any;
  eventID: string | number;
  resendIntensity: number;
  rs232Received: string;
  timeFieldFormats: object = {
    A: "HH:MM",
    B: "HH:MM:SS.MS",
    F: "HH:MM:SS.M",
    G: "HH:MM:SS",
    Q: "HH:MM:SS.MSX",
    T: "HH:MM",
    Z: "HH:MM:SS.M"
  };
  timeMasks: object = {
    A: "00:00",
    B: "00:00:00.00",
    F: "00:00:00.0",
    G: "00:00:00",
    Q: "00:00:00.000",
    T: "00:00",
    Z: "00:00:00.0"
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
    private serial: Serial,
    private dataService: DataServiceProvider,
    private appRef: ApplicationRef
  ) {
    this.parameters = this.navParams.get("parameters");
    this.selectedPoint = this.navParams.get("point");
    this.selectedPoint.timeFormat = this.timeFieldFormats[this.selectedPoint.Type];
    this.selectedPoint.timeMask = this.timeMasks[this.selectedPoint.Type];
    this.drivers = this.navParams.get("drivers");
    this.dataService.driversData = [];
    this.rs232Received = "";
    this.dataService.selectedType = this.selectedPoint.timeFormat;

    // get parameter's values
    this.parameters.forEach(param => {
      if (param.Code === "EventID") this.eventID = param.Value;
      // ResendIntensity always comes in seconds, need to convert to milliseconts
      if (param.Code === "ResendIntensity") this.resendIntensity = param.Value * 1000;
    });
  }

  ionViewDidLoad() {
    // call constantly send data method after configured intensity
    if (this.dataService.intervalTask === undefined) {
      // open connection with RS232
      this.listenToRS232Connection();
      this.dataService.intervalTask = setInterval(() => {
        this.sendData();
      }, this.resendIntensity);
    }
    // for RS232 port:
    // need to call ChangeDetectorRef to update Angular scope
    // because subscriptions to RS232 port are outside of the Angular scope
    // and when an update arrives change-detection isn't triggered or delayed
    this.cdr.detectChanges();
  }

  mapDriversByCarNumber(event: any, driver: Driver) {
    const value = event.value;

    const addedDriver = this.drivers.find(d => {
      return d.No === value;
    });

    if (addedDriver) {
      driver.name = addedDriver.Name;
    } else {
      driver.name = "";
    }

    // for RS232 port:
    // need to call ChangeDetectorRef to update Angular scope
    // because subscriptions to RS232 port are outside of the Angular scope
    // and when an update arrives change-detection isn't triggered or delayed
    this.cdr.detectChanges();
  }

  addItem(isRS232: boolean = false, time: string = "") {
    this.dataService.driversData.push({
      number: "",
      name: "",
      time: time,
      rs232: isRS232 ? 1 : 0 // check if data comes from rs232 port
    });

    this.appRef.tick();

    // for RS232 port:
    // need to call ChangeDetectorRef to update Angular scope
    // because subscriptions to RS232 port are outside of the Angular scope
    // and when an update arrives change-detection isn't triggered or delayed
    // this.cdr.detectChanges();

    // if add item manually, then focus on first input only if it's first card
    // if add item from rs232, then focus on first input only if there isn't any other active focus
    const currentElement = document.activeElement.tagName;
    if (
      (currentElement === "BUTTON" && this.dataService.driversData.length === 1) ||
      (currentElement !== "BUTTON" && currentElement !== "INPUT")
    ) {
      setTimeout(() => {
        var tt = document.getElementsByName("number");
        for (var i = 0; i < tt.length; i++) {
          if (tt[i].tagName === "INPUT") {
            tt[i].focus();
          }
        }
      }, 100);
    }
  }

  removeItem(i: number) {
    this.dataService.driversData.splice(i, 1);
    // for RS232 port:
    // need to call ChangeDetectorRef to update Angular scope,
    // for safety reasons, because items which were added by
    // RS232 connection aren't triggering change-detection or delaying with it
    this.cdr.detectChanges();
  }

  acceptItem(driver: Driver, i: number) {
    if (this.validateItem(driver)) {
      // add item to array which is used to send data to back-end
      this.dataService.readyToSendData.push({
        PointsID: this.selectedPoint.ID,
        No: driver.number,
        Result: driver.time,
        rs232: driver.rs232
      });
      // items which are ready to send store in history array
      this.dataService.resultsHistory.push(driver);

      // remove item which is accepted to sending it to back-end
      this.removeItem(i);
    } else {
      this.showToast("Not valid car number and/or time, please check it!");
    }
  }

  validateItem(driver: Driver): boolean {
    // trim spaces
    driver.number = driver.number.trim();
    driver.time = driver.time.trim();
    // number is from 1 - 999
    const driverNumberString = driver.number;
    const driverNumber = parseInt(driverNumberString);
    if (
      driverNumber > 999 ||
      driverNumber < 1 ||
      isNaN(driverNumber) ||
      !driverNumberString.match(/^\d+$/)
    ) {
      return false;
    }

    // time with correct length
    const timeLength = driver.time.length;
    if (timeLength !== this.selectedPoint.timeFormat.length) return false;

    // correct hours
    const hoursString = driver.time.substring(0, 2);
    const hours = parseInt(hoursString);
    if (hours > 23 || hours < 0 || !hoursString.match(/^\d+$/)) return false;

    // correct minutes
    const minutesString = driver.time.substring(3, 5);
    const minutes = parseInt(minutesString);
    if (minutes > 59 || minutes < 0 || !minutesString.match(/^\d+$/)) return false;

    // for time format there always will be at least hours and minutes
    // need to pre-check if exists seconds and milliseconds
    // correct seconds
    if (timeLength >= 8) {
      const secondsString = driver.time.substring(6, 8);
      const seconds = parseInt(secondsString);
      if (seconds > 59 || seconds < 0 || !secondsString.match(/^\d+$/)) return false;
    }

    // correct milliseconds
    if (timeLength >= 9) {
      const millisecondsString = driver.time.substring(9, timeLength);
      const milliseconds = parseInt(millisecondsString);
      if (milliseconds > 999 || milliseconds < 0 || !millisecondsString.match(/^\d+$/))
        return false;
    }

    return true;
  }

  replaceDelimiter(driver: Driver) {
    const timeLength = driver.time.length;

    if (timeLength > 2) {
      const delim = driver.time.substring(2, 3);
      if (delim === "#" || delim === "*" || delim === ".") {
        driver.time = driver.time.substring(0, 2) + ":" + driver.time.substring(3);
      }
    }
    if (timeLength > 5) {
      const delim = driver.time.substring(5, 6);
      if (delim === "#" || delim === "*" || delim === ".") {
        driver.time = driver.time.substring(0, 5) + ":" + driver.time.substring(6);
      }
    }
    if (timeLength > 8) {
      const delim = driver.time.substring(8, 9);
      if (delim === "#" || delim === "*" || delim === ".") {
        driver.time = driver.time.substring(0, 8) + "." + driver.time.substring(9);
      }
    }
  }

  // send data to back-end
  sendData() {
    if (this.dataService.readyToSendData.length) {
      // add sending flag to know which items were sent when clear array
      this.dataService.readyToSendData.forEach(data => (data.sending = true));
      // create data object for request
      const data = {
        Header: {
          EventID: this.eventID
        },
        Data: this.dataService.readyToSendData
      };

      this.dataService.sendData(JSON.stringify(data), this.resendIntensity - 500).subscribe(
        (response: any) => {
          // need to clear sent items from array by "sending" flag
          this.dataService.readyToSendData = this.dataService.readyToSendData.filter(
            data => !data.sending
          );
        },
        (error: any) => {
          console.log("Service error: ", error);
        }
      );
    }
  }

  // open and listen to serial port
  listenToRS232Connection() {
    this.serial
      .requestPermission()
      .then(() => {
        // this.showToast('Request Permission done');
        console.log("Request Permission done!");
        this.serial
          .open({
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 0,
            dtr: false,
            rts: false,
            sleepOnPause: false
          })
          .then(() => {
            // this.showToast('Serial connection opened');
            console.log("Serial connection opened!");
            this.serial.registerReadCallback().subscribe(
              data => {
                // output incoming data
                this.receive232Buffer(data);
              },
              error => {
                console.log("Serial receiver error!");
              }
            );
          })
          .catch((error: any) => {
            console.log("Serial connection error!");
          });
      })
      .catch((error: any) => {
        // this.showToast(error);
        console.log("Permission rejected!", error);
      });
  }

  // handle RS232 data
  receive232Buffer(data: any) {
    const uint8buffer = new Uint8Array(data);
    const charIterator = uint8buffer.entries();
    let eNext;
    let startTimeChar = 0; // Default for Tag Heuer 520

    while (true) {
      eNext = charIterator.next();
      if (eNext.done) {
        break;
      }

      if (eNext.value[1] === 13) {
        // receive data, parse data and add to array
        // const identification = this.rs232Received.substr(0, 1); // currently not using
        // detect stopwatch type.
        // TagHeuer 520:       time start from 15th character
        // TagHeuer 540:       time: start from 16th character
        // Alge-Timing Timy-3: time: start from 10th character
        if (this.rs232Received.indexOf(":") == 12) {
          // Alge-Timing Timy-3
          startTimeChar = 10;
        } else if (this.rs232Received.indexOf(":") == 17) {
          // TagHeuer 520
          startTimeChar = 15;
        } else if (this.rs232Received.indexOf(":") == 18) {
          // TagHeuer 540
          startTimeChar = 16;
        } else {
          // Unknown stopwatch
          startTimeChar = this.rs232Received.indexOf(":");
          if (startTimeChar != -1) {
            startTimeChar = startTimeChar - 2;
          } else {
            startTimeChar = 15;
          }
        }
        // const competitornumber = this.rs232Received.substr(7,4); // not use
        // const inputchannel     = this.rs232Received.substr(12,2); // not use
        var inputTime = this.rs232Received.substr(startTimeChar, 15);
        if (inputTime.substr(0, 2) == "  ") {
          inputTime = new Date().getHours() + ":" + inputTime.substr(3);
        }
        if (inputTime.substr(0, 1) == " ") {
          inputTime = "0" + inputTime.substr(1);
        }
        if (inputTime.substr(0, 2) == "  ") {
          inputTime = "00" + inputTime.substr(2);
        }

        // if (identification === 'T') { // TagHeuer 520, 540 // currently not using
        this.rs232Received = inputTime.substr(0, 12);

        // cut string for correct format length
        this.rs232Received = this.rs232Received.substring(0, this.dataService.selectedType.length);
        // add new card item to UI with received time
        this.addItem(true, this.rs232Received);
        this.rs232Received = "";
      } else {
        if (eNext.value[1] !== 10) {
          this.rs232Received = this.rs232Received + String.fromCharCode(eNext.value[1]);
        }
      }
    }
  }

  goToHistory() {
    this.navCtrl.push(ResultsHistoryPage, {
      selectedPoint: this.selectedPoint
    });
  }

  showToast(message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: "bottom"
    });

    toast.present();
  }
}

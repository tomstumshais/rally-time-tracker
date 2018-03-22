import { Component, ViewChild, ChangeDetectorRef  } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Serial } from '@ionic-native/serial';

import { DataServiceProvider, Driver } from "../../providers/data-service/data-service";

@Component({
  selector: 'page-time-tracker',
  templateUrl: 'time-tracker.html',
})
export class TimeTrackerPage {

  @ViewChild('carNumberInput') carNumberInput;

  parameters: any;
  drivers: any;
  selectedPoint: any;
  eventID: string | number;
  resendIntensity: number;
  rs232Received: string;
  timeFieldFormats: object = {
    A: 'HH:MM',
    B: 'HH:MM:SS.MS',
    F: 'HH:MM:SS.M',
    G: 'HH:MM:SS',
    Q: 'HH:MM:SS.MSX',
    T: 'HH:MM',
    Z: 'HH:MM:SS.MSX'
  };

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
    private serial: Serial,
    private dataService: DataServiceProvider
  ) {
    this.parameters = this.navParams.get('parameters');
    this.selectedPoint = this.navParams.get('point');
    this.selectedPoint.timeFormat = this.timeFieldFormats[this.selectedPoint.Type];
    this.drivers = this.navParams.get('drivers');
    this.dataService.driversData = [];
    this.rs232Received = '';

    // get parameter's values
    this.parameters.forEach((param) => {
      if (param.Code === "EventID") this.eventID = param.Value;
      // ResendIntensity always comes in seconds, need to convert to milliseconts
      if (param.Code === "ResendIntensity") this.resendIntensity = (param.Value * 1000);
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
  }

  mapDriversByCarNumber(event: any, driver: Driver) {
    const value = event.value;

    const addedDriver = this.drivers.find((d) => {
      return d.No === value;
    });

    if (addedDriver) {
      driver.name = addedDriver.Name;
    } else {
      driver.name = '';
    }
  }

  addItem() {
    this.dataService.driversData.push({
      number: '',
      name: '',
      time: ''
    });

    setTimeout(() => {
      // TODO: fix, set input always for first item
      this.carNumberInput.setFocus();
    });
  }

  removeItem(i: number) {
    this.dataService.driversData.splice(i, 1);
  }

  acceptItem(driver: Driver, i: number) {
    if (this.validateItem(driver)) {
      // add to send array
      this.dataService.readyToSendData.push({
        PointsID: this.selectedPoint.ID,
        No: driver.number,
        Result: driver.time
      });

      // remove added item
      this.dataService.driversData.splice(i, 1);
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
    if (driverNumber > 999 || driverNumber < 1 || isNaN(driverNumber) || !driverNumberString.match(/^\d+$/)) return false;

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
      if (milliseconds > 999 || milliseconds < 0 || !millisecondsString.match(/^\d+$/)) return false;
    }

    return true;
  }

  replaceDelimiter (driver: Driver) {
    const timeLength = driver.time.length;

    if (timeLength > 2) {
      const delim = driver.time.substring(2, 3);
      if (delim === '#' || delim === '*' || delim === '.') {
        driver.time = driver.time.substring(0, 2) + ':' + driver.time.substring(3);
      }
    }
    if (timeLength > 5) {
      const delim = driver.time.substring(5, 6);
      if (delim === '#' || delim === '*' || delim === '.') {
        driver.time = driver.time.substring(0, 5) + ':' + driver.time.substring(6);
      }
    }
    if (timeLength > 8) {
      const delim = driver.time.substring(8, 9);
      if (delim === '#' || delim === '*' || delim === '.') {
        driver.time = driver.time.substring(0, 8) + '.' + driver.time.substring(9);
      }
    }
  }

  // send data to back-end
  sendData() {
    if (this.dataService.readyToSendData.length) {
      // add sending flag to know which items were sent when clear array
      this.dataService.readyToSendData.forEach(data => data.sending = true);
      // create data object for request
      const data = {
        Header: {
          EventID: this.eventID
        },
        Data: this.dataService.readyToSendData
      };

      this.dataService.sendData(JSON.stringify(data), (this.resendIntensity - 500))
        .subscribe((response: any) => {
          // need to clear sent items from array by "sending" flag
          this.dataService.readyToSendData = this.dataService.readyToSendData.filter(data => !data.sending);
        }, (error: any) => {
          // this.showToast('Service error, please try again later or contact your admin!');
          console.log('Service error: ', error);
        });
    }
  }

  // open and listen to serial port
  listenToRS232Connection() {
    this.serial.requestPermission().then(() => {
      // this.showToast('Request Permission done');
      console.log('Request Permission done!');
      this.serial.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 0,
        dtr: false,
        rts: false,
        sleepOnPause: false
      }).then(() => {
        // this.showToast('Serial connection opened');
        console.log('Serial connection opened!');
        this.serial.registerReadCallback()
          .subscribe((data) => {
            // output incoming data
            this.receive232Buffer(data);
          }, (error) => {
            console.log('Serial receiver error!');
          });
      }).catch((error: any) => {
        console.log('Serial connection error!');
      });
    }).catch((error: any) => {
      // this.showToast(error);
      console.log('Permission rejected!', error);
    });
  }

  // handle RS232 data
  receive232Buffer(data: any) {
    const uint8buffer = new Uint8Array(data);
    const charIterator = uint8buffer.entries();
    let eNext;

    while (true) {
      eNext = charIterator.next();
      if (eNext.done) {
        break;
      }

      if (eNext.value[1] === 13) {
        // Dati ir sanemti, jaieliek saraksta jauns rezultats
        // Laika izparseshana no sanjemtiem datiem
        
        const identification = this.rs232Received.substr(0, 1);
        // const competitornumber = this.rs232Received.substr(7,4); // not use
        // const inputchannel     = this.rs232Received.substr(12,2); // not use
        var inputTime = this.rs232Received.substr(15, 15);
        if (inputTime.substr(0,2) == '  ') {
          inputTime = new Date().getHours() + ':' + inputTime.substr(3);
        }
        // inputTime = inputTime.replace(/:/g, '.');
        
        if (identification === 'T') {
          this.rs232Received = inputTime.substr(0,12);
          this.showToast(this.rs232Received);

          // cut string for correct format length
          this.rs232Received = this.rs232Received.substring(0, this.selectedPoint.timeFormat.length);
          // push received data from RS232 to UI
          this.dataService.driversData.push({
            number: '',
            name: '',
            time: this.rs232Received
          });
          // need to call ChangeDetectorRef to update Angular scope
          // because subscriptions are outside the Angular scope 
          // and when an update arrives change-detection is not run
          this.cdr.detectChanges();

          setTimeout(() => {
            // TODO: fix, set input always for first item
            this.carNumberInput.setFocus();
          });
        }
        this.rs232Received = '';
      } else {
        this.rs232Received = this.rs232Received + String.fromCharCode(eNext.value[1]);
      }
    }
  }

  showToast(message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
  
    toast.present();
  }

}

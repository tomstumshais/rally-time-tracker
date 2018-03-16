import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Serial } from '@ionic-native/serial';

import { DataServiceProvider } from "../../providers/data-service/data-service";

@Component({
  selector: 'page-time-tracker',
  templateUrl: 'time-tracker.html',
})
export class TimeTrackerPage {

  parameters: any;
  drivers: any;
  selectedPoint: any;
  eventID: string | number;
  eventName: string;
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
  driversData: Array<Driver> = [
    {
      number: '',
      name: '', 
      time: '',
      empty: true
    }
  ];
  readyToSendData: Array<object> = [];
  intervalTask: number;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private serial: Serial,
    private dataService: DataServiceProvider
  ) {
    this.parameters = this.navParams.get('parameters');
    this.selectedPoint = this.navParams.get('point');
    this.selectedPoint.timeFormat = this.timeFieldFormats[this.selectedPoint.Type];
    this.drivers = this.navParams.get('drivers');
    this.rs232Received = '';

    // get all parameter's values
    this.parameters.forEach((param) => {
      if (param.Code === "EventID") this.eventID = param.Value;
      if (param.Code === "EventName") this.eventName = param.Value;
      // ResendIntensity always comes in seconds, need to convert to milliseconts
      if (param.Code === "ResendIntensity") this.resendIntensity = (param.Value * 1000);
    });
  }
  
  ionViewDidLoad() {
    console.log(this.intervalTask);
    // TODO: set interval only once
    this.intervalTask = setInterval(() => {
      this.sendData();
    }, this.resendIntensity);
  }

  // handle input blur event and add new empty object
  onInputBlur(event: any, driver: Driver) {
    const value = event.value;

    if (value) {
      // some value entered and now driver object is used
      driver.empty = false;

      const isEmpty = this.driversData.some((driver) => {
        return driver.empty;
      });

      // add new empty object if all are used
      if (!isEmpty) {
        this.driversData.push({
          number: '',
          name: '',
          time: '',
          empty: true
        });
      }
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

    // check if need to add empty object
    this.onInputBlur(event, driver);
  }

  removeItem(driver: Driver, i: number) {
    if(this.driversData.length === 1) {
      this.showToast("Can't delete last item!");
    } else {
      this.driversData.splice(i, 1);
    }
  }

  acceptItem(driver: Driver, i: number) {
    if (!driver.empty) {
      // add to send array
      this.readyToSendData.push({
        PointsID: this.selectedPoint.ID,
        No: driver.number,
        Result: driver.time
      });

      // add new empty object if last one is added
      if (this.driversData.length === 1) {
        this.driversData.push({
          number: '',
          name: '',
          time: '',
          empty: true
        });
      }

      // remove added item
      this.driversData.splice(i, 1);
    } else {
      this.showToast("Can't send empty item!");
    }
  }

  // send data to back-end
  sendData() {
    if (this.readyToSendData.length) {
      /*{
  "Header": {
    "EventID": "50"
  },
  "Data": [
    {"PointsID": "21", "No": "61", "Result": "14.40"},
    {"PointsID": "21", "No": "62", "Result": "14.41"}
  ]
}*/
      const data = {
        Header: {
          EventID: this.eventID
        },
        Data: this.readyToSendData
      };
      // TODO: handle success and error cases, clear array
      this.dataService.sendData(data).subscribe();
    }
  }

  // open and listen to serial port
  listenToRS232Connection() {
    this.serial.requestPermission().then(() => {
      this.showToast('Request Permission done');
      console.log('Request Permission done');
      this.serial.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 0,
        dtr: false,
        rts: false,
        sleepOnPause: false
      }).then(() => {
        this.showToast('Serial connection opened');
        console.log('Serial connection opened');
        this.serial.registerReadCallback()
          .subscribe((data) => {
            // output incoming data
            this.receive232Buffer(data);
          });
      });
    }).catch((error: any) => {
      this.showToast(error);
      console.log(error);
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

      if (eNext.value[1] === 10) {
        // Dati ir sanemti, jaieliek saraksta jauns rezultats. Pagaidam tikai izvads
        this.showToast(this.rs232Received);
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


interface Driver {
  number: string;
  name: string;
  time: string;
  empty: boolean;
}
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Serial } from '@ionic-native/serial';

@Component({
  selector: 'page-time-tracker',
  templateUrl: 'time-tracker.html',
})
export class TimeTrackerPage {

  parameters: any;
  drivers: any;
  selectedPoint: any;

  driversData: Array<Object> = [
    {
      number: 1,
      driver: 'John Doe',
      time: '02:32:45:762'
    }, {
      number: 2,
      driver: 'James Rock',
      time: '02:31:13:103'
    }
  ];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private serial: Serial
  ) {
    this.parameters = this.navParams.get('parameters');
    this.selectedPoint = this.navParams.get('point');
    this.drivers = this.navParams.get('drivers');
  }

  ionViewDidLoad() {
    // ..
  }

  sendData() {
    this.serial.requestPermission().then(() => {
      console.log('Request Permission done');
      this.serial.open({
        baudRate: 9800,
        dataBits: 8,
        stopBits: 1,
        parity: 0,
        dtr: false,
        rts: false,
        sleepOnPause: false
      }).then(() => {
        console.log('Serial connection opened');
      });
    }).catch((error: any) => console.log(error));
  }

}

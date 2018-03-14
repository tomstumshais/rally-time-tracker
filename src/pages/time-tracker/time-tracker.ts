import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Serial } from '@ionic-native/serial';

@Component({
  selector: 'page-time-tracker',
  templateUrl: 'time-tracker.html',
})
export class TimeTrackerPage {

  parameters: any;
  drivers: any;
  selectedPoint: any;
  timeFieldFormats: any = {
    A: 'HH:MM',
    B: 'HH:MM:SS.MS',
    F: 'HH:MM:SS.M',
    G: 'HH:MM:SS',
    Q: 'HH:MM:SS.MSX',
    T: 'HH:MM',
    Z: 'HH:MM:SS.MSX'
  };

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
    private toastCtrl: ToastController,
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
    // test Serial port connection
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
            this.showToast(data);
            console.log(data);
          });
      });
    }).catch((error: any) => {
      this.showToast(error);
      console.log(error);
    });
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

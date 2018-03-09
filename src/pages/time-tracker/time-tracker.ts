import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-time-tracker',
  templateUrl: 'time-tracker.html',
})
export class TimeTrackerPage {

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
    public navParams: NavParams
  ) {}

  ionViewDidLoad() {
    // ..
  }

}

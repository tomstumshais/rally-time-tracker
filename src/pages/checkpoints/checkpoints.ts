import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { TimeTrackerPage } from '../time-tracker/time-tracker';

@Component({
  selector: 'page-checkpoints',
  templateUrl: 'checkpoints.html',
})
export class CheckpointsPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams
  ) {}

  ionViewDidLoad() {
    // ..
  }

  goNext() {
    this.navCtrl.push(TimeTrackerPage);
  }

}

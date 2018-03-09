import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { CheckpointsPage } from '../checkpoints/checkpoints';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  accessCode: string = '';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams
  ) {}

  ionViewDidLoad() {
    // ..
  }

  checkAccessCode() {
    console.log(`Access Code: ${this.accessCode}`);
    this.navCtrl.setRoot(CheckpointsPage);
  }

}

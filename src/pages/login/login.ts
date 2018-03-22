import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { CheckpointsPage } from '../checkpoints/checkpoints';
import { DataServiceProvider } from "../../providers/data-service/data-service";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  accessCode: string = '';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private dataService: DataServiceProvider
  ) {}

  checkAccessCode() {
    this.dataService.checkAccess(this.accessCode)
      .subscribe((data: any) => {
        if (data && data.Parameters && data.Parameters.length) {
          // check if access is allowed
          const isAllowed = data.Parameters.find((param) => {
            return param.Code === "Access" && param.Value === "Allowed";
          });

          if (isAllowed) {
            this.navCtrl.setRoot(CheckpointsPage, {
              parameters: data.Parameters,
              points: data.Points,
              drivers: data.Drivers
            });
          } else {
            this.showToast('Access is denied!');
          }
        } else {
          this.showToast('Access is denied!');
        }
      }, (error) => {
        this.showToast('Service error, please try again later or contact your admin!');
        console.log('Service error: ', error);
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

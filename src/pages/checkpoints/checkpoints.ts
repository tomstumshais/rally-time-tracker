import { Component } from "@angular/core";
import { NavController, NavParams, ToastController } from "ionic-angular";

import { TimeTrackerPage } from "../time-tracker/time-tracker";
import { DataServiceProvider } from "../../providers/data-service/data-service";

@Component({
  selector: "page-checkpoints",
  templateUrl: "checkpoints.html"
})
export class CheckpointsPage {
  parameters: any;
  drivers: any;
  points: any;
  selectedPointID: string = "";
  eventName: string = "";
  lastSelectedPointID: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private dataService: DataServiceProvider
  ) {
    this.parameters = this.navParams.get("parameters");
    this.points = this.navParams.get("points");
    this.drivers = this.navParams.get("drivers");

    this.parameters.forEach(param => {
      if (param.Code === "EventName") this.eventName = param.Value;
    });
  }

  ionViewDidLoad() {
    // ..
  }

  goNext() {
    // allow to go to next screen only if selected point
    if (this.selectedPointID) {
      const selectedPoint = this.points.find(point => {
        return point.ID === this.selectedPointID;
      });

      // clear history array
      if (this.lastSelectedPointID !== this.selectedPointID) {
        this.dataService.resultsHistory = [];
      }
      // set new Point ID which to store
      this.lastSelectedPointID = this.selectedPointID;

      this.navCtrl.push(TimeTrackerPage, {
        parameters: this.parameters,
        drivers: this.drivers,
        point: selectedPoint
      });
    } else {
      this.showToast("Please select checkpoint!");
    }
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

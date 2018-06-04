import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";

import { DataServiceProvider } from "../../providers/data-service/data-service";

@Component({
  selector: "page-results-history",
  templateUrl: "results-history.html"
})
export class ResultsHistoryPage {
  selectedPoint: object;
  resultsHistory: Array<object>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private dataService: DataServiceProvider
  ) {
    this.selectedPoint = this.navParams.get("selectedPoint");
    this.resultsHistory = this.dataService.resultsHistory;
  }

  ionViewDidLoad() {
    // ...
  }
}

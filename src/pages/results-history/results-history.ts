import { Component, ViewChild } from "@angular/core";
import { NavController, NavParams, Content } from "ionic-angular";

import { DataServiceProvider } from "../../providers/data-service/data-service";

@Component({
  selector: "page-results-history",
  templateUrl: "results-history.html"
})
export class ResultsHistoryPage {
  @ViewChild(Content) content: Content;
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

  ionViewWillEnter() {
    // scroll content to bottom
    setTimeout(() => {
      this.content.scrollToBottom(0);
    }, 100);
  }
}

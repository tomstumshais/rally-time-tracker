import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { Serial } from "@ionic-native/serial";
import { HttpClientModule } from "@angular/common/http";
import { BrMaskerModule } from "brmasker-ionic-3";

import { MyApp } from "./app.component";
import { LoginPage } from "../pages/login/login";
import { CheckpointsPage } from "../pages/checkpoints/checkpoints";
import { TimeTrackerPage } from "../pages/time-tracker/time-tracker";
import { ResultsHistoryPage } from "../pages/results-history/results-history";
import { DataServiceProvider } from "../providers/data-service/data-service";

@NgModule({
  declarations: [MyApp, LoginPage, CheckpointsPage, TimeTrackerPage, ResultsHistoryPage],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrMaskerModule,
    IonicModule.forRoot(MyApp, {
      scrollAssist: true, // Valid options appear to be [true, false]
      autoFocusAssist: false // Valid options appear to be ['instant', 'delay', false]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, LoginPage, CheckpointsPage, TimeTrackerPage, ResultsHistoryPage],
  providers: [
    StatusBar,
    SplashScreen,
    Serial,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    DataServiceProvider
  ]
})
export class AppModule {}

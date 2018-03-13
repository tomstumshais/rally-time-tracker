import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Serial } from '@ionic-native/serial';

import { MyApp } from './app.component';
import { LoginPage } from "../pages/login/login";
import { CheckpointsPage } from "../pages/checkpoints/checkpoints";
import { TimeTrackerPage } from "../pages/time-tracker/time-tracker";
import { DataServiceProvider } from '../providers/data-service/data-service';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    CheckpointsPage,
    TimeTrackerPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    CheckpointsPage,
    TimeTrackerPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Serial,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DataServiceProvider
  ]
})
export class AppModule {}

# Rally Time Tracker

Rally time tracker app is for to track time for each checkpoint in map. Connected with OTG/Serial port to get data from time measure hardware. When car drive through checkpoint, time measure hardware track it's race time and send it to app. App is open and time comes in through Serial port and fills driver's row with time. User need to enter driver's number and send those data to back-end. Race times for all drivers are gathered in back-end. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To get this Ionic app copy working on your local machine you need:
* npm 5.8.0+ (NodeJS)
* Ionic 3.20.0+ (just version below Ionic 4, because project is not aligned to changes which are made in Ionic 4)
* Cordova 8.0.0+
* OTG/Serial port device/simulator with correct connector
(these are versions which I am using for my development environment, probably could work older versions too, not tested)

### Installing

* install [Node & npm](https://nodejs.org/en/)
* run in your CLI command: `npm install -g ionic cordova` to install Ionic & Cordova
* clone or download project
* go to project root directory ./
* run in CLI command `npm install` to install project dependencies

## Deployment

### Test in web browser

(main app's functionality will not work because web browsers are not supporting Ionic Native Serial plugin)
* run in CLI command: `ionic serve`
* now wait till app loads in your default web browser
* if you are using Google Chrome, you can open Developer tools (Ctrl+Shift+I)
* then open Device toolbar (small mobile/tablet icon at the left top side or just use keyboard shortcut: Ctrl+Shift+M)
* now in Device toolbar you can choose on which device you want to test app and set some other properties like zoom, rotate, width, height and others.
* reload current page and you are ready to testing

### Test on Android device

* install [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html)
* download and install [Android Studio](https://developer.android.com/studio/index.html)
* updated Android SDK tools, platform and component dependencies. Available through [Android Studio’s SDK Manager](https://developer.android.com/studio/intro/update.html)
* enable USB debugging and developer mode on your Android device
* enabling USB debugging and Developer Mode can vary between devices, but is easy to look up with a Google search. You can also check out Enabling On-device Developer Options in the [Android docs](https://developer.android.com/studio/run/device.html#developer-device-options)
* run in CLI command: `ionic cordova run android --device`

Now you are ready to play with it!

**WARNING!** App is properly working only on Android devices because Serial plugin is available only for Android.

## Built With

* [Ionic framework](https://ionicframework.com/)
* [Serial plugin](https://ionicframework.com/docs/native/serial/)

## Contributing

This is a side project and it's in production with v1. There will be added new features in next releases. If you are willing to help, please contact me.

## Authors

* [Toms Tumshais](https://github.com/tomstumshais)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

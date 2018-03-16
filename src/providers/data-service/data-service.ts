import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataServiceProvider {
  url: string = 'https://lrc.lv/zxc/apptest';

  constructor(
    public http: HttpClient
  ) {}
  
  checkAccess(accessCode: string) {
    if ((<any>window).cordova) {
      // running on device/emulator
      return this.http.get(this.url + `/getParams.php?pwd=${accessCode}`);
    } else {
      // running in dev mode
      return this.http.get('assets/mock-data/test-data.json');
    }
  }
  
  sendData(data: any) {
    return this.http.post(this.url + '/setData.php', data);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.url + '/' + endpoint, body, reqOpts);
  }
}

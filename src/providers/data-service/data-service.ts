import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/timeout';

@Injectable()
export class DataServiceProvider {
  private url: string = 'https://lrc.lv/zxc/apptest';
  // store setInterval ID for send data interval
  public intervalTask: number;
  // store driver cards in UI
  public driversData: Array<Driver> = [];
  // store driver data for sending to back-end
  public readyToSendData: Array<any> = [];

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
  
  sendData(data: any, timeout: number) {
    return this.http.post(
      this.url + '/setData.php', 
      this.getFormUrlEncoded({ data: data }), 
      { 
        headers: new HttpHeaders({ // necessary header to pass Form Data
          'Content-Type':  'application/x-www-form-urlencoded'
        }), 
        responseType: 'text' // service return text, not a JSON
      }
    ).timeout(timeout);
  }

  // encode data to Form Data
  getFormUrlEncoded(toConvert) {
		const formBody = [];
		for (const property in toConvert) {
			const encodedKey = encodeURIComponent(property);
			const encodedValue = encodeURIComponent(toConvert[property]);
			formBody.push(encodedKey + '=' + encodedValue);
    }
    
		return formBody.join('&');
	}
}


export interface Driver {
  number: string;
  name: string;
  time: string;
}
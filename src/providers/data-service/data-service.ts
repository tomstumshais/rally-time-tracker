import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataServiceProvider {

  constructor(public http: HttpClient) {
    console.log('Hello DataServiceProvider Provider');
  }

}

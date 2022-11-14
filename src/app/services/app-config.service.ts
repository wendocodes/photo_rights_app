/**reads both enviroment and config.json files
 * inject this whenever you need the config values
 */ 

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

// declare variable for config object
  private appConfig: any;
  
  constructor(private http: HttpClient) {

  }
  // loads the cofig files as observable
  loadAppConfig() {
    return this.http.get('/assets/config.json').toPromise()
      .then(data => {
        this.appConfig = data;
      });
  }

  // gets the config.json data as an object
  get configData() {

    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    
    return this.appConfig;
  }
}

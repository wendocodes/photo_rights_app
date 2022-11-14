import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AppConfigService } from '../services/app-config.service'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // declare variable for config files
  private configData:any;

  constructor(private storage: Storage, 
              private appConfig: AppConfigService) { 
              this.configData=appConfig.configData;
  }

  public async get(key: string): Promise<any> {
    return this.storage.get(key);
  }

  public async set(key: string, value: any): Promise<any> {
    return this.storage.set(key, value);
  }

  public async remove(key: string): Promise<any> {
    return this.storage.remove(key);
  }

  public removeTokens(): Promise<void> {
    return Promise.all([
      this.storage.remove(this.configData.ACCESS_TOKEN),
      this.storage.remove(this.configData.REFRESH_TOKEN)
    ]).then(_ => { return; });
  }

  public setTokens(token: string): Promise<void> {
    return Promise.all([
      this.storage.set(this.configData.ACCESS_TOKEN, token),

      // set a time when the user logs in. Important to track token expiry!
      this.storage.set(this.configData.REFRESH_TOKEN, new Date())
    ]).then(_ => { return; });
  }
}

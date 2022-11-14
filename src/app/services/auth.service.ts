import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../model/user';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { StorageService } from './storage.service';
import { Person } from '../model/person';
import { Child } from '../model/child';
import { AppConfigService } from '../services/app-config.service'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // declare variable for config files
  private configData:any;

  token:any;

  pin: any;

  regStatus: any;

  /**
   * 1 day in miliseconds
   */
  private dayInMiliseconds: number = 1000 * 60 * 60 * 24;

  private currentPerson: BehaviorSubject<Person> = new BehaviorSubject<Person>(null);

  private currentChildren: BehaviorSubject<Child> = new BehaviorSubject<Child>(null);

  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * injects needed dependencies and loads currently logged in person
   */
  constructor(
    private httpClient: HttpClient,
    private http: HttpClient,
    private storage: StorageService,private appconfig:AppConfigService) {

      this.configData=this.appconfig.configData;
      console.log(this.configData.ACCESS_TOKEN);
      // when updateLoggedIn() is called it updates the loggedIn status.
      // subscribe to these changes here to maybe update the currently logged in person
      this.getLoggedIn().subscribe(loggedIn => {

        console.log('Updated logged in to', loggedIn);

        // not logged in -> set current person to null (if it isn't already)
        if (!loggedIn) {
          if (this.currentPerson.getValue() !== null) { this.currentPerson.next(null); }
          return;
        }

        // else try to load person from backend
        this.loadLoggedInPerson();
      });

      // trigger check on init
      this.updateLoggedIn();

      // debug logging
      this.loggedInPerson().subscribe(person => console.log('Updated logged in person to', person));
  }

  public async updateLoggedIn(): Promise<void> {

    // check if logged in, update status if changed
    this.isLoggedIn().then(loggedIn => {
      if (this.loggedIn.getValue() !== loggedIn) {
        this.loggedIn.next(loggedIn);
      }
    });
  }

  public getLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  public getLoggedInValue(): boolean {
    return this.loggedIn.getValue();
  }

  public loggedInPerson(): Observable<Person> {
    return this.currentPerson.asObservable();
  }

  
  public loggedinChildren(): Observable<Child> {
    return this.currentChildren.asObservable();
  }

  /**
   * getter for jwt-token
   */
  private getToken(): Promise<string> {
    return this.storage.get(this.configData.ACCESS_TOKEN).then((token: string) => token);
  }


  /**
   * getter for status
   */
   private getStatus(): Promise<string> {
    return this.storage.get(this.configData.STATUS).then((regStatus: string) => regStatus);
  }

  /**
   * get standard cors-headers for request to backend
   */
  public getBackendRequestHeaders(): {[key: string]: string} {
      return {
        'Access-Control-Allow-Origin': '*',   // ! für development ok, in production kann der genaue origin den * stern ersetzen
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT', // permitted methods. Very important! for Cors
    };
  }

  /**
   * get Registration status in headers
   */
   public async getRegistrationStatusOfLegalGuardian(): Promise<{ [key: string]: string; }> {
    return {
      'Access-Control-Allow-Origin': '*',  
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT', 
      ...this.getRegistrationStatusOfLegalGuardian,
      Authentication: await this.getStatus()
    };
  }


  /**
   * get standard cors-headers for request to backend and Authentication
   */
  public async getAuthenticatedBackendRequestHeaders(): Promise<{[key: string]: string}> {
    return {
      ...this.getBackendRequestHeaders(),
      Authentication: await this.getToken()
    };
  }

  /**
   * check with existance of token and timestamp of last login
   */
  private async isLoggedIn(): Promise<boolean> {

    // check if the token key had been set in ionic storage
    return this.storage.get(this.configData.ACCESS_TOKEN).then(async (val) => {

      // no access token saved
      if (!val) { return false; }

      // get the REFRESH_TOKEN, which is the exact time a user logs in
      const refreshToken: string = await this.storage.get(this.configData.REFRESH_TOKEN);

      // check if a refresh token value has been set or not
      if (!refreshToken) { return false; }

      // token too old?
      const daysSinceLogin = this.checkToken(refreshToken);

      // token is valid
      if (daysSinceLogin <= this.configData.NUMBER_OF_DAYS) { return true; }

      // remove expired tokens
      await this.storage.removeTokens();
      return false;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
  }

  /**
   * authenticate a User by providing user credentials (username and password)
   * @param user to login
   * @return Observable
   */
  public login(user: User): Observable<any> {

    const header = new HttpHeaders({
      ...this.getBackendRequestHeaders(),
      Accept: 'application/json',
      'content-type': 'application/json'
    });

    const postParams = { username: user.username, pwd: user.password, email: null };

    return this.httpClient.post(this.configData.API_URL + 'login', postParams, { headers: header });
  }

  /**
   * method for reset password
   */
    public forgotPassword(user: User): Promise<any> {

    const header = new HttpHeaders({
      ...this.getBackendRequestHeaders(),
      Accept: 'application/json',
      'content-type': 'application/json'
    });

    const uEmail = {email: user.email };

      return new Promise((resolve,reject)=>{
          this.httpClient.post(this.configData.API_URL + 'resetPassword', uEmail, { headers: header }).subscribe(data=>{
            resolve(data);
          },err=>{
            reject(err);
          })
      })
  }

  /**
   * verify PIN of Added Legal Guardian 
   * @param person
   * @return Observable
   */
   public verifyPin(pin) {
    const header = new HttpHeaders({
      ...this.getBackendRequestHeaders(),
      Accept: 'application/json',
      'content-type': 'application/json'
    });
    const postParams = { pin: pin };
  
    return new Promise((resolve,reject)=>{
      this.httpClient.post(this.configData.API_URL + 'verifyPin', postParams, { headers: header }).subscribe
      (data=>{
        console.log("data : ",data);
        resolve(data);
      },err=>{
        reject(err);
        console.log("from auth:",err);
      })
    })
  }

  /**
   * legal guardian profile update after PIN verification
   */
   public register(user: User, person: Person): Observable<any> {

    const header = new HttpHeaders({
      ...this.getBackendRequestHeaders(),
      Accept: 'application/json',
      'content-type': 'application/json'
    });
    const u = {username: user.username, pwd: user.password, email: user.email};
    const p = {firstName: person.firstName, lastName: person.lastName, email: person.email, birthdate: person.birthdate};
    return this.httpClient.post(`${this.configData.API_URL}create_credential`, {'user': u, 'person': p},
      { headers: header });
  }

  /**
   * Logout
   */
  public logout(): Promise<void> {

    return this.storage.removeTokens().then(_ =>
      this.updateLoggedIn());
  }

  /**
   * do token validity check here
   * @returns time since last login in days
   */
  private checkToken(val: string): number {
    const d1 = new Date(val).getTime();
    const d2 = new Date().getTime();
    return (d2 - d1) / this.dayInMiliseconds;
  }

  /**
   * uses jwt token to get current logged in person from backend
   *
   * Don't attempt to await the promises' return, the excecution will be later due to an Observable.
   * If interested in the currently logged in person, subscribe to this.loggedInPerson()
   */
  private async loadLoggedInPerson(): Promise<void> {
    if (!await this.isLoggedIn()) { return; }

    // get person from backend
    // send post request with authorization-header and photos
    const headerDict = await this.getAuthenticatedBackendRequestHeaders();

    this.http.get<Person>(`${this.configData.API_URL}profile/person`,
      {observe: 'response', headers: new HttpHeaders(headerDict)}).subscribe(
        
        // person data is in the "person" object and store it  in the current person
        (response:any) => {this.currentPerson.next(response.status === 200 ? response.body.person : null);console.log("person api : ",response.body.person);this.loadChildren(response.body.childdata)},
        (error: HttpErrorResponse) => this.currentPerson.next(null)
    );
  }

  /**
   * Current child
   */
   private async loadChildren(childdata): Promise<void> {
    if (!await this.isLoggedIn()) { return; }

    // get current chilren from backend

    this.currentChildren.next(childdata);
            console.log("child api : ",childdata)
  }
}

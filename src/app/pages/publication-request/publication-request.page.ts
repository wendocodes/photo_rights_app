import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Person } from 'src/app/model/person';
import { AuthService } from 'src/app/services/auth.service';
import { NetworkService } from 'src/app/services/network.service';
import { AppConfigService } from '../../services/app-config.service'


/**
 * Status a PublicationRequest can be in.
 * It can be pending (unanswered by the user), allowed (the user permits the image to be published)
 * or forbidden (the user does not want the image to be published)
 */
enum PermissionStatus {
  pending,
  allowed,
  forbidden
}


/**
 * A PublicationRequest is a request to publish images with the user on it.
 * The user can allow or forbit its usage.
 */
interface PublicationRequest {
  id: number,
  text: string;
  image: string;    // base64
  status: PermissionStatus;
  date: Date;

  sending: boolean;
}

@Component({
  selector: 'app-publication-request',
  templateUrl: './publication-request.page.html',
  styleUrls: ['./publication-request.page.scss'],
})
export class PublicationRequestPage {
  
  // declare variable for config files
  private configData: any;

  /**
   * is device online?
   */
  private online: boolean = false;

  /**
   * reference to timer, controlls polling of new PublicationRequest from backend.
   * Needed to set it on pageload and cancel on page leaving.
   */
  private timer;

  /**
   * sendBuffer in case the device is offline. Collects all changes of PermissionStati for sending to backend.
   */
  private sendBuffer: BehaviorSubject<{id: number, status: PermissionStatus}[]> = new BehaviorSubject<{id: number, status: PermissionStatus}[]>([]);

  /**
   * All publication requests that appear as list in the view.
   */
  pubRequests: PublicationRequest[] = [];
  
  person: Person;

  loggedIn: boolean = false;


  /**
   * Injects necessary dependencies.
   * Subscribes to on/offline status, because we needed to know when not to send requests.
   * Subscribes to changes of sendBuffer to be able to send changes in PermissionStati.
   */
  constructor(private networkService: NetworkService,
              private authService: AuthService,
              private http: HttpClient,
              private auth: AuthService,
              private appConfig: AppConfigService) {
    this.configData=appConfig.configData;
    this.networkService.isOnline().subscribe((online: boolean) => this.online = online);

    this.sendBuffer.asObservable().subscribe(entries => {
      if (!entries.length) return;

      // use variable _this for this, because otherwise the context in sendIfOnline() is different and this could not be accessed as usual.
      const _this = this;

      // setup polling as long as all are sent successfully
      setTimeout(() => _this.sendIfOnline(), 3000);
    })

    this.auth.loggedInPerson().subscribe(person => this.person = person);
    this.auth.getLoggedIn().subscribe(loggedIn => this.loggedIn = loggedIn);
  }


  /**
   * poll backend for new requests
   */
  ionViewDidEnter() {

    // prepare constant values
    this.authService.getAuthenticatedBackendRequestHeaders().then(headers => {

      // use variable _this for this, because otherwise the context in updatePublicationRequests() is different and this could not be accessed as usual.
      const _this = this;

      const url = `${this.configData.API_URL}gallery/pubRequest`;

      // setup polling
      this.timer = setInterval(() => _this.updatePublicationRequests(url, headers), 3000);
    });
  }


  /**
   * stop polling if page is not displayed
   */
  ionViewWillLeave() {
    clearInterval(this.timer);
  }


  /**
   * ask backend for permission requests
   */
  private async updatePublicationRequests(url: string, headers: {[key: string]: string}): Promise<void> {
    
    // doesnt make sense otherwise
    if (!this.online) { return; }

    // send get request with authorization-header
    const headerDict = headers;
    const options = {headers: new HttpHeaders(headerDict), observe: 'response' as 'response' };

    this.http.get<PublicationRequest[]>(url, options).subscribe(
      (response: HttpResponse<PublicationRequest[]>) => {
        console.log(`polling: ${response.status} ${response.statusText}`);
        this.pubRequests = response.body;
      },
      (error: HttpErrorResponse) => {
        if (!error.status) console.error(`polling: No response status found. Are you logged in? Is the backend running?`)
        else console.error(`polling: ${error.status} ${error.error}`)
      }
    );
  }


  /**
   * allow usage of image with given id, sent that to backend, too
   */
  allow(id: number) {
    this.queueChanges(id, PermissionStatus.allowed);
  }


  /**
   * deny usage of image with given id, sent that to backend, too
   */
  forbid(id: number) {
    this.queueChanges(id, PermissionStatus.forbidden);
  }

  
  /**
   * save change in permission of imag with given id for sending to backend
   */
  private async queueChanges(id: number, status: PermissionStatus) {
    console.log("queue changes: id", id, PermissionStatus[status]);

    // set PublicationRequest to sending
    this.pubRequests = this.pubRequests.map(req => req.id == id ? {...req, sending: true} : req);

    // update sendBuffer
    let val = this.sendBuffer.getValue().filter(e => e.id != id);   // get all currently pending, remove all with same id (add most current anyway)
    val.push({id, status});
    this.sendBuffer.next(val);
  }


  /**
   * send post requests to backend for each entry in and update the sentBuffer afterwards.
   * calls .next() on this.sendBuffer to notify subscribers of (potential) change (see subscription in constructor).
   */
  private async sendIfOnline(): Promise<void> {

    if (!this.online) return;

    // send post request with authorization-header and permission changes
    const headerDict = await this.authService.getAuthenticatedBackendRequestHeaders();

    // collect all claas to the backend
    const backendCalls = this.sendBuffer.getValue().map(e => {
      const { id, status } = e;

      return this.http.post(`${this.configData.API_URL}gallery/pubRequest/${id}`, status,
        {observe: 'response', headers: new HttpHeaders(headerDict)}).toPromise();
    });

    // perform all calls asyncronously. Run the logic in callbacks as soon as every promise has terminated (or returned an error).
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
    return Promise.allSettled(backendCalls).then(results => {

      // stop spinner
      this.pubRequests = this.pubRequests.map(req => ({...req, sending: false}));

      // get ids of all successful sends
      const idsOfSuccessfulSends: number[] = results
                                              .filter(res => res.status == "fulfilled" && res.value.status === 200)  // successful?
                                              .map((res: any) => parseInt(res.value.url.split("/").reverse()[0]));  // get id of url of Response object res.value

      // update status of all successful ones
      const successfulStati: {[id: number]: PermissionStatus} = this.sendBuffer.getValue().reduce((dict, entry) => { dict[entry.id] = entry.status; return dict; }, {});
      this.pubRequests = this.pubRequests.map(req => idsOfSuccessfulSends.includes(req.id) ? {...req, status: successfulStati[req.id]} : req);

      // log error message of all failed
      results
        .filter(res => res.status == "rejected" || res.value.status !== 200)
        .map(res => res.status == "rejected" ? {status: res.reason.status, error: res.reason.error} : {status: res.value.status, error: res.value.statusText})
        .forEach(error => {
          if (!error.status) console.error(`changed: No response status found. Are you logged in? Is the backend running?`);
          else console.error(`changed: ${error.status}, ${error.error}`);
        });

      // set the sendBuffer to try the falied ones again
      const failedSends: {id: number, status: PermissionStatus}[] = this.sendBuffer.getValue().filter(e => !idsOfSuccessfulSends.includes(e.id));
      this.sendBuffer.next(failedSends);
    })
    .catch(e => console.error(e));
  }
}

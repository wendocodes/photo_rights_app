import { Injectable } from '@angular/core';
import { Network, NetworkStatus } from '@capacitor/core';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private online: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private status: BehaviorSubject<NetworkStatus> = new BehaviorSubject<NetworkStatus>(
    {
      connected: false,
      connectionType: 'none'
    }
  );

  constructor(private toastCtrl: ToastController) {
    /** show actual network status when the component is rendered */
    this.listenToNetwork();
  }


  /**
   * Observable of current network status
   */
  public getStatus(): Observable<NetworkStatus> {
    return this.status.asObservable();
  }


  /**
   * Observable indicating if device is online (or not)
   */
  public isOnline(): Observable<boolean> {
    return this.online.asObservable();
  }


  /**
   * update the status variable with data about the current state of the network
   */
  private async updateStatus(status: NetworkStatus) {
    console.log(`Network status changed: ${status.connected ? 'connected' : 'not connected'}, ${status.connectionType}`);
    this.status.next(status);
    this.online.next(status.connected);

    // could be optional
    try {
      if (!status.connected) { this.presentOfflineToast(); }

    } catch (e) { console.error(e); }
  }


  /**
   * listen for network change, and present a message when disconnected
   */
  private listenToNetwork(): Promise<void> {

    // listener for changes
    Network.addListener('networkStatusChange', (status: NetworkStatus) => this.updateStatus(status));

    // initial value
    return Network.getStatus().then((status: NetworkStatus) => this.updateStatus(status));
  }


  /**
   * toast saying that device is offline
   */
  private async presentOfflineToast(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Sie sind nicht online.',
      duration: 3000,
      position: 'bottom'
    });
    return toast.present();
  }
}

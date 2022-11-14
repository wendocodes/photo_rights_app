import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LoadingOptions } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loaders: HTMLIonLoadingElement[] = [];

  constructor(private loadingController: LoadingController,
              private translate: TranslateService) { }

  /**
   * Displays loading spinner and returns a reference to hide it later
   * @param options   LoadingOptions to control the spinner's appereance and behaviour
   */
  public async presentLoading(options: LoadingOptions = null): Promise<HTMLIonLoadingElement> {

    if (options === null) {
      options = {
        message: await this.translate.get('defaultSpinner').toPromise(),
        duration: 5000
      };
    }

    const loader: HTMLIonLoadingElement = await this.loadingController.create(options);
    this.loaders.push(loader);

    return loader.present().then(_ => loader);
  }


  /**
   * Hides the loading spinner of given reference, if it exists
   * @param loader   the mentioned reference
   */
  public async hideLoading(loader: HTMLIonLoadingElement): Promise<void> {

    if (loader == null || !this.loaders.includes(loader)) { return; }

    await loader.dismiss();
    this.loaders = this.loaders.filter(l => l !== loader);
  }

  async presentLoder(){
    const loader=await this.loadingController.create({
      message:"Please Wait.."
    })
    return loader.present();
  }
}

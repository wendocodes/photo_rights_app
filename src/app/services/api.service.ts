import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Photo } from '../model/photo';
import { AuthService } from './auth.service';
import { ImageContext, PhotoService } from './photo.service';
import { AppConfigService } from '../services/app-config.service'
import { Events } from './events.service'
import { LoadingController } from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // declare variable for config files
  private configData: any;
  /**
   * Just inject needed dependencies
   */
  constructor(private http: HttpClient,
              private photoService: PhotoService,
              private authService: AuthService, private appConfig: AppConfigService,private event:Events,private loader:LoadingController) {
              this.configData=appConfig.configData;
               }

  public async upload(files: Photo[], context: ImageContext) {
    let url: string;
    let name: string;
    switch (context) {
      case ImageContext.Gallery:
        url = `${this.configData.API_URL}gallery/upload`;
        name = 'files';
        break;

      case ImageContext.IdPicture:
        url = `${this.configData.API_URL}profile/idPictureUpload`;
        name = 'file';
        break;
    }

    // set all to sent
    this.photoService.setSent(files, context);

    const formData = new FormData();

    // collect photos for upload
    return Promise.allSettled(
      files.map(async (img: Photo) => {
        const base64: string = await this.photoService.getContentAsBase64(img);

        // convert base64 string to blob
        const blob: Blob = await fetch(base64)
          .then(res => res.blob())
          .catch(async err => {

            // base64 hadn't had a mimetype? Try with one again
            if (err instanceof TypeError) {
              const mime = this.photoService.getMimetype(img) || 'image/jpeg';
              return await fetch(`data:${mime};base64,${base64}`).then(res => res.blob());
            }
          });
        formData.append(name, blob, img.name);
      })).then(async _ => {

        // send post request with authorization-header and photos
        const headerDict = await this.authService.getAuthenticatedBackendRequestHeaders();

       return this.http.post(url, formData,
          {observe: 'response', headers: new HttpHeaders(headerDict)}).subscribe(

            // log status of upload
            response => this.handleUploadResponse(response.status, response.statusText, files, response.body, context), // success
            (error: HttpErrorResponse) => this.handleUploadResponse(error.status, error.error, files, null, context)   
           // error
        );
      });
  }


  /**
   * Handle Upload responses from the server
   */
  private async handleUploadResponse(status: number, text: string, photos: Photo[], body: any, context: ImageContext) {
    switch (status) {
      case 200:
        console.log(`Image uploaded successfully: ${text} (status ${status})`);
        this.photoService.setUploaded(photos, context);

        // backend returned cropped image, display it and save it persistently
        if (context === ImageContext.IdPicture) {
          await this.photoService.updateIdPicture(body.base64Image);
          localStorage.setItem("lastuploadedphoto",body.base64Image);
          this.loader.dismiss();
          this.event.publish("photo:changed","1");
        }

        break;

      case undefined:
        this.loader.dismiss();
        console.error(`Image not uploaded successfully: No response status found`);
        this.photoService.setUploadFailed(photos, context);
        break;

      case 400:
        this.loader.dismiss();
        console.log(`Following images not uploaded successfully: ${text}`);
        let filenames: string[];
       
        if(typeof(text)=="object")
        {
          // get the filenames and display the error message being returned in the text object
          const text2=JSON.parse(JSON.stringify(text));
          filenames= text2.filename.split(' , ').map(name => name.trim());
          let arr=text2.message.split(": ");
          let m,mecode;
          if(arr[1]=="2face"){
           mecode="2";
          }else if(arr[1]=="unsupportedformat"){
             mecode="3";
          }else{
            mecode="1";
          }
          console.log("mecode is : "+mecode);
        this.photoService.setUploadFailedMessage( photos.filter(p => filenames.includes(p.name)), context,mecode );
        // calls the showError function
        this.photoService.setUploadFailedShowError( photos.filter(p => filenames.includes(p.name)), context);

        }else{
          
          filenames= text.split(' , ').map(name => name.trim());

        }

        this.photoService.setUploaded( photos.filter(p => !filenames.includes(p.name)), context );
        this.photoService.setUploadFailed( photos.filter(p => filenames.includes(p.name)), context );
        break;

      default:
        this.loader.dismiss();
        console.error(`Image not uploaded successfully: ${text} (status ${status})`);
        this.photoService.setUploadFailed(photos, context);
    }
    return text;
  }
}

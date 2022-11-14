import { Component } from '@angular/core';
import { FaceExceptionErrors } from 'src/app/model/errors';
import { Person } from 'src/app/model/person';
import { Photo } from 'src/app/model/photo';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ImageContext, PhotoService } from 'src/app/services/photo.service';
import { Events } from '../../services/events.service'
import { LoadingService }from 'src/app/services/loading.service'
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  idPicture: Photo;
  lastPhoto:any;
  person: Person;

  // set a photoselected property for whether the photo is selected or not
  photoselected:boolean=false;

  // set showError boolean property to false
  showError:boolean=false;
  // set loggedIn boolean property to false
  loggedIn: boolean = false;

  errors: FaceExceptionErrors = new FaceExceptionErrors();

  constructor(private apiService: ApiService,
              private photoService: PhotoService,
              private auth: AuthService,
              private event:Events,
              private loading:LoadingService) {
    // load persisted photos from PhotoService when it is ready
    this.photoService.isReady().subscribe(ready => {
      if (!ready) { return; }
      // update this.photos on every change of persisted photos
      this.photoService.getIdPicture().subscribe(photo =>
        this.idPicture = photo
        
      );
    });

    this.auth.loggedInPerson().subscribe(person => this.person = person);
    this.auth.getLoggedIn().subscribe(loggedIn => this.loggedIn = loggedIn);

    /**show a static photo on the profile whenever a user is entering the app for the first time.
     * so the local storage property last updated photo will not have been set at that moment. 
     * if it has a value, put it in the lastphoto variable.
     */ 
    if(localStorage.getItem("lastuploadedphoto")==undefined || localStorage.getItem("lastuploadedphoto")==""){
      this.lastPhoto="../../assets/imgs/profile.png";
    }else
    this.lastPhoto=localStorage.getItem("lastuploadedphoto");
    // subscribe to the photochanged event that will fire from api.service only when there's a succcessful upload
    this.event.subscribe("photo:changed",(data)=>{
        this.lastPhoto=localStorage.getItem("lastuploadedphoto")
    })
  }

  async takePicture(): Promise<void> {
    this.photoService.takePhoto(ImageContext.IdPicture).then((data)=>{
      console.log(data);
    this.photoselected=true;

    },err=>{
      console.log(err)
      this.photoselected=false;
    })
  }

  /** send a photo to backend for cropping */
  uploadPicture() {
    this.loading.presentLoder();
    return this.apiService.upload([this.idPicture], ImageContext.IdPicture);
  }


  /**
   * Ask backend for most current IdPicture
   */
  public ionViewWillEnter() { 
    this.photoselected=false;
    setTimeout(() => {
      if(this.idPicture){
        this.idPicture.showError=false;
      }
    }, 100);  
  }
}
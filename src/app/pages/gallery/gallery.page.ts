import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Photo } from 'src/app/model/photo';
import { ImageContext, PhotoService } from 'src/app/services/photo.service';
import { Subscription } from 'rxjs';
import { Person } from 'src/app/model/person';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
})
export class GalleryPage {

  /**
   * array of photos
   */
  photos: Photo[] = [];

  person: Person;

  loggedIn: boolean = false;

  /**
   * Add dependencied to page. Subscribe to photos of PhotoService to update automatically on every change.
   */
  constructor(public photoService: PhotoService,
              private apiService: ApiService,
              private auth: AuthService) {

    // load persisted photos from PhotoService when it is ready
    this.photoService.isReady().subscribe(ready => {
      if (!ready) { return; }

      // update this.photos on every change of persisted photos
      this.photoService.getPhotos().subscribe(photos => {

        this.photos = photos.map(p => {
          const atIndex: number = this.photos.indexOf(p);

          // use isChecked value of this.photos if it exists, else use false
          p.isChecked = atIndex !== -1 && this.photos[atIndex].isChecked;
          return p;
        });

        console.log('updated photos:');
        console.table(this.photos);
      });
    });

    this.auth.loggedInPerson().subscribe(person => this.person = person);
    this.auth.getLoggedIn().subscribe(loggedIn => this.loggedIn = loggedIn);
  }

  /**
   * calls addNewToGallery method when a user opens camera
   * takes photo and adds to the gallery
   */
  async takePicture(): Promise<void> {
    this.photoService.takePhoto(ImageContext.Gallery);
  }


  /** send a photo to an endpoint in backend */
  uploadPictures(): Promise<Subscription> {
    return this.apiService.upload(this.photos.filter(p => p.isChecked), ImageContext.Gallery);
  }


  /**
   * delete selected images and reset the array
   */
  async deleteImages(): Promise<void[]> {
    return this.photoService.deletePictures(this.photos.filter(p => p.isChecked));
  }
}

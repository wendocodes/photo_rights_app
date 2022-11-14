import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, FilesystemDirectory, CameraPhoto,
  CameraSource, Capacitor, FileDeleteResult, FileReadResult, FileWriteResult } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Photo } from '../model/photo';
import { LanguageSwitcherService } from './language-switcher.service';

const { Camera, Filesystem, Storage } = Plugins;


export enum ImageContext {
  Gallery,
  IdPicture
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  /**
   * state indicating if the service is ready to be used or not
   */
  private ready: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * contains all photos that are stored locally
   */
  private photos: BehaviorSubject<Photo[]> = new BehaviorSubject([]);

  /**
   * contains idPicture that is stored locally
   */
  private idPicture: BehaviorSubject<Photo> = new BehaviorSubject(null);

  /**
   * key the persisted files are stored at in ionic Storage
   */
  private readonly PHOTO_STORAGE = 'photos';

  /**
   * key the persisted files are stored at in ionic Storage
   */
  private readonly ID_PICTURE_STORAGE = 'id_picture';


  /**
   * initializes the service and loads images as soon as the platform is ready
   *
   * @param platform  injected property to see when the service may start working and on what platform
   */
  constructor(private platform: Platform,
              private languageSwitcherService: LanguageSwitcherService) {
    platform.ready().then((readySource: string) => {
      this.loadSaved().then(_ => this.ready.next(true));
    });

    // for debug only
    this.isReady().subscribe(ready => {
      if (!ready) { return; }

      this.getIdPicture().subscribe(photo => console.log('updated idPicture:', photo));
    });
  }


  /**
   * State indicating if the service is ready to be used or not. Can be subscribed to.
   */
  public isReady(): Observable<boolean> {
    return this.ready.asObservable();
  }

  /**
   * returns all photos that are stored locally
   */
  public getPhotos(): Observable<Photo[]> {
    return this.photos.asObservable();
  }

  /**
   * returns idPhoto that is stored locally
   */
  public getIdPicture(): Observable<Photo> {
    return this.idPicture.asObservable();
  }

  /**
   * set isSent of all recieved photos to true
   */
  public setSent(sentPhotos: Photo[], context: ImageContext): Promise<void> {
    return this.setBoolFieldTrue(sentPhotos, 'isSent', context);
  }


  /**
   * set isUploaded of all recieved photos to true
   */
  public setUploaded(uploadedPhotos: Photo[], context: ImageContext): Promise<void> {
    return this.setBoolFieldTrue(uploadedPhotos, 'isUploaded', context);
  }

  /**
   * set uploadFailed of all recieved photos to true
   */
  public setUploadFailed(notUploadedPhotos: Photo[], context: ImageContext): Promise<void> {
    return this.setBoolFieldTrue(notUploadedPhotos, 'uploadFailed', context);
  }
// sets the error message of the not uploaded
  public setUploadFailedMessage(notUploadedPhotos: Photo[], context: ImageContext,msg): Promise<void> {
    return this.setBoolFieldTrueMessage(notUploadedPhotos, 'errorMessage', context,msg);
  }
// if there's so error, then the showError property should be made true.
  public setUploadFailedShowError(notUploadedPhotos: Photo[], context: ImageContext): Promise<void> {
    return this.setBoolFieldTrue(notUploadedPhotos, 'showError', context);
  }

  /**
   * reads content of file represented by photo and returns it as base64 blob
   *
   * @param photo  contains path to the file in filesystem
   */
  public async getContentAsBase64(photo: Photo): Promise<string> {

    if (!this.platform.is('hybrid')) { return photo.webviewPath; }

    return this.loadPhoto(photo.filepath);
  }

  public getMimetype(photo: Photo) {
    let extension = photo.filepath.split('.').reverse()[0];

    if (['jfif', 'jpeg', 'jpg', 'pjpeg', 'pjp'].indexOf(extension) !== -1) { extension = 'jpeg'; }
    return `image/${extension}`;
  }


  /**
   * open device camera and take a photo
   */
  public async takePhoto(context: ImageContext): Promise<void> {

    // Prompt the user to pick a photo from an album, or take a new photo with the camera.
    // for docs on CameraOptions, see https://capacitorjs.com/docs/apis/camera#cameraoptions
    
    const Capturedimage = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Uri,

      source: CameraSource.Prompt,
      promptLabelPhoto: this.languageSwitcherService.translateByKey('PHOTO_PROMPT.fromGallery'),
      promptLabelPicture: this.languageSwitcherService.translateByKey('PHOTO_PROMPT.takePicture'),
      promptLabelCancel: this.languageSwitcherService.translateByKey('PHOTO_PROMPT.cancel')
    }).then((data:any)=>{
      return data;
    },err=>{
      console.log("error is : ",err);
      return new Promise((resolve,reject)=>{
        reject(err);
      })
    })
    const savedImageFile: Photo = await this.savePicture(Capturedimage);


    switch (context) {

      // Add new photo to gallery
      case ImageContext.Gallery:

        const photos: Photo[] = this.photos.getValue();
        photos.unshift(savedImageFile);

        // Cache all photo data for future retrieval
        return Storage.set({
          key: this.PHOTO_STORAGE,
          value: JSON.stringify(photos)
        })
        .then(_ => this.photos.next(photos));

      // set profile image
      case ImageContext.IdPicture:

        return Storage.set({
          key: this.ID_PICTURE_STORAGE,
          value: JSON.stringify(savedImageFile)
        })
        .then(_ => this.idPicture.next(savedImageFile));
    }
  }


  /**
   * delete picture by removing it from reference data and the filesystem
   *
   * @param photo the picture to be deleted
   */
  public async deletePicture(photo: Photo): Promise<void> {

    // delete from persistent filesystem
    return Filesystem.deleteFile({
      path: photo.name,
      directory: FilesystemDirectory.Data
    })
    .then(async (_: FileDeleteResult) => this.deleteFromStorage(photo))
    .catch(err => {
      if ((err as Error).message.startsWith('File does not exist')) {
        this.deleteFromStorage(photo);
      } else {
        console.error(err);
      }
    });
  }


  /**
   * delete mutiple photos
   */
  public async deletePictures(photos: Photo[]): Promise<void[]> {
    return Promise.all(photos.map(photo => this.deletePicture(photo)));
  }


  /**
   * save the cropped photo returned from the server
   */
  public async updateIdPicture(base64Data: string): Promise<void> {

    const oldIdPicture: Photo = this.idPicture.value;


    /**
     * save to FilesystemDirectory.External
     * The external directory On iOS it will use the Documents directory On Android
     * it's the directory on the primary shared/external * storage device where the
     * application can place persistent files it owns. These files are internal to
     * the applications, and not * typically visible to the user as media. Files
     * will be deleted when the application is uninstalled.
     */
    const savedFile: FileWriteResult = await Filesystem.writeFile({
      path: oldIdPicture.name,
      data: base64Data,
      directory: FilesystemDirectory.External // TODO difference to FilesystemDirectory.Data ?
    });

    // assign old idPicture with new base64 image data
    const idPicture: Photo = {
      ...oldIdPicture,
      webviewPath: this.platform.is('hybrid') ? Capacitor.convertFileSrc(savedFile.uri) : base64Data
    };

    // save it in storage to find location
    Storage.set({
      key: this.ID_PICTURE_STORAGE,
      value: JSON.stringify(idPicture)
    })
    .then(_ => this.idPicture.next(idPicture));
  }





  /**
   * sets the named field of all recieved photos to true
   */
  private setBoolFieldTrue(changedPhotos: Photo[], field: string, context: ImageContext): Promise<void> {
    console.log("changed photos:",changedPhotos);
    switch (context) {
      case ImageContext.Gallery:
        const photos: Photo[] = this.photos.getValue();
        const changedPhotoFilepaths: string[] = changedPhotos.map(p => p.filepath);
        photos.forEach(p => { if (changedPhotoFilepaths.includes(p.filepath)) { p[field] = true; } });

        return Storage.set({
          key: this.PHOTO_STORAGE,
          value: JSON.stringify(photos)
        })
        .then(_ => this.photos.next(photos));

      case ImageContext.IdPicture:
        const idPicture: Photo = this.idPicture.getValue();
        if (changedPhotos.length !== 1 || idPicture !== changedPhotos[0]) { return; }

        idPicture[field] = true;
        return Storage.set({
          key: this.ID_PICTURE_STORAGE,
          value: JSON.stringify(idPicture)
        })
        .then(_ => this.idPicture.next(idPicture));
        
    }
  }

  private setBoolFieldTrueMessage(changedPhotos: Photo[], field: string, context: ImageContext,msg): Promise<void> {
    console.log("changed photos:", msg);
    switch (context) {
      case ImageContext.Gallery:
        const photos: Photo[] = this.photos.getValue();
        const changedPhotoFilepaths: string[] = changedPhotos.map(p => p.filepath);
        photos.forEach(p => { if (changedPhotoFilepaths.includes(p.filepath)) { p[field] = true; } });

        return Storage.set({
          key: this.PHOTO_STORAGE,
          value: JSON.stringify(photos)
        })
        .then(_ => this.photos.next(photos));

      case ImageContext.IdPicture:
        const idPicture: Photo = this.idPicture.getValue();
        if (changedPhotos.length !== 1 || idPicture !== changedPhotos[0]) { return; }

        idPicture[field] = msg;
        return Storage.set({
          key: this.ID_PICTURE_STORAGE,
          value: JSON.stringify(idPicture)
        })
        .then(_ => this.idPicture.next(idPicture));
    }
  }

  /**
   * load all photos from the filesystem and save them in privar BehaviourObjects
   */
  private async loadSaved(): Promise<void> {

    // Retrieve cached photo array data
    await Storage.get({ key: this.PHOTO_STORAGE })
    .then(async (res: { value: string; }) => {

      const photos: Photo[] = JSON.parse(res.value) || [];

      // on mobile
      if (this.platform.is('hybrid')) { return this.photos.next(photos); }

      // Web platform only: Display the photo by reading into base64 format
      Promise.all(photos.map(photo => {

        // Read each saved photo's data from the filesystem
        this.webwiewPathForWeb(photo)
        .then((webviewPath: string) => {

          // Load the photo as base64 data
          photo.webviewPath = webviewPath;
          return this.photos.next(photos);
        })
        .catch (err => console.error(err));
      }));
    });
    return Storage.get({ key: this.ID_PICTURE_STORAGE })
    .then(async (res: { value: string; }) => {

      const photo: Photo = JSON.parse(res.value) || null;

      // on mobile
      if (this.platform.is('hybrid')) { return this.idPicture.next(photo); }

      // Web platform only: Display the photo by reading into base64 format

      // Read each saved photo's data from the filesystem
      this.webwiewPathForWeb(photo)
      .then((webviewPath: string) => {

        // Load the photo as base64 data
        photo.webviewPath = webviewPath;
        return this.idPicture.next(photo);
      })
      .catch (err => console.error(err));
    });
  }


  /**
   * on a device:
   *  copy picture from cache into data directory of app local file system.
   *  delete picture from cache.
   *
   * on web:
   *  save picture in (emulated) storage.
   *
   * @param CameraPhoto a photo that should be persisted locally
   * @returns           the saved Image as a promise
   */
  private async savePicture(cameraPhoto: CameraPhoto): Promise<Photo> {

    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data: string = await this.loadPhoto(this.platform.is('hybrid') ? cameraPhoto.path : cameraPhoto.webPath);

    // copy the file from cache to the data directory
    const fileName = `${new Date().getTime()}.${cameraPhoto.format}`;
    const savedFile: FileWriteResult = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });
    if (this.platform.is('hybrid')) {

      // delete from cache
      await Filesystem.deleteFile({
        path: this.platform.is('hybrid') ? cameraPhoto.path : cameraPhoto.webPath
      });

      // Display the new image by rewriting the 'file://' path to 'http://'
      return {
        name: fileName,
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri)
      } as Photo;
    }

    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
      name: fileName,
      filepath: fileName,
      webviewPath: cameraPhoto.webPath
    } as Photo;
  }


  /**
   * reads content of file with filepath and returns it as base64 string
   *
   * @param filepath  path to the file in filesystem
   */
  private async webwiewPathForWeb(photo: Photo): Promise<string> {

    const filepath: string = photo.filepath;
    if (filepath == null || this.platform.is('hybrid')) {
      console.log('platform is hybrid or filepath is null in PhotoService.webwiewPathForWeb()');
      return '';
    }


    // Only for web
    return Filesystem.readFile({
      path: filepath,
      directory: FilesystemDirectory.Data
    })
    .then((res: FileReadResult) => {

      const mime: string = this.getMimetype(photo);

      // Load the photo as base64 data
      return `data:${mime};base64,${res.data}`;
    });
  }


  /**
   * reads file content of devices filesystem and returns it as base64-encoded string
   */
  private async loadPhoto(filepath: string): Promise<string> {

    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {

      console.warn('in PhotoService.loadPhoto(): If using the emulator of Android Studio: ' +
        'res.data is nonexistent in android studio emulator but works on web and physical device.');

      // Read the file from disk and return the data inside
      return Filesystem.readFile({
        path: filepath
      })
      .then((res: FileReadResult) => {

        // ! res.data is nonexistent in android studio emulator, but works on web and physical device
        return res.data;
      })
      .catch(err => {
        console.error('loadPhoto(): ' + err);
        return '';
      });
    } else {

      return fetch(filepath)
      .then((response: Response) =>
        response.blob().then((blob: Blob) =>
          this.convertBlobToBase64(blob)
            .then((res: string | ArrayBuffer) => res as string)
        )
      );
    }
  }


  /**
   * encode passed blob into base64 format
   */
  private convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer> {
    return new Promise<string | ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }


  /**
   * delete given photo from storage and this.photos. It does not delete it from the filesystem!
   *
   * @param photo the photo to be deleted
   */
  private deleteFromStorage(photo: Photo): Promise<void> {

    let photos: Photo[] = this.photos.getValue();
    photos = photos.filter((p: Photo) => p.filepath !== photo.filepath);

    return Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(photos)
    })
    .then(__ => this.photos.next(photos));
  }
}

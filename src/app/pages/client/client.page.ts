import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, MenuController, ToastController} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { pinErrors } from 'src/app/model/errors';
import { Person } from 'src/app/model/person';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.page.html',
  styleUrls: ['./client.page.scss'],
})
export class ClientPage implements OnInit {


  // create new instance of these objects
  person: Person;

   // form Group object is constructed
   pinForm: FormGroup;

   errors: pinErrors = new pinErrors();

  // declare variable for config files
  private configData:any;
  
  constructor(
    private menu: MenuController,
    private authService: AuthService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private appconfig:AppConfigService,
    private router: Router,
    private translateService:TranslateService,
    private alertCtr: AlertController,
    private toastCtrl:ToastController) { 
      this.menu.enable(false);
    }
    
  ngOnInit(){
    // initialize the Formgroup Controls
     this.pinForm = this.formBuilder.group({
      pin:new FormControl('',Validators.required)
    });
  }

  // just a getter to use in template
  get errorCtrl() { return this.pinForm.controls; }

  /**
   * Set all errors to false
   */
  private resetErrors(): void {
    Object.keys(this.errors).forEach(key => this.errors[key] = false);
  }

  /**
   * subscribe to verifyPin and handle API errors
   */
   async verifyPin() {
    const spinner: HTMLIonLoadingElement = await this.loadingService.presentLoading();

    if (!this.pinForm.valid) { return; }

    const form = this.pinForm.value;
    // send only person PIN, ignore other values
    this.person = new Person(undefined, undefined, undefined, undefined, undefined, form.pin);
 
    this.resetErrors();
    console.log("pin is : ",form.pin)
    return this.authService.verifyPin(form.pin)
    .then( (data:any) => {
        console.log("legal guardian data from api : ",data);
        if ( !!data ) {
          console.log("here?", data);
          let email=JSON.parse(JSON.stringify(data)).email;
          // send email safely using the class NavigationEtras
          let extras:NavigationExtras={
            state:{
              data:data
            }
          }
         spinner.dismiss();
         this.showToast("AUTH.matches");
        this.router.navigate(['/gen-username'],extras);
        } 
      },err=>{
        spinner.dismiss();
        if(err.status=="403"){
          this.showAlert("ERROR.wrongpin");
        }else{
         this.showAlert("ERROR.serverUnreachable");
        } 
      })   
  }

  // alert controller handles alert messages for PIN verification
  async showAlert(msg){
    const alert=this.alertCtr.create({
      message:this.translateService.instant(msg),
      buttons:[{
        text:'OK'
      }]
    });
    (await alert).present();
  }

  // show toast message after PIN verification
  async showToast(msg){
    const toast=this.toastCtrl.create({
      message:this.translateService.instant(msg),
      duration:1500,
      position:"bottom"
    });
    (await toast).present();
  }
}

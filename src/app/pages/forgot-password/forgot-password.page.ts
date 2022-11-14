import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { ForgotPasswordErrors } from 'src/app/model/errors';
import { Person } from 'src/app/model/person';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { StorageService } from 'src/app/services/storage.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { User } from '../../model/user';
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  // create new instance of these objects
  user: User;
  person: Person;

  // form Group object is constructed
  resetPasswordForm: FormGroup;

  errors: ForgotPasswordErrors = new ForgotPasswordErrors();

  constructor(
    private authService: AuthService,
    // private router: Router,
    private storage: StorageService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private validator: ValidatorService,
    private alertCtrl:AlertController,
    private navCtrl:NavController,private translate:TranslateService
  ) { }


  // just a getter to use in template
  get errorCtrl() { return this.resetPasswordForm.controls; }

  ngOnInit(): void {

    // initialize the Formgroup Controls
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, this.validator.email]]
    })
  }

  /** forgot password */
  async forgotPassword() {

    if (!this.resetPasswordForm.valid) { return; }
    const spinner: HTMLIonLoadingElement = await this.loadingService.presentLoading();
    const form = this.resetPasswordForm.value;
    this.user = new User(null, null, form.email);

    this.authService.forgotPassword(this.user).then(data => {

        if ( data ) {
          this.showAlert("msg");
          this.loadingService.hideLoading(spinner);
        } 
        else {
          this.errors.emailValidity = true;
        }
        return this.loadingService.hideLoading(spinner);
      })
       // if email validity fails, handle the 403 error returned from backend
      .catch(noUserErr => {
        if (noUserErr.status === 403) {
          // this.showAlert(("ERROR.notRegistered"));
          this.errors.noUser = true;
        } else {
          this.errors.emailValidity = true;
        }
        this.loadingService.hideLoading(spinner);
      });
  }
  
  /**show an alert if email not registered */
  async showAlert(msg){
    let resetMessage="";
    this.translate.get("AUTH.pwResetMessage").subscribe(data=>{
      resetMessage=data;
    })
    const alert= await this.alertCtrl.create({
      message:resetMessage,
      buttons:[{
        text:"OK"
      }]
    });
    alert.present();
      alert.onDidDismiss().then(()=>{
        this.navCtrl.navigateRoot(["/login"],{replaceUrl:true})
      })
  }
}

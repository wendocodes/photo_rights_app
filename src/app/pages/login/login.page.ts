import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../model/user';
import { LoadingService } from 'src/app/services/loading.service';
import { StorageService } from 'src/app/services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginErrors } from 'src/app/model/errors';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  // create variables
  user: User;

  // form Group object is constructed
  loginForm: FormGroup;

  errors: LoginErrors = new LoginErrors();


  /**
   * inject dependencies in the constructor
   */
  constructor(
    private authService: AuthService,
    private storage: StorageService,
    private loadingService: LoadingService,
    private router: Router,
    public toastCtrl: ToastController,
    private formBuilder: FormBuilder
  ) {

    // if logged in: redirect to home
    this.authService.getLoggedIn().subscribe(loggedIn => {
      if (loggedIn) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnInit(): void {
    // initialize the Formgroup Controls
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  // just a getter to use in template
  get errorCtrl() { return this.loginForm.controls; }


  /**
   * Set all errors to false
   */
  private resetErrors(): void {
    Object.keys(this.errors).forEach(key => this.errors[key] = false);
  }

  /**
   * subscribe and handle API errors
   */
  async login() {
    const spinner: HTMLIonLoadingElement = await this.loadingService.presentLoading();

    if (!this.loginForm.valid) { return; }

    const form = this.loginForm.value;
    this.user = new User(form.username, form.password, undefined);

    this.resetErrors();
    return this.authService.login(this.user).toPromise()
    .then(async data => {
      // data for loggedin person
        console.log("data from login : ",data);
        if ( data ) {
          // save the token in ionic storage
          await this.storage.setTokens(data.token)
          .then(_ => this.authService.updateLoggedIn());
        } else {
          this.errors.authFailed = true;
        }
        return this.loadingService.hideLoading(spinner);
      })

      // if authentication fails, handle the 400+ errors being thrown from backend
      .catch(error => {
        if (error.status === 403) {
          this.errors.wrongCredsFlag = true;
        } else {
          this.errors.serverUnreachable = true;
        }
        return this.loadingService.hideLoading(spinner);
      });
  }
}

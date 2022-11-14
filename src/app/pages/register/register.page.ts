import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from 'src/app/model/user';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { StorageService } from 'src/app/services/storage.service';
import { Person } from 'src/app/model/person';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { RegisterErrors } from 'src/app/model/errors';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  // create new instance of these objects
  user: User;
  person: Person;
  errors: RegisterErrors = new RegisterErrors();

  // form Group object is constructed
  regForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private storage: StorageService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private validator: ValidatorService
  ) {

    // if logged in: navigate to client login page
    this.authService.getLoggedIn().subscribe(loggedIn => {
      if (loggedIn) {
        this.router.navigate(['/client']);
      }
    });
  }

  // just a getter to use in template
  get errorCtrl() { return this.regForm.controls; }

  ngOnInit(): void {

    // initialize the Formgroup Controls
    this.regForm = this.formBuilder.group({
      uname: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]],
      upassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12),
        this.validator.minimalAmountOfUppercaseCharacters(1),
        this.validator.minimalAmountOfLowercaseCharacters(1),
        this.validator.minimalAmountOfDigits(1),
        this.validator.minimalAmountOfSpecialCharacters(1)
      ]],
      ucpassword: ['', [Validators.required]],
      fname: ['', [Validators.required, Validators.pattern('[a-zäöüA-ZÄÖÜ\\s]+'), Validators.maxLength(64)]],
      lname: ['', [Validators.required, Validators.pattern('[a-zäöüA-ZÄÖÜ\\s]+'), Validators.maxLength(64)]],
      email: ['', [Validators.required, this.validator.email]],
      dob: ['', [Validators.required]],
    },
    { validators: this.checkPasswords });
  }

  // check if passwords match or not
  checkPasswords(group: FormGroup) {
    const pass = group.get('upassword').value;
    const cpass = group.get('ucpassword').value;
    return pass === cpass ? null : { notSame: true };
  }

  /**
   * Set all fields of this.errors to false
   */
  private resetErrors(): void {
    Object.keys(this.errors).forEach(key => this.errors[key] = false);
  }

  /** register new user */
  async register() {

    const spinner: HTMLIonLoadingElement = await this.loadingService.presentLoading();
    if (!this.regForm.valid) { return; }

    const form = this.regForm.value;
    this.user = new User(form.uname, form.upassword, form.email);
    this.person = new Person(form.fname, form.lname, form.dob, form.email, form.status, form.pin);
    console.log(this.person, this.user);

    this.resetErrors();
    return this.authService.register(this.user, this.person).toPromise()

      .then(async data => {

        if ( data ) {
          // save the token in ionic storage
          await this.storage.setTokens(data.token);
          await this.authService.updateLoggedIn();
        } else {
          this.errors.authFailed = true;
        }
        return this.loadingService.hideLoading(spinner);
      })

      // if authentication fails, handle the 400+ errors being thrown from backend
      .catch(error => {

        console.log(error);
        switch (error.status) {

          // server is not answering. Could be a connection problem of app or server, ...
          case 0:
            this.errors.connectionTimeout = true;
            break;

          // on a 403 (forbidden): a user with that username already exists
          case 403:
            this.errors.userAlreadyExists = true;
            break;

          // error on individual form fields
          case 422:
            this.errors.usernameLength = error.error?.username;
            this.errors.emailValidity = error.error?.email;
            break;

          // server could not process given data (clientside problem)
          case 400:
            this.errors.unprocessableErrorServer = true;
            break;

          // generic error
          default:
            this.errors.serverError = true;
        }
        return this.loadingService.hideLoading(spinner);
      });
  }
}

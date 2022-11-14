import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterErrors } from 'src/app/model/errors';
import { Person } from 'src/app/model/person';
import { User } from 'src/app/model/user';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { StorageService } from 'src/app/services/storage.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-gen-username',
  templateUrl: './gen-username.page.html',
  styleUrls: ['./gen-username.page.scss'],
})
export class GenUsernamePage implements OnInit {

  data:any;

  // create new instance of these objects
  user: User;
  person: Person;
  errors: RegisterErrors = new RegisterErrors();

  // form Group object is constructed
  regForm: FormGroup;

  constructor(
    private actRoute:ActivatedRoute,
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
        this.router.navigate(['/home']);
      }
    });
  }

  // just a getter to use in template
  get errorCtrl() { return this.regForm.controls; }

  ngOnInit(): void {
    this.actRoute.queryParams.subscribe(()=>{
      if(this.router.getCurrentNavigation().extras.state){
        this.data=(this.router.getCurrentNavigation().extras.state.data);
        console.log("data is : ",this.data);
      }})

    // initialize the Formgroup Controls
    this.regForm = this.formBuilder.group({
      uname:new FormControl('',Validators.compose([Validators.required,Validators.minLength(6),Validators.max(32)])),
      upassword:new FormControl('',Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(12),
          this.validator.minimalAmountOfUppercaseCharacters(1),
          this.validator.minimalAmountOfLowercaseCharacters(1),
           this.validator.minimalAmountOfDigits(1),
           this.validator.minimalAmountOfSpecialCharacters(1)])),
      ucpassword:new FormControl('',Validators.compose([Validators.required])),
       fname: new FormControl(this.data.firstName,Validators.compose([Validators.required, Validators.pattern('[a-zäöüA-ZÄÖÜ\\s]+'), Validators.maxLength(64)])),
       lname: new FormControl(this.data.lastName,Validators.compose([Validators.required, Validators.pattern('[a-zäöüA-ZÄÖÜ\\s]+'), Validators.maxLength(64)])),
     
      email:new FormControl(this.data.email,Validators.compose([Validators.required,Validators.email])),
      dob:new FormControl('', Validators.compose([Validators.required]))
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

  /** update user profile */
  async updateProfile() {

    const spinner: HTMLIonLoadingElement = await this.loadingService.presentLoading();
    if (!this.regForm.valid) { return; }

    const form = this.regForm.value;
    this.user = new User(form.uname, form.upassword, form.email);
    this.person = new Person(form.fname, form.lname, form.dob, form.email, this.data.status, null);
    console.log(this.person, this.user);

    // this.resetErrors();
    return this.authService.register(this.user, this.person).toPromise().then(async data => {
        if ( data ) {
          console.log(data);
          await this.storage.setTokens(data.token)
          .then(_ => this.authService.updateLoggedIn());
        } else {
          this.errors.authFailed = true;
        }
        return this.loadingService.hideLoading(spinner);
      })

       .catch(error => {

         console.log(error);
     // switch (error.status) {
           if(error.status == 0)
           this.errors.connectionTimeout = true;
           else this.errors.connectionTimeout = false;
           

          // on a 403 (forbidden): a user with that username already exists
          if(error.status == 403)
            this.errors.userAlreadyExists = true;
            else this.errors.userAlreadyExists = false;
          

          // error on individual form fields
          if(error.status == 422){
            this.errors.usernameLength = error.error?.username;
            this.errors.emailValidity = error.error?.email;

          }
   
          // server could not process given data (clientside problem)
          if(error.status == 400)
            this.errors.emailAlreadyExists = true;
            else this.errors.emailAlreadyExists = false;
           
        return this.loadingService.hideLoading(spinner);
      });
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { TranslateModule } from '@ngx-translate/core';
import { FormComponentsModule } from 'src/app/components/form-components.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LoginPageRoutingModule,
    TranslateModule.forChild(),
    FormsModule,
    ReactiveFormsModule,
    FormComponentsModule
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}

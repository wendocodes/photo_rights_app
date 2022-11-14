import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { TranslateModule } from '@ngx-translate/core';
import { FormComponentsModule } from 'src/app/components/form-components.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RegisterPageRoutingModule,
    TranslateModule.forChild(),
    FormsModule,
    ReactiveFormsModule,
    FormComponentsModule
  ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}

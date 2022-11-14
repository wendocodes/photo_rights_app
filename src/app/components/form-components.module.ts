import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormPasswordComponent } from './form-password/form-password.component';
import { FormErrorComponent } from './form-error/form-error.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';



@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    FormPasswordComponent,
    FormErrorComponent
  ],
  exports: [
    FormPasswordComponent,
    FormErrorComponent
  ]
})
export class FormComponentsModule { }

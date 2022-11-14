import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GenUsernamePageRoutingModule } from './gen-username-routing.module';

import { GenUsernamePage } from './gen-username.page';
import { TranslateModule } from '@ngx-translate/core';
import { FormComponentsModule } from 'src/app/components/form-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GenUsernamePageRoutingModule,
    ReactiveFormsModule,
    FormComponentsModule,
    TranslateModule.forChild()

  ],
  declarations: [GenUsernamePage]
})
export class GenUsernamePageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,  ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientPageRoutingModule } from './client-routing.module';

import { ClientPage } from './client.page';
import { TranslateModule } from '@ngx-translate/core';
import { FormComponentsModule } from 'src/app/components/form-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    FormsModule,
    ReactiveFormsModule,
    FormComponentsModule,
    ClientPageRoutingModule,
  ],
  declarations: [ClientPage]
})
export class ClientPageModule {}

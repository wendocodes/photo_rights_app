import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PublicationRequestPageRoutingModule } from './publication-request-routing.module';

import { PublicationRequestPage } from './publication-request.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PublicationRequestPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [PublicationRequestPage]
})
export class PublicationRequestPageModule {}

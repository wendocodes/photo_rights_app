import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MychildPageRoutingModule } from './mychild-routing.module';

import { MychildPage } from './mychild.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MychildPageRoutingModule,
    TranslateModule.forChild() // translate service
  ],
  declarations: [MychildPage]
})
export class MychildPageModule {}

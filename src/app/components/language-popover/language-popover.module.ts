import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguagePopoverComponent } from './language-popover.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [LanguagePopoverComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule.forChild()
  ],
  exports: [
    LanguagePopoverComponent
  ],
  entryComponents: [
    LanguagePopoverComponent
  ]


})
export class LanguagePopoverModule { }

import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { LanguageSwitcherService } from 'src/app/services/language-switcher.service';

@Component({
  selector: 'app-language-popover',
  templateUrl: './language-popover.component.html',
  styleUrls: ['./language-popover.component.scss'],
})
export class LanguagePopoverComponent {

  constructor(private popoverController: PopoverController,
              public languageService: LanguageSwitcherService) { }

  /**
   * select a known language
   */
  public async select(languageValue: string): Promise<void> {
    this.languageService.persistLanguage(languageValue);
    await this.popoverController.dismiss();
  }
}

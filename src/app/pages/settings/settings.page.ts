import { Component, OnInit } from '@angular/core';
import { ThemeSwitcherService } from '../../services/theme-switcher.service';
import { PopoverController } from '@ionic/angular';
import { LanguagePopoverComponent } from 'src/app/components/language-popover/language-popover.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  // declare variables
  darkMode: boolean;

  constructor(
    public popoverController: PopoverController,
    private themeService: ThemeSwitcherService
  ) { }

  ngOnInit(): void {
      this.themeService.isDarkMode().subscribe(dark => this.darkMode = dark);
  }

  /**
   * @param ev opens language popover
   */
  async openLanguagePopover(ev: Event): Promise<void> {
    const popover = await this.popoverController.create({
      component: LanguagePopoverComponent,
      event: ev
    });
    return popover.present();
  }

  /** toggle between dark and light modes */
  toggleDarkMode(): Promise<void> {

    // prevent infinite loop between subscription to this.themeService.isDarkMode() and ngModel on toggle in template
    if (this.darkMode === this.themeService.isDarkModeValue()) { return; }

    return this.themeService.persistAppTheme(this.darkMode);
  }
}

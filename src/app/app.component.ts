import { Component, OnInit } from '@angular/core';

import { AlertController, MenuController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LanguageSwitcherService } from './services/language-switcher.service';
import { Menu } from './model/menu';
import { HomePage } from './home/home.page';
import { GalleryPage } from './pages/gallery/gallery.page';
import { ProfilePage } from './pages/profile/profile.page';
import { PublicationRequestPage } from './pages/publication-request/publication-request.page';
import { SettingsPage } from './pages/settings/settings.page';
import { LoginPage } from './pages/login/login.page';
import { AuthService } from './services/auth.service';
import { Location } from '@angular/common';
import { ThemeSwitcherService } from './services/theme-switcher.service';
import { MychildPage } from './pages/mychild/mychild.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  selectedIndex: number;
  menuItems: Menu[];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private languageService: LanguageSwitcherService,
    private menuCtrl: MenuController,
    private auth: AuthService,
    private location: Location,
    public alertController: AlertController,
    private themeService: ThemeSwitcherService
  ) {
    this.initMenu();
    this.closeMenu();
    this.initializeApp();
  }
  // for the menu items
  public initMenu() {
    this.menuItems = [
      { title: 'home', url: '/home', icon: 'home', component: HomePage } as Menu,
      { title: 'gallery', url: '/gallery', icon: 'images', component: GalleryPage } as Menu,
      { title: 'publicationRequests', url: '/publication-request', icon: 'help', component: PublicationRequestPage } as Menu,
      { title: 'profile', url: '/profile', icon: 'person', component: ProfilePage } as Menu,
      { title: 'My Child', url: '/mychild', icon: 'people', component: MychildPage} as Menu,
      { title: 'settings', url: '/settings', icon: 'settings', component: SettingsPage } as Menu,
      { title: 'login', url: '/login', icon: 'log-in', component: LoginPage} as Menu
    ];
  }
  ngOnInit() {
    const path = window.location.pathname.split('/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.menuItems.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }

  /**
   * platform is ready, set the initial app language
   */
  public initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.menuCtrl.enable(true);
      this.themeService.loadAppTheme();
      this.languageService.loadLanguage();

      // hide login if already logged in
      this.auth.getLoggedIn().subscribe(loggedIn => this.menuItems[5].hidden = loggedIn);
    });

    /**
     * handle ionBackButton event whenever a user taps on hardware back button
     */
    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back press handler!');
      if (this.location.isCurrentPathEqualTo('/home')) {

        // Show Exit Alert!
        this.showExitConfirm();
        processNextHandler();
      } else {
        // Navigate to back page
        this.location.back();
      }
    });
    this.platform.backButton.subscribeWithPriority(5, () => {
      console.log('Handler called to force close!');
      this.alertController.getTop().then(r => {
        if (r) {
          navigator['app'].exitApp();
        }
      }).catch(e => {
        console.log(e);
      });
    });
  }

  /**
   * show alert when a user is exiting
   */
  public showExitConfirm() {
    this.alertController.create({
      header: 'App termination',
      message: 'Do you want to close the app?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Stay',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Exit',
          handler: () => {
            navigator['app'].exitApp();
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });
  }

  /**
   * fix side menu freezing
   */
  public async closeMenu(): Promise<void> {
    if (await this.menuCtrl.isOpen()) {
      await this.menuCtrl.close();
      await this.menuCtrl.enable(false);
    }
  }
}

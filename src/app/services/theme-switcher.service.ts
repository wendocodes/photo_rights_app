import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@ionic/angular';
import { StorageService } from './storage.service';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeSwitcherService {
  //  set dark mode to false
  private darkMode: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // set a theme key for ionic storage
  private THEME_KEY = 'app_theme';

  constructor(
    private storage: StorageService,
    private plt: Platform,
    @Inject(DOCUMENT) private document: Document
  ) {}

  public isDarkMode(): Observable<boolean> {
    return this.darkMode.asObservable();
  }
  public isDarkModeValue(): boolean {
    return this.darkMode.getValue();
  }

  /**
   * loads the selected theme from storage
   * (Called on app initialisation in app.component.ts)
   */
  public loadAppTheme() {

    this.plt.ready().then(() => {

      //  get from ionic storage
      this.storage.get(this.THEME_KEY).then((val) => {
        if (val === null || val === undefined) {
          throw Error();
        }
        this.setAppTheme(val);
      })
      // nothing found in storage, fall back to default (system wide settings)
      .catch(() => {
        console.log('Could not load theme preference from storage');

        // Use matchMedia to check the user preference
        const prefersDark: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
        this.setAppTheme(prefersDark.matches);

        // Listen for changes to the prefers-color-scheme media query
        fromEvent(prefersDark, 'change').subscribe((ev: MediaQueryListEvent) => {

          // use them as default if not explicitly set in storage
          this.storage.get(this.THEME_KEY).then((val: boolean) => {
            console.log(`òn change: `, val);
            if (val === null || val === undefined) {
              this.setAppTheme(ev.matches);
            }
          });
        });
      });
    });
  }

  /**
   * Applies theme and saves it persistently for later use
   */
  public persistAppTheme(dark: boolean): Promise<void> {
    console.log(`persist ${dark ? 'dark' : 'light'} mode`);

    return this.storage.set(this.THEME_KEY, dark).then(() =>
      this.setAppTheme(dark)
    );
  }

  /**
   * add or remove the "dark" class based on if the media query matches
   */
  private setAppTheme(dark: boolean): void {
    console.log(`Use ${dark ? 'dark' : 'light'} mode`);
    this.darkMode.next(dark);

    // toggle between dark and light mode
    if (dark) {
      this.document.body.classList.add('dark');
    } else {
      this.document.body.classList.remove('dark');
    }
  }
}

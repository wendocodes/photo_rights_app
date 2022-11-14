import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Language } from '../model/language';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageSwitcherService {

  private LNG_KEY = 'SELECTED_LANGUAGE';
  private _currentLanguage: Language;
  private _languages: Language[];

  constructor(
    private translate: TranslateService,
    private storage: StorageService
  ) { this.initLanguages(); }

  public get currentLanguage(): Language {
    return this._currentLanguage;
  }
  public get languages(): Language[] {
    return this._languages;
  }

  /**
   * languages used by the app that ngx-translate will be looking for
   */
  private initLanguages(): void {
    this._languages = [
      { text: 'English', value: 'en', img: 'assets/imgs/en.png' } as Language,
      { text: 'German', value: 'de', img: 'assets/imgs/de.png' } as Language,
    ];
  }

  /**
   * use device default language
   */
  private useDefaultLanguage(): void {
    const languageValue: string = this.translate.getBrowserLang();
    this.translate.setDefaultLang(languageValue);
    this.setLanguage(languageValue);
  }

  /**
   * loads the selected language from storage
   * (Called on app initialisation in app.component.ts)
   */
  public loadLanguage(): Promise<void> {

    //  get the persisted language preference
    return this.storage.get(this.LNG_KEY).then((langValue: string) => {

      // none found, use browser default
      if (langValue === null || langValue === undefined) { throw Error(); }

      // found, use it
      this.setLanguage(langValue);
    })
    // nothing found in storage, fall back to default (browser or system wide settings)
    .catch(() => {
      console.log('Could not load language preference from storage');
      this.useDefaultLanguage();
    });
  }

  /**
   * Use and persist given language setting
   * @param lng language setting to use
   */
  public async persistLanguage(languageValue: string): Promise<void> {

    // set as new language
    this.setLanguage(languageValue);
    await this.storage.set(this.LNG_KEY, this.currentLanguage.value);

    console.log(`asked for language '${languageValue}', persisted language '${this.currentLanguage.value}'.`);
  }

  /**
   * Use given language in app. If it doesn't exist, use default (of 'en').
   * Save language in this._currentLanguage for later use
   * @param languageValue language to be used
   */
  private setLanguage(languageValue: string): void {
    // check if language is supported by klix
    const defaultValue = 'en';
    const language = this.languages.find(lng => lng.value === languageValue) ||
                     this.languages.find(lng => lng.value === defaultValue);  // if not found, use this default
    console.log(`Use language '${language.value}'`);

    // set as new language
    this._currentLanguage = language;
    this.translate.use(language.value);
  }

  public translateByKey(key: string | string[]): string {
    return this.translate.instant(key);
  }
}

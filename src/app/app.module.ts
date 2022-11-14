import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ThemeSwitcherService } from './services/theme-switcher.service';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageSwitcherService } from './services/language-switcher.service';

import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { Storage } from '@ionic/storage';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicStorageModule } from '@ionic/storage';
import { LoginPageModule } from './pages/login/login.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// for camera and image picker
import { Camera } from '@ionic-native/Camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { AppConfigService } from './services/app-config.service';

// create this function for ngx-translate to find i18n in assets
export function createTranslateLoader(http: HttpClient) {

  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
// custom factory function used to get a token asynchronously with Ionic's Storage
export function jwtOptionsFactory(storage) {
  return {
    tokenGetter: () => {
      return storage.get('jwt_token');
    },
    allowedDomains: ['http://localhost:8100']
  };
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    HttpClientModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [Storage]
      }
    }),
    FormsModule,
    ReactiveFormsModule,
    LoginPageModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    File,
    {
      /**
       * Load the config when the app starts.  
       * @returns config.loadAppConfig() as a promise
       * so that Angular knows to wait until it finishes resolving before finishing startup
       */
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        return () => {
          //Make sure to return a promise!
          return config.loadAppConfig();
        };
      }
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ThemeSwitcherService, LanguageSwitcherService, 
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

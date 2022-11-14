KLIX App Frontend
Overview:
The app has an authentication service that is responsible for authentication. The service sends Http calls to the endpoints in the Spring boot backend. When a user sends user credentials (username and password), the app authenticates the user and returns a token. The token is then stored in the Ionic storage. The token has a lifetime. If it expires, the user is presented with the login page. A photo Gallery has been added to the app. Users can now take photos, and delete selected photos. On the settings page and the user can change the app theme as well as language for the app. 
Requirements
•	Node 12+
•	Ionic 5+
•	Angular 9+
•	Capacitor 2.0+
•	Java 11+
•	Android Studio
•	Visual Studio Code

Installation 
You need to install Node.js and then most requirements and/or dependencies may be installed with NPM (Node Package Manager)
To install NODE: https://nodejs.org/en/download/

Install Ionic
$npm install -g @ionic/cli

Install Angular
$npm install -g @angular/cli

Install Capacitor
https://capacitorjs.com/docs/getting-started

Install Java 11
https://www.oracle.com/java/technologies/javase-jdk11-downloads.html
 
To start the project, do the following:

1.	Clone the project from Bitbucket
2.	Install the following dependencies

For ionic storage
$npm install --save @ionic/storage

For the Json Web Token (JWT)
$npm install @auth0/angular-jwt

For Internationalization
$npm install @ngx-translate/core --save

For Native Camera on web
---
npm install @ionic/pwa-elements
npm install @ionic-native/ionic-webview
----

For Android permissions
$npm install @ionic-native/android-permissions

Run the Project in browser
$ionic serve

Run the Project on Android
$ npx cap open android

Sync changes to Capacitor 
npx cap sync

Run the Project on ios
$ npx cap open ios




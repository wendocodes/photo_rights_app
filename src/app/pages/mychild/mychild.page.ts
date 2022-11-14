import { Component, OnInit } from '@angular/core';
import { Person } from 'src/app/model/person';
import { Child } from 'src/app/model/child';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-mychild',
  templateUrl: './mychild.page.html',
  styleUrls: ['./mychild.page.scss'],
})
export class MychildPage implements OnInit {


    child: Child;
  
    loggedIn: boolean = false;
  
  
    constructor(private auth: AuthService) {
  
      this.auth.loggedinChildren().subscribe(person => this.child= person);
  
      this.auth.getLoggedIn().subscribe(loggedIn => this.loggedIn = loggedIn);
  
      console.log("mychild loggedinchildren : ",this.child)
  
     }

  ngOnInit() {
  }

}

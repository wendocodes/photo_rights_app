import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GenUsernamePage } from './gen-username.page';

describe('GenUsernamePage', () => {
  let component: GenUsernamePage;
  let fixture: ComponentFixture<GenUsernamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenUsernamePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GenUsernamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

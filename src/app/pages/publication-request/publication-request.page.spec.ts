import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PublicationRequestPage } from './publication-request.page';

describe('PublicationRequestPage', () => {
  let component: PublicationRequestPage;
  let fixture: ComponentFixture<PublicationRequestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicationRequestPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicationRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

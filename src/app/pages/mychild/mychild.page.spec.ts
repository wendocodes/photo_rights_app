import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MychildPage } from './mychild.page';

describe('MychildPage', () => {
  let component: MychildPage;
  let fixture: ComponentFixture<MychildPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MychildPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MychildPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

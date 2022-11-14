import { Component, Input } from '@angular/core';

@Component({
  selector: 'klix-form-error',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.scss'],
})
export class FormErrorComponent {

  @Input() message = 'Error';
  @Input() showOn = false;
}

import { Component, Input, ViewChild } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor,
  FormControl, FormControlDirective, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'klix-form-password',
  templateUrl: './form-password.component.html',
  styleUrls: ['./form-password.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: FormPasswordComponent,
    multi: true
  }]
})
// see https://medium.com/angular-in-depth/dont-reinvent-the-wheel-when-implementing-controlvalueaccessor-a0ed4ad0fafd
export class FormPasswordComponent implements ControlValueAccessor {

  // get FormControl instance through this.contrl out of inputs:

  @Input() _formControl: FormControl;
  @Input() formControlName: string;

  /**
   * gets hold of FormControl instance no matter if formControl or
   * formControlName is given. If formControlName is given, then this.controlContainer.control
   * is the parent FormGroup (or FormArray) instance.
   */
  get control(): AbstractControl {
    return this._formControl || this.controlContainer.control.get(this.formControlName);
  }

  @ViewChild(FormControlDirective, {static: true}) formControlDirective: FormControlDirective;
  hide = true;

  constructor(private controlContainer: ControlContainer) { }


  // propagate changes in both directions via ControlValueAccessor-Interface methods:

  registerOnTouched(fn: any): void {
    this.formControlDirective.valueAccessor.registerOnTouched(fn);
  }

  registerOnChange(fn: any): void {
    this.formControlDirective.valueAccessor.registerOnChange(fn);
  }

  writeValue(value: string): void {
    this.formControlDirective.valueAccessor.writeValue(value);
  }

  setDisabledState(isDisabled: boolean): void {
    this.formControlDirective.valueAccessor.setDisabledState(isDisabled);
  }
}

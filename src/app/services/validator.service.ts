import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { AppConfigService } from '../services/app-config.service'

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {
  
  // declare variable for config files
  private configData: any;

  constructor(private appConfig: AppConfigService) { 
    this.configData= appConfig.configData;
  }

  /**
   * Escapes all characters with special meaning in RegExp
   * @param regex the expression to be escaped
   */
  private escapeRegExp(regex: string): string {
    return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  /**
   * Returns a Regexp which validates to true if the given pattern is included at least 'minAmount' times.
   * @param pattern a regex pattern that should be included at least 'minAmount' times
   * @param minAmount the minimal amount
   */
  private patternAmountRegex(pattern: string, minAmount: number): RegExp {
    return RegExp(`^.*([${this.escapeRegExp(pattern)}].*){${minAmount},}$`);
  }

  /**
   * Reactive form validator. Need at least 'minAmount' times of uppercase letters
   * (@see EnvService.UPPERCASE_CHARACTERS)
   * @param minAmount the minimal amount
   */
  public minimalAmountOfUppercaseCharacters(minAmount: number): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {

      const regex = this.patternAmountRegex(this.configData.UPPERCASE_CHARACTERS, minAmount);
      return regex.test(control.value) ? null :  {uppercase: {value: control.value}};
    };
  }

  /**
   * Reactive form validator. Need at least 'minAmount' times of lowercase letters
   * (@see EnvService.LOWERCASE_CHARACTERS)
   * @param minAmount the minimal amount
   */
  public minimalAmountOfLowercaseCharacters(minAmount: number): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {

      const regex = this.patternAmountRegex(this.configData.LOWERCASE_CHARACTERS, minAmount);
      return regex.test(control.value) ? null :  {lowercase: {value: control.value}};
    };
  }

  /**
   * Reactive form validator. Need at least 'minAmount' times of digits
   * (@see EnvService.DIGITS)
   * @param minAmount the minimal amount
   */
  public minimalAmountOfDigits(minAmount: number): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {

      const regex = this.patternAmountRegex(this.configData.DIGITS, minAmount);
      return regex.test(control.value) ? null :  {digit: {value: control.value}};
    };
  }

  /**
   * Reactive form validator. Need at least 'minAmount' times of special characters
   * (@see EnvService.SPECIAL_CHARACTERS)
   * @param minAmount the minimal amount
   */
  public minimalAmountOfSpecialCharacters(minAmount: number): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {

      const regex = this.patternAmountRegex(this.configData.SPECIAL_CHARACTERS, minAmount);
      return regex.test(control.value) ? null :  {special: {value: control.value}};
    };
  }

  /**
   * Reactive form validator for proper emails. The builtin 'Validators.email' validates
   * so that 's@a' as ok, but it should end with a suffix like '.de' or something.
   */
  public email(control: AbstractControl): {[key: string]: any} | null {

    return /^(.+@.+\..+)?$/.test(control.value) ? null :  {email: {value: control.value}};
  }
}

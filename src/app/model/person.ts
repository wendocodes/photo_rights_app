export class Person {
  private _firstName: string;
  private _lastName: string;
  private _birthdate: Date;
  private _email: string;
  private _status: string;
  private _pin: number;

  constructor(firstName: string, lastName: string, birthdate: Date, email: string, status: string, pin: number) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.email = email;
    this.status = status;
    this.pin = pin;
  }

  get firstName(): string {
    return this._firstName;
  }
  set firstName(firstName: string) {
      this._firstName = firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  set lastName(lastName: string) {
      this._lastName = lastName;
  }
  get birthdate(): Date {
    return this._birthdate;
  }
  set birthdate(birthdate: Date) {
      this._birthdate = birthdate;
  }
  get email(): string {
    return this._email;
  }
  set email(email: string) {
      this._email = email;
  }
  get status(): string {
    return this._status;
  }
  set status(status: string) {
      this._status = status;
  }
  get pin(): number {
    return this._pin;
  }
  set pin(pin: number) {
      this._pin = pin;
  }
}
export class Child {
    private _childFirstName: string;
    private _childLastName: string;
    private _childBirthdate: Date;
    private _childEmail: string;
    // private _relationshipId: number;
   
    constructor(childFirstName: string, childEmail: string, childLastName: string, childBirthdate: Date) {
      this.childFirstName = childFirstName;
      this.childLastName = childLastName;
      this.childBirthdate = childBirthdate;
      this.childEmail = childEmail;
    }
  
    get childFirstName(): string {
        return this._childFirstName;
      }
      set childFirstName(childFirstName: string) {
          this._childFirstName = childFirstName;
      }
      get childLastName(): string {
        return this._childLastName;
      }
      set childLastName(childLastName: string) {
          this._childLastName = childLastName;
      }
    get childBirthdate(): Date {
      return this._childBirthdate;
    }
    set childBirthdate(childBirthdate: Date) {
        this._childBirthdate = childBirthdate;
    }

    get childEmail(): string {
      return this._childEmail;
    }
    set childEmail(childEmail: string) {
        this._childEmail = childEmail;
    }
  }
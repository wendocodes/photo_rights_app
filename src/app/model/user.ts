export class User {
    private _id: number;
    private _username: string;
    private _password: string;
    private _email: string;

    constructor(username: string, password: string, email: string) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    get username(): string {
        return this._username;
    }
    set username(username: string) {
        this._username = username;
    }

    get id(): number {
        return this._id;
    }
    set id(id: number) {
        this._id = id;
    }


    get password(): string {
        return this._password;
    }
    set password(password: string) {
        this._password = password;
    }

    get email(): string {
        return this._email;
    }
    set email(email: string) {
        this._email = email;
    }
}

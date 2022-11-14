export class Language {

private _text: string;
private _value: string;
private _img: string;

constructor(text: string, value: string, img: string) {
    this._text = text;
    this._value = value;
    this._img = img;
}

get text(): string {
    return this._text;
}

get value(): string {
    return this._value;
}

get img(): string {
    return this._img;
}

}

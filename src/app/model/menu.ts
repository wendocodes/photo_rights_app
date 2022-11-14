export class Menu {

    private _title: string;
    private _url: string;
    private _icon: string;
    private _component: any;
    private _hidden: boolean;

    constructor(title: string, url: string, icon: string,  component: any, hidden: boolean) {
        this._title = title;
        this._url = url;
        this._icon = icon;
        this._component = component;
        this._hidden = hidden;
    }

    get title(): string {
        return this._title;
    }

    get url(): string {
        return this._url;
    }

    get icon(): string {
        return this._icon;
    }

    get component(): any {
        return this._component;
    }

    get hidden(): boolean {
        return this._hidden;
    }

    set hidden(hidden: boolean) {
        this._hidden = hidden;
    }
}

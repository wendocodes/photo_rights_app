export interface Photo {
    name: string;
    filepath: string;
    webviewPath: string;
    isChecked: boolean;
    pictureString: string;
    type: string;

    // track the photo's status in network (could be resolved in one enum {sent, uploaded, error})
    isSent: boolean;
    isUploaded: boolean;
    uploadFailed: boolean;
    isCropped: boolean;

    //errormessage
    errorMessage:string;
    showError:boolean;
}

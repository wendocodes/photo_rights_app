export class RegisterErrors {

    authFailed: boolean;
    connectionTimeout: boolean;
    emailValidity: boolean;
    emailAlreadyExists: boolean;
    passwordValidity: boolean;
    serverError: boolean;
    userAlreadyExists: boolean;
    usernameLength: boolean;
    unprocessableErrorServer: boolean;
}

export class LoginErrors {

    authFailed: boolean;
    serverUnreachable: boolean;
    wrongCredsFlag: boolean;
}

export class ForgotPasswordErrors {

    emailValidity: boolean;
    noUser: boolean;
}
export class pinErrors {

    wrongPin: boolean;
    serverUnreachable: boolean;
}
export class FaceExceptionErrors {
    
    idPictureError: boolean;
    noArray: boolean;
    notAFace: boolean;
    unsupportedformat: boolean;
}

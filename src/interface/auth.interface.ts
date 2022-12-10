interface FormElements extends HTMLFormControlsCollection {
    email: HTMLInputElement
    password: HTMLInputElement
}

export interface RegisterFormElement extends HTMLFormElement {
    readonly elements: FormElements
}

export enum UserRoles {
    PARTNER = 'PARTNER',
    VENDOR = 'VENDOR',
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR',
}
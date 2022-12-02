interface FormElements extends HTMLFormControlsCollection {
    email: HTMLInputElement
    password: HTMLInputElement
}

export interface RegisterFormElement extends HTMLFormElement {
    readonly elements: FormElements
}

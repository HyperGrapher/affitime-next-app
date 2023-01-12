interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  username: HTMLInputElement;
  brand: HTMLInputElement;
  website: HTMLInputElement;
}

export interface RegisterFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

interface AdminFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  adminpass: HTMLInputElement;
}

export interface AdminRegisterFormElement extends HTMLFormElement {
  readonly elements: AdminFormElements;
}

export enum UserRoles {
  PARTNER = "PARTNER",
  VENDOR = "VENDOR",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

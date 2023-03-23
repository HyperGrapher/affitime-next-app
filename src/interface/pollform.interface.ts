interface PollCatsFormElements extends HTMLFormControlsCollection {
  cat1: HTMLInputElement;
  cat2: HTMLInputElement;
  cat3: HTMLInputElement;
  cat4: HTMLInputElement;
  cat5: HTMLInputElement;
  cat6: HTMLInputElement;
  cat7: HTMLInputElement;
  cat8: HTMLInputElement;
  cat9: HTMLInputElement;
  cat10: HTMLInputElement;
}

export interface PollCatsFormElement extends HTMLFormElement {
  readonly elements: PollCatsFormElements;
}

export interface InterestType {
  name: string;
  checked: boolean;
}


interface PollSocialFormElements extends HTMLFormControlsCollection {
  instagram: HTMLInputElement;
  twitter: HTMLInputElement;
  facebook: HTMLInputElement;
  tiktok: HTMLInputElement;
  linkedin: HTMLInputElement;
}

export interface PollSocialFormElement extends HTMLFormElement {
  readonly elements: PollSocialFormElements;
}

export interface SocialType {
  platform: string;
  handle: string;
}


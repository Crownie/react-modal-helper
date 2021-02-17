export enum TriggerType {
  BUTTON = 'button',
  CLICK_OUTSIDE = 'click-outside',
  ESC = 'esc',
}

export class CloseModalEvent {
  private defaultPrevented: boolean = false;

  constructor(public readonly triggerType: TriggerType) {}

  preventDefault() {
    this.defaultPrevented = true;
  }

  isDefaultPrevented() {
    return this.defaultPrevented;
  }
}

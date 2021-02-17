import {CloseModalEvent, TriggerType} from './CloseModalEvent';

export interface ModalHandle {
  close: (triggerType?: TriggerType) => void;
  forceClose: () => void;
}

export interface ModalCallbacks {
  onBeforeClose: (event: CloseModalEvent, forceClose: () => void) => void;
}

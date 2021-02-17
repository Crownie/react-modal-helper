import {TriggerType} from './CloseModalEvent';
import React, {useContext, useImperativeHandle, useRef} from 'react';
import {ModalCallbacks} from './interfaces';

export interface ModalContextProps {
  isOpen: boolean;
  close: (triggerType?: TriggerType) => void;
  ref: React.RefObject<ModalCallbacks>;
}

export const ModalContext = React.createContext<ModalContextProps>({} as any);

export const useModalContext = (d?: ModalCallbacks): ModalContextProps => {
  const {onBeforeClose} = d || {};
  const dummyRef = useRef<any>(null);
  const context = useContext(ModalContext);
  useImperativeHandle(
    onBeforeClose ? context.ref : dummyRef,
    () => {
      return {onBeforeClose};
    },
    [onBeforeClose],
  );
  return context;
};

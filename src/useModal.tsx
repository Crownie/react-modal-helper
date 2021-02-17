import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {CloseModalEvent, TriggerType} from './CloseModalEvent';
import {ModalCallbacks, ModalHandle} from './interfaces';
import {ModalContext, ModalContextProps} from './useModalContext';

interface ModalItem {
  id: string;
  node: ReactNode;
  ModalWrapper: IModalWrapper;
  modalHandle?: ModalHandle;
  cleanup?: boolean;
}

type ModalsMap = Map<string, ModalItem>;

const ModalComp: FunctionComponent<{
  modal: ModalItem;
  modalsMap: ModalsMap;
}> = ({modal, modalsMap}) => {
  const {id, ModalWrapper} = modal;
  const [isOpen, setOpen] = useState(true);
  const ref = useRef<ModalCallbacks>(null);

  const forceClose = useCallback(() => {
    setOpen(false);
  }, []);

  const close = useCallback(
    (triggerType: TriggerType = TriggerType.BUTTON) => {
      const event = new CloseModalEvent(triggerType);
      ref.current?.onBeforeClose(event, forceClose);
      if (!event.isDefaultPrevented()) {
        setOpen(false);
      }
    },
    [forceClose],
  );

  const modalHandle = useMemo(() => ({close, forceClose}), [close, forceClose]);

  useEffect(() => {
    const m = modalsMap.get(id);
    if (m) {
      m.modalHandle = modalHandle;
    }
    if (!isOpen) {
      if (m) {
        m.cleanup = true;
      }
      setTimeout(() => {
        modalsMap.delete(id);
      }, 500);
    }
  }, [isOpen, modalHandle]);

  return (
    <ModalContext.Provider value={{isOpen, close, ref}}>
      {
        <ModalWrapper isOpen={isOpen} close={close}>
          {modal.node}
        </ModalWrapper>
      }
    </ModalContext.Provider>
  );
};

interface ModalWrapperProps extends Omit<ModalContextProps, 'ref'> {}

export type IModalWrapper = FunctionComponent<ModalWrapperProps>;

export const useModal = (ModalWrapper: IModalWrapper) => {
  const modalsMap: ModalsMap = useRef(new Map()).current;
  const [currentId, setState] = React.useState<string>();

  const open = useCallback(
    (node: ReactNode): ModalHandle => {
      const id = new Date().toISOString() + '' + Math.random();
      modalsMap.set(id, {id, node, ModalWrapper});
      setState(id);
      return {
        close: (triggerType?: TriggerType) => {
          const c = modalsMap.get(id);
          if (c?.modalHandle?.close) {
            c?.modalHandle?.close(triggerType);
          }
        },
        forceClose: () => {
          const c = modalsMap.get(id);
          if (c?.modalHandle?.forceClose) {
            c?.modalHandle?.forceClose();
          }
        },
      };
    },
    [modalsMap],
  );

  const ModalRenderer: FunctionComponent = useMemo(() => {
    return () => (
      <>
        {Array.from(modalsMap.values()).map((modal) => {
          if (modal.cleanup) {
            return null;
          }
          return (
            <ModalComp key={modal.id} modal={modal} modalsMap={modalsMap} />
          );
        })}
      </>
    );
  }, [currentId, modalsMap.size]);

  return {ModalRenderer, open};
};

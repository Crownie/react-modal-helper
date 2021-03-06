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
  ModalAdapterComp: ModalAdapter;
  modalHandle?: ModalHandle;
  cleanup?: boolean;
  options?: any;
}

type ModalsMap = Map<string, ModalItem>;

const ModalComp: FunctionComponent<{
  modal: ModalItem;
  modalsMap: ModalsMap;
}> = ({modal, modalsMap}) => {
  const {id, ModalAdapterComp} = modal;
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
        <ModalAdapterComp isOpen={isOpen} close={close} options={modal.options}>
          {modal.node}
        </ModalAdapterComp>
      }
    </ModalContext.Provider>
  );
};

interface ModalWrapperProps extends Omit<ModalContextProps, 'ref'> {}

export type ModalAdapter<T = any> = FunctionComponent<
  ModalWrapperProps & {options?: T}
>;

export function useModal<T>(ModalAdapterComp: ModalAdapter<T>) {
  const modalsMap: ModalsMap = useRef(new Map()).current;
  const [currentId, setState] = React.useState<string>();

  const open = useCallback(
    (node: ReactNode, options?: T): ModalHandle => {
      const id = new Date().toISOString() + '' + Math.random();
      modalsMap.set(id, {
        id,
        node,
        ModalAdapterComp: ModalAdapterComp,
        options,
      });
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
}

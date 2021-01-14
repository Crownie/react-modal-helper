import React, {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Subject} from 'rxjs/internal/Subject';

interface ModalProviderProps {
  children?: any;
}

enum CloseMethod {
  NORMAL = 'normal',
  BACKDROP = 'backdrop',
}

type RenderModal = (props: {
  isOpen: boolean;
  close: (method?: CloseMethod) => void;
  children: ReactNode;
}) => ReactNode;

type ModalHandler = (
  component: FunctionComponent,
  props: Parameters<typeof component>[0],
  renderModal: RenderModal,
) => void;

interface ModalHandle {
  close: (method?: CloseMethod) => void;
  onCloseObserver: Subject<CloseMethod>;
}

let modalHandler: any = null;

const components: Map<
  string,
  {
    id: string;
    Component: FunctionComponent;
    props: any;
    renderModal: RenderModal;
    modalHandle?: ModalHandle;
  }
> = new Map();

export function ModalProvider({children}: ModalProviderProps) {
  const [currentId, setState] = React.useState<string>();

  const handler: ModalHandler = (
    Component: FunctionComponent,
    props: Parameters<typeof Component>[0] = {},
    renderModal: RenderModal,
  ) => {
    const id = new Date().toISOString() + '' + Math.random();
    components.set(id, {id, Component, props, renderModal});
    setState(id);
    return {
      close: (method) => {
        const c = components.get(id);
        if (c && c.modalHandle) {
          c.modalHandle.close(method);
        } else {
          console.warn('modal is not ready or has already been unmounted');
        }
      },
    };
  };

  modalHandler = useCallback(handler, [setState]);

  return useMemo(
    () => (
      <>
        {children}
        {Array.from(components.values()).map(
          ({id, Component, props, renderModal}) => {
            return (
              <Modal key={id} id={id} renderModal={renderModal}>
                <Component {...props} />
              </Modal>
            );
          },
        )}
      </>
    ),
    [currentId, components.size, children],
  );
}

interface ModalProps {
  id: string;
  renderModal: RenderModal;
}

const ModalHandleContext = createContext<ModalHandle>({} as any);

export const useModalHandle = (): ModalHandle => {
  return useContext(ModalHandleContext);
};

const Modal: FunctionComponent<ModalProps> = ({id, renderModal, children}) => {
  // create a Subject that can be subscribed to to receive the onclose event
  const onCloseObserver = useMemo(() => new Subject<CloseMethod>(), []);

  const [isOpen, setOpen] = useState(true);
  const handleClose = useCallback(
    (method: CloseMethod = CloseMethod.NORMAL) => {
      if (method === CloseMethod.NORMAL) {
        // close only if is 'normal close', other methods will be handled by the onCloseObserver subscribers
        setOpen(false);
      }
      // this will notify the subscribers whether modal is closed directly or by clicking outside
      onCloseObserver.next(method);
    },
    [onCloseObserver],
  );

  const modalHandle: ModalHandle = {close: handleClose, onCloseObserver};

  useEffect(() => {
    const c = components.get(id);
    if (c) {
      c.modalHandle = modalHandle;
    }

    if (!isOpen) {
      setTimeout(() => {
        components.delete(id);
      }, 1000);
    }
    return () => {
      onCloseObserver.unsubscribe();
    };
  }, [isOpen, modalHandle, onCloseObserver]);

  return (
    <ModalHandleContext.Provider value={modalHandle}>
      {renderModal({isOpen, close: handleClose, children})}
    </ModalHandleContext.Provider>
  );
};

export function createModalHelper(renderModal: RenderModal) {
  function modal<T extends FunctionComponent<Parameters<T>[0]>>(
    Component: T,
    props: Parameters<typeof Component>[0] = {},
  ): ModalHandle {
    if (!modalHandler) {
      throw new Error(
        `Ensure that you've wrapped the app with <ModalProvider/>`,
      );
    }
    return modalHandler(Component, props, renderModal);
  }

  return modal;
}

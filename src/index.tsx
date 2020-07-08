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

interface ModalProviderProps {
  children?: any;
}

type RenderModal = (props: {
  isOpen: boolean;
  close: () => void;
  children: ReactNode;
}) => ReactNode;

type ModalHandler = (
  component: FunctionComponent,
  props: Parameters<typeof component>[0],
  renderModal: RenderModal,
) => void;

interface ModalHandle {
  close: () => void;
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
      close: () => {
        const c = components.get(id);
        if (c && c.modalHandle) {
          c.modalHandle.close();
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
  const [isOpen, setOpen] = useState(true);
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const modalHandle = {close: handleClose};

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
  }, [isOpen, modalHandle]);

  return (
    <ModalHandleContext.Provider value={modalHandle}>
      {renderModal({isOpen, close: handleClose, children})}
    </ModalHandleContext.Provider>
  );
};

export function createModalHelper(renderModal: RenderModal) {
  function modal<T extends FunctionComponent>(
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

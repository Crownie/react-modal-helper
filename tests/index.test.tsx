import React, {useEffect} from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {createModalHelper, ModalProvider, useModalHandle} from '../src';
import Modal from 'react-modal';

const App = () => {
  return (
    <ModalProvider>
      <MyComponent />
    </ModalProvider>
  );
};

const modal = createModalHelper(({isOpen, children}) => (
  <Modal isOpen={isOpen} ariaHideApp={false}>
    {children}
  </Modal>
));

const ModalComponent = () => {
  const {close, onCloseObserver} = useModalHandle();
  useEffect(() => {
    const sub = onCloseObserver.subscribe(() => {
      console.log('ON CLOSE!');
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);
  return (
    <div data-testid="modal-component">
      <h1 data-testid="modal-title">Hello Modal!</h1>
      <button
        data-testid="dismiss-button"
        onClick={() => {
          close();
        }}
      >
        Dismiss
      </button>
    </div>
  );
};

const MyComponent = () => {
  let modalHandle;
  const onShowClick = () => {
    modalHandle = modal(ModalComponent);
  };

  const onCloseClick = () => {
    modalHandle.close();
  };

  return (
    <>
      <button data-testid="show-button" onClick={onShowClick}>
        Show
      </button>
      <button data-testid="close-button" onClick={onCloseClick}>
        Close
      </button>
    </>
  );
};

beforeAll(() => {
  render(<App />);
});

it('opens and closes', async () => {
  fireEvent.click(screen.getByTestId('show-button'));
  await waitFor(() => screen.queryByTestId('modal-component'));
  expect(screen.getByTestId('modal-title')).toHaveTextContent('Hello Modal!');
  await waitFor(() => screen.getByRole('dialog'));
  fireEvent.click(screen.getByTestId('dismiss-button'));
  expect(screen.queryByTestId('modal-component')).toBeNull();

  fireEvent.click(screen.getByTestId('show-button'));
  await waitFor(() => screen.queryByTestId('modal-component'));
  expect(screen.getByTestId('modal-title')).toHaveTextContent('Hello Modal!');
  await waitFor(() => screen.getByRole('dialog'));
  fireEvent.click(screen.getByTestId('close-button'));
  expect(screen.queryByTestId('modal-component')).toBeNull();
});

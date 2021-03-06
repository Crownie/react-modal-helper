import React, {useCallback, useRef} from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  CloseModalEvent,
  ModalTester,
  ModalTesterIds,
  TriggerType,
  useModal,
  useModalContext,
} from '../src';
import {ExampleModalAdapter} from './ExampleModalAdapter';

const App = () => {
  return <MyComponent />;
};

const ModalComponent = () => {
  const onBeforeClose = useCallback((event: CloseModalEvent, forceClose) => {
    event.preventDefault();
    forceClose();
  }, []);

  const {close} = useModalContext({onBeforeClose});

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
  const {ModalRenderer, open} = useModal(ExampleModalAdapter);
  const modalHandle = useRef<any>(null);
  const onShowClick = () => {
    modalHandle.current = open(<ModalComponent />, {type: 'example-type'});
  };

  const onCloseClick = () => {
    modalHandle.current.close();
  };

  return (
    <>
      <ModalRenderer />
      <button data-testid="show-button" onClick={onShowClick}>
        Show
      </button>
      <button data-testid="close-button" onClick={onCloseClick}>
        Close
      </button>
    </>
  );
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

it('opens and closes', async () => {
  const {getByTestId, queryByTestId, getByRole} = render(<App />);
  fireEvent.click(getByTestId('show-button'));
  await waitFor(() => queryByTestId('modal-component'));
  expect(getByTestId('modal-title')).toHaveTextContent('Hello Modal!');
  await waitFor(() => getByRole('dialog'));
  fireEvent.click(getByTestId('dismiss-button'));
  expect(queryByTestId('modal-component')).toBeNull();
  // screen.debug()
  fireEvent.click(getByTestId('show-button'));
  await waitFor(() => queryByTestId('modal-component'));
  expect(getByTestId('modal-title')).toHaveTextContent('Hello Modal!');
  await waitFor(() => getByRole('dialog'));
  fireEvent.click(getByTestId('close-button'));
  expect(queryByTestId('modal-component')).toBeNull();
});

it('modal tester renders correctly', () => {
  const {container} = render(
    <ModalTester>
      <h1>Hello Modal Tester!</h1>
    </ModalTester>,
  );
  expect(container).toMatchSnapshot();
});

it('prevent default close', async () => {
  const onBeforeClose = (event: CloseModalEvent, forceClose) => {
    if (
      event.triggerType === TriggerType.CLICK_OUTSIDE ||
      event.triggerType === TriggerType.ESC
    ) {
      event.preventDefault();
    } else {
      forceClose();
    }
  };
  const {getByTestId, queryByTestId} = render(
    <ModalTester callbacks={{onBeforeClose}}>
      <h1>Hello Modal Tester!</h1>
    </ModalTester>,
  );
  await waitFor(() => queryByTestId(ModalTesterIds.MODAL_TESTER));

  fireEvent.click(getByTestId(ModalTesterIds.ESC_BUTTON));
  fireEvent.click(getByTestId(ModalTesterIds.CLICK_OUTSIDE_BUTTON));
  expect(queryByTestId(ModalTesterIds.MODAL_TESTER)).not.toBeNull();
  fireEvent.click(getByTestId(ModalTesterIds.CLOSE_BUTTON));
  expect(queryByTestId(ModalTesterIds.MODAL_TESTER)).toBeNull();
});

it('runs forceClose', async () => {
  const {getByTestId, queryByTestId} = render(<ModalTester>dummy</ModalTester>);
  await waitFor(() => queryByTestId(ModalTesterIds.MODAL_TESTER));
  fireEvent.click(getByTestId(ModalTesterIds.FORCE_CLOSE_BUTTON));
  expect(queryByTestId(ModalTesterIds.MODAL_TESTER)).toBeNull();
});

import React, {FunctionComponent, useEffect, useRef} from 'react';
import {
  ModalAdapter,
  ModalCallbacks,
  ModalHandle,
  TriggerType,
  useModal,
  useModalContext,
} from './index';

const ModalWrapper: ModalAdapter = ({children, isOpen}) => {
  return <>{isOpen && children}</>;
};

/**
 * Automatically renders the given children as a modal
 * @constructor
 */
export const ModalTester: FunctionComponent<{
  callbacks?: ModalCallbacks;
}> = ({children, ...props}) => {
  const {ModalRenderer, open} = useModal(ModalWrapper);
  const modalHandleRef = useRef<ModalHandle>();
  useEffect(() => {
    modalHandleRef.current = open(<Modal {...props}>{children}</Modal>);
  }, [open]);
  return (
    <>
      <ModalRenderer />
      <button
        data-testid={ModalTesterIds.FORCE_CLOSE_BUTTON}
        onClick={() => {
          modalHandleRef.current?.forceClose();
        }}
      />
    </>
  );
};

const Modal: FunctionComponent<{callbacks?: ModalCallbacks}> = ({
  children,
  callbacks,
}) => {
  const {close} = useModalContext(callbacks);
  return (
    <div data-testid={ModalTesterIds.MODAL_TESTER}>
      {children}
      <button
        data-testid={ModalTesterIds.CLOSE_BUTTON}
        onClick={() => {
          close();
        }}
      />
      <button
        data-testid={ModalTesterIds.CLICK_OUTSIDE_BUTTON}
        onClick={() => {
          close(TriggerType.CLICK_OUTSIDE);
        }}
      />
      <button
        data-testid={ModalTesterIds.ESC_BUTTON}
        onClick={() => {
          close(TriggerType.ESC);
        }}
      />
    </div>
  );
};

export enum ModalTesterIds {
  MODAL_TESTER = 'modal-tester',
  ESC_BUTTON = 'esc-button',
  CLICK_OUTSIDE_BUTTON = 'click-outside-button',
  CLOSE_BUTTON = 'close-button',
  FORCE_CLOSE_BUTTON = 'force-close-button',
}

import React from 'react';
import {IModalWrapper} from '../src';
import Modal from 'react-modal';

export const ExampleModalWrapper: IModalWrapper = ({children, isOpen}) => {
  return (
    <Modal isOpen={isOpen} ariaHideApp={false}>
      {children}
    </Modal>
  );
};

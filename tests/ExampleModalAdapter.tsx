import React from 'react';
import {createModalAdapter} from '../src';
import Modal from 'react-modal';

export const ExampleModalAdapter = createModalAdapter(({children, isOpen}) => {
  return (
    <Modal isOpen={isOpen} ariaHideApp={false}>
      {children}
    </Modal>
  );
});

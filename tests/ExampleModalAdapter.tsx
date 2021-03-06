import React from 'react';
import {createModalAdapter} from '../src';
import Modal from 'react-modal';

export const ExampleModalAdapter = createModalAdapter<{type: string}>(
  ({children, isOpen, options}) => {
    return (
      <Modal isOpen={isOpen} ariaHideApp={false}>
        {children}
      </Modal>
    );
  },
);

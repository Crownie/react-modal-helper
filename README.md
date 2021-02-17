# react-modal-helper

> An utility to make the use of modals painless

[![NPM](https://img.shields.io/npm/v/react-modal-helper.svg)](https://www.npmjs.com/package/react-modal-helper)
![ts](https://badgen.net/badge/Built%20With/TypeScript/blue)

## Install

```bash
npm install --save react-modal-helper
```

## Usage

1. Create the helper

   ```tsx
   import React, {Component} from 'react';
   import {createModalAdapter} from 'react-modal-helper';
   import Modal from 'react-modal'; //<-- using react-modal here but you could use any modal component of your choice

   // create an adapter to render any modal implementation of your choice
   export const ModalAdapter = createModalAdapter(({isOpen, children}) => (
     <Modal isOpen={isOpen} ariaHideApp={false}>
       {children}
     </Modal>
   ));
   ```

2. use the `useModal` hook
   call the `open()` with any component to render it as modal.
   Render the ModalRenderer component to allow it to be displayed

   ```tsx
   import React, {Component} from 'react';
   import {useModal} from 'react-modal-helper';
   const App = () => {
     const {ModalRenderer, open} = useModal(ModalAdapter);

     const onClick = () => {
       open(<AnyComponent />);
     };

     return (
       <>
         <ModalRenderer />
       </>
     );
   };
   ```

3. Closing the modal. Get access to the modal context using `useModalContext` hook

   ```tsx
   import {useModalContext} from 'react-modal-helper'

   const MyComponent = ()=>{
       const {close} = useModalContext();

       ...
       // call the close
       close();
       ...

       return <div>My component</div>
   }
   ```

   Alternatively, the `open()` function from `useModal()` returns the modalHandle

   ```tsx
   const {close} = open(<MyComponent />);
   ```

4. Modifying close behaviour. E.g. asking user to confirm before close

   ```tsx
   import {useModalContext} from 'react-modal-helper' import {useCallback} from 'react';

   const MyComponent = ()=>{
      const onBeforeClose = useCallback((event, forceClose)=>{
        event.preventDefault();
        if(confirm("Are you sure?")){
          forceClose();
        }
      });
       const {close} = useModalContext({onBeforeClose});

       const onClick = ()=>{
          close();
       }

       return <div>My component <button onClick={onClick}>Close!</button></div>
   }
   ```

## License

MIT © [crownie](https://github.com/crownie)

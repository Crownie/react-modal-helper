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
   import {createModalHelper} from 'react-modal-helper';
   import Modal from 'react-modal'; //<-- using react-modal here but you could use any modal component of your choice

   // create the helper and export it. it will be used later
   export const modal = createModalHelper(({isOpen, children}) => (
     <Modal isOpen={isOpen} ariaHideApp={false}>
       {children}
     </Modal>
   ));
   ```

2. Wrap your app with ModalProvider

   ```tsx
   import React, {Component} from 'react';
   import {ModalProvider} from 'react-modal-helper';

   // create the helper
   <ModalProvider>
     <App />
   </ModalProvider>;
   ```

3. use the modal helper you created in step 1
   ```tsx
   // it takes the component you want to render as first argument and its props as second arg
   modal(MyComponent, {someProp: 'some prop value'});
   ```
4. Closing the modal. Get access to the modal context using useModalHandle hook

   ```tsx
   import {useModalHandle} from 'react-modal-helper'

   const MyComponent = ()=>{
       const {close} = useModalHandle();

       ...
       // call the close
       close();
       ...

       return <div>My component</div>
   }
   ```

   Alternatively, the `modal()` helper function returns the modalHandle

   ```tsx
   const {close} = modal(MyComponent, {someProp: 'some prop value'});
   ```

## License

MIT © [crownie](https://github.com/crownie)

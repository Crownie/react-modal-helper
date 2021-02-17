import {ModalAdapter} from './useModal';

export const createModalAdapter = (fn: ModalAdapter): ModalAdapter => {
  return (props) => {
    return fn(props);
  };
};

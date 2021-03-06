import {ModalAdapter} from './useModal';

export function createModalAdapter<T>(fn: ModalAdapter<T>): ModalAdapter<T> {
  return (props) => {
    return fn(props);
  };
}

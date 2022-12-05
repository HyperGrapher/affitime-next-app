/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Dispatch, SetStateAction } from 'react';

interface Propa {
  setState: Dispatch<SetStateAction<boolean>>
}

const Modal = () => {
  return (
    <div>Modal</div>
  )
}

export default Modal
import { RadioGroup } from '@headlessui/react';
import { CommissionType } from "@prisma/client";
import { useState } from 'react';
import { FormFieldError, FormFieldWrapper } from '../../components/error-messages/FormError';
import classNames from '../../utils/classnames';

interface Props {
  disabled?: boolean
  isError: boolean
  errorMsg?: string | undefined
}

const Commissons: React.FC<Props> = ({ isError, errorMsg }) => {

  const [perClickType, setPerClickType] = useState(CommissionType.PERC)


  return (
    <div>

      <FormFieldWrapper>


        <label
          className={classNames(
            "font-medium text-sm pl-2 mb-4"
          )}
          htmlFor="product_url">
          Hedef Ürün Linki
        </label>

        <RadioGroup value={perClickType} onChange={setPerClickType}>
          <RadioGroup.Label>Plan</RadioGroup.Label>
          <RadioGroup.Option value={CommissionType.PERC}>
            {({ checked }) => (
              <span className={checked ? 'bg-blue-200' : ''}>Yüzde</span>
            )}
          </RadioGroup.Option>
          <RadioGroup.Option value={CommissionType.CASH}>
            {({ checked }) => (
              <span className={checked ? 'bg-blue-200' : ''}>Nakit</span>
            )}
          </RadioGroup.Option>

        </RadioGroup>

        <FormFieldError state={isError} message={errorMsg} />

      </FormFieldWrapper>


    </div>
  )
}

export default Commissons
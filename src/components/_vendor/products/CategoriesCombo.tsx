import { Dispatch, Fragment, SetStateAction, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { HiCheck, HiSwitchVertical } from 'react-icons/hi'
import { type Category } from '@prisma/client'
import { FormFieldWrapper, FormFieldError } from '../../error-messages/FormError'



type Props = {
  cats: Category[]
  setSelected: Dispatch<SetStateAction<Category>>
  selected: Category
  err: boolean
}

const CategoriesCombo: React.FC<Props> = ({ cats, setSelected, selected, err }) => {

  // const [selected, setSelected] = useState({id: 0, name: ""})
  const [query, setQuery] = useState('')

  const filteredCategory =
    query === ''
      ? cats
      : cats.filter((c) =>
        c.name
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, ''))
      )


  return (
    <div className="w-72">
      <FormFieldWrapper>
        <Combobox value={selected} onChange={setSelected}>
          <div className="relative mt-1 z-10">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                displayValue={() => selected?.name}
                placeholder="Kategori Arayin"
                onChange={(event) => setQuery(event.target.value)}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <HiSwitchVertical
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery('')}
            >
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredCategory.length === 0 && query !== '' ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Kategori bulunamadi.
                  </div>
                ) : (
                  filteredCategory.map((cat) => (
                    <Combobox.Option
                      key={cat.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-violet-600 text-white' : 'text-gray-900'
                        }`
                      }
                      value={cat}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                              }`}
                          >
                            {cat.name}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'
                                }`}
                            >
                              <HiCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>

        <FormFieldError state={err} message="Bu alanı doldurunuz" />

      </FormFieldWrapper>

    </div>
  )
}

export default CategoriesCombo
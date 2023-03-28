import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { HiCheck, HiSwitchVertical } from 'react-icons/hi'
import type { ICreditCard } from '../../interface/payments.interface'

const cards = [
  { id: 1, name: 'world' },
  { id: 2, name: 'axess' },
  { id: 3, name: 'maximum' },
  { id: 4, name: 'cardfinans' },
  { id: 5, name: 'paraf' },
  { id: 6, name: 'advantage' },
  { id: 7, name: 'combo' },
  { id: 8, name: 'bomus' },
  { id: 9, name: 'saglamkart' },
]


type Props = {
  setSelected: Dispatch<SetStateAction<ICreditCard>>
  selected: ICreditCard
}

const CardSelector: React.FC<Props> = ({ setSelected, selected }) => {

  // const [selected, setSelected] = useState({id: 0, name: ""})
  const [query, setQuery] = useState('')

  const filteredCard =
    query === ''
      ? cards
      : cards.filter((card) =>
        card.name
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, ''))
      )


  return (
    <div className="w-72 relative z-10">
      <Combobox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={() => selected?.name.toUpperCase()}
              placeholder="Kart Seçin"
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
              {filteredCard.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Bulunamadi.
                </div>
              ) : (
                filteredCard.map((person) => (
                  <Combobox.Option
                    key={person.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-violet-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={person}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                            }`}
                        >
                          {person.name.toUpperCase()}
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
    </div>
  )
}

export default CardSelector

/*
oranlar: {
  world: {
    taksit_2: 3.33,
    taksit_3: 4.16,
    taksit_4: 4.98,
    taksit_5: 5.82,
    taksit_6: 6.65,
    taksit_7: 7.47,
    taksit_8: 8.3,
    taksit_9: 9.14,
    taksit_10: 9.96,
    taksit_11: 10.79,
    taksit_12: 11.62
  },
  axess: {
    taksit_2: 3.33,
    taksit_3: 4.16,
    taksit_4: 4.98,
    taksit_5: 5.82,
    taksit_6: 6.65,
    taksit_7: 7.47,
    taksit_8: 8.3,
    taksit_9: 9.14,
    taksit_10: 9.96,
    taksit_11: 10.79,
    taksit_12: 11.62
  },
  maximum: {
    taksit_2: 3.33,
    taksit_3: 4.16,
    taksit_4: 4.98,
    taksit_5: 5.82,
    taksit_6: 6.65,
    taksit_7: 7.47,
    taksit_8: 8.3,
    taksit_9: 9.14,
    taksit_10: 9.96,
    taksit_11: 10.79,
    taksit_12: 11.62
  },
  cardfinans: {
    taksit_2: 3.33,
    taksit_3: 4.16,
    taksit_4: 4.98,
    taksit_5: 5.82,
    taksit_6: 6.65,
    taksit_7: 7.47,
    taksit_8: 8.3,
    taksit_9: 9.14,
    taksit_10: 9.96,
    taksit_11: 10.79,
    taksit_12: 11.62
  },
  paraf: {
    taksit_2: 3.33,
    taksit_3: 4.16,
    taksit_4: 4.98,
    taksit_5: 5.82,
    taksit_6: 6.65,
    taksit_7: 7.47,
    taksit_8: 8.3,
    taksit_9: 9.14,
    taksit_10: 9.96,
    taksit_11: 10.79,
    taksit_12: 11.62
  },
  advantage: {
    taksit_2: 3.33,
    taksit_3: 4.16,
    taksit_4: 4.98,
    taksit_5: 5.82,
    taksit_6: 6.65,
    taksit_7: 7.47,
    taksit_8: 8.3,
    taksit_9: 9.14,
    taksit_10: 9.96,
    taksit_11: 10.79,
    taksit_12: 11.62
  },
  combo: {
    taksit_2: 3.33,
    taksit_3: 4.16,
    taksit_4: 4.98,
    taksit_5: 5.82,
    taksit_6: 6.65,
    taksit_7: 7.47,
    taksit_8: 8.3,
    taksit_9: 9.14,
    taksit_10: 9.96,
    taksit_11: 10.79,
    taksit_12: 11.62
  },
  bonus: {
    taksit_2: 3.33,
    taksit_3: 4.16,
    taksit_4: 4.98,
    taksit_5: 5.82,
    taksit_6: 6.65,
    taksit_7: 7.47,
    taksit_8: 8.3,
    taksit_9: 9.14,
    taksit_10: 9.96,
    taksit_11: 10.79,
    taksit_12: 11.62
  },
  saglamkart: {
    taksit_2: 3.33,
    taksit_3: 4.16,
    taksit_4: 4.98,
    taksit_5: 5.82,
    taksit_6: 6.65,
    taksit_7: 7.47,
    taksit_8: 8.3,
    taksit_9: 9.14,
    taksit_10: 9.96,
    taksit_11: 10.79,
    taksit_12: 11.62
  },
  tumu: { tek_cekim: '1.89' }
}

*/
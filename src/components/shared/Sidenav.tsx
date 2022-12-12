/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import React from 'react'
import logo from '../../assets/tw_logo.svg'
import { HiChevronRight, HiHome, HiCollection } from 'react-icons/hi'
import Link from 'next/link'
import useNavbarMenuStore from '../../store/menu.store'

const Sidenav = () => {

    const setSideOpen = useNavbarMenuStore(store => store.setSideOpen)
    const sideOpen = useNavbarMenuStore(store => store.sideOpen)

    return (
        <nav
            id='sidebar'
            className='fixed top-0 left-0 h-full w-64 bg-slate-100 py-2 px-2'>
            <header className='relative'>
                <div id="image-text" className="flex items-center">
                    <span id="image" className="max-w-[60px] flex flex-col">
                        <Image
                            className=''
                            src={logo}
                            alt='Your Company'
                            height={60}
                            width={60}
                        />
                    </span>

                    <div id='text__header-text' className="ml-2 text-base flex flex-col text-zinc-700">
                        <span id="name" className="font-bold text-lg">Affitime </span>
                        <span id="profession" className="text-sm">Affilitate App</span>
                    </div>


                </div>
                <button
                    onClick={() => setSideOpen(!sideOpen)}
                    className='absolute top-0 right-[-25px] translate-y-1/4 '>
                    <HiChevronRight
                        id='toggle'
                        className='h-8 w-8 
                    text-indigo-50 bg-indigo-600 rounded-full'
                        aria-hidden='true' />

                </button>
            </header>

            <div id="menu-bar" className=''>
                <div id="menu" className="">
                    <ul id="menu-links" className="">
                        <li id='nav-link' className="h-12 rounded-md mt-3 pl-4
                            flex items-center cursor-pointer
                            bg-slate-200 hover:bg-slate-300 transition-colors
                            "

                        >
                            <Link id="" className='flex items-center space-x-6' href={'/'} >

                                <HiHome
                                    id='toggle'
                                    className='h-8 w-8 p-1
                                             text-indigo-50 bg-indigo-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="text nav-text font-bold text-lg text-zinc-600">Home</span>

                            </Link>
                        </li>

                        <li id='nav-link' className="h-12 rounded-md mt-3 pl-4
                            flex items-center cursor-pointer
                            bg-slate-200 hover:bg-slate-300 transition-colors
                            "

                        >
                            <Link id="" className='flex items-center space-x-6' href={'/products'} >

                                <HiCollection
                                    id='toggle'
                                    className='h-8 w-8 p-1
                                             text-indigo-50 bg-indigo-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="text nav-text font-bold text-lg text-zinc-600">Products</span>

                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Sidenav
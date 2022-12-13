/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import React from 'react'
import logo from '../../assets/tw_logo.svg'
import { HiHome, HiCollection } from 'react-icons/hi'
import Link from 'next/link'
import { useRouter } from "next/router";
import { AppRoutes } from '../../config/appRoutes'
import classNames from '../../utils/classnames'

const Sidenav = () => {

    const { asPath } = useRouter();


    return (
        <nav
            className={classNames(
                'hidden lg:block fixed top-0 left-0',
                'h-full w-64 border border-slate-200  bg-white py-2 px-2')}>
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
            </header>
            {/* ` ${asPath === AppRoutes.HOME ? "bg-violet-400 hover:bg-violet-500 text-white" : "bg-slate-100 hover:bg-slate-200 text-zinc-600"} h-10 rounded-md mt-3 pl-4 flex items-center cursor-pointer transition-colors` */}
            <div id="menu-bar" className='mt-16'>
                <div id="menu" className="">
                    <ul id="menu-links" className="">
                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.HOME
                                ? "bg-violet-400 hover:bg-violet-500 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-600",
                                "h-10 rounded-md mt-3 pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>

                            <Link
                                id=""
                                className={`flex items-center space-x-6 bg-redo-100 w-full h-full`}
                                href={'/'} >

                                <HiHome
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Home</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.PRODUCTS
                                ? "bg-violet-400 hover:bg-violet-500 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-600",
                                "h-10 rounded-md mt-3 pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link id="" className='flex items-center space-x-6 bg-redo-100 w-full h-full' href={'/products'} >

                                <HiCollection
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm text-zincXXX-600">Products</span>

                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Sidenav
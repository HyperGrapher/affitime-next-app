/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import React from 'react'
import logo from '../../assets/tw_logo.svg'
import { HiHome, HiChartPie, HiShoppingBag, HiMail, HiCog, HiLink } from 'react-icons/hi'
import Link from 'next/link'
import { useRouter } from "next/router";
import { AppRoutes } from '../../config/appRoutes'
import classNames from '../../utils/classnames'
import { useSession } from "next-auth/react";
import { UserRoles } from '../../interface/auth.interface'

const Sidenav = () => {

    const { asPath } = useRouter();
    const { data: session } = useSession();

    if (!session) return null

    return session.role === UserRoles.VENDOR ? (
        <nav
            className={classNames(
                'hidden lg:block fixed top-0 left-0',
                'h-full w-64 border border-slate-200  bg-neutral-200 py-2 px-2')}>
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
            {/* ` ${asPath === AppRoutes.HOME ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-zinc-700"} h-10 rounded-md mt-3 pl-4 flex items-center cursor-pointer transition-colors` */}
            <div id="menu-bar" className='mt-16'>
                <div id="menu" className="">
                    <ul id="menu-links" className="space-y-4">
                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.HOME
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>

                            <Link
                                className={`flex items-center space-x-6 bg-redo-100 w-full h-full`}
                                href={'/'} >

                                <HiHome
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Anasayfa</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.VENDOR_DASHBOARD
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.VENDOR_DASHBOARD} >

                                <HiChartPie
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm">Vendor Dashboard</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath.startsWith(AppRoutes.VENDOR_PRODUCTS)
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.VENDOR_PRODUCTS} >

                                <HiShoppingBag
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm text-zincXXX-600">Kampanya Ürünleri</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.VENDOR_CREATE_LINK
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.VENDOR_CREATE_LINK} >

                                <HiLink
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm text-zincXXX-600">Ürün Linkleri</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === "/bil" /* AppRoutes.PRODUCTS */
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.VENDOR_DASHBOARD} >

                                <HiMail
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm text-zincXXX-600">Bildirimler</span>

                            </Link>
                        </li>
                        <li id='nav-link'
                            className={classNames(asPath === "/settings" /* AppRoutes.PRODUCTS */
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.VENDOR_DASHBOARD} >

                                <HiCog
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm text-zincXXX-600">Kullanıcı Ayarları</span>

                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    ) : (
        <nav
            className={classNames(
                'hidden lg:block fixed top-0 left-0',
                'h-full w-64 border border-slate-200  bg-neutral-200 py-2 px-2')}>
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
            {/* ` ${asPath === AppRoutes.HOME ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-zinc-700"} h-10 rounded-md mt-3 pl-4 flex items-center cursor-pointer transition-colors` */}
            <div id="menu-bar" className='mt-16'>
                <div id="menu" className="">
                    <ul id="menu-links" className="space-y-4">
                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.HOME
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>

                            <Link
                                className={`flex items-center space-x-6 bg-redo-100 w-full h-full`}
                                href={'/'} >

                                <HiHome
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Anasayfa</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.PARTNER_DASHBOARD
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.PARTNER_DASHBOARD} >

                                <HiChartPie
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm">Affiliate Dashboard</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath.startsWith(AppRoutes.PARTNER_PRODUCTS)
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.PARTNER_PRODUCTS} >

                                <HiShoppingBag
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm text-zincXXX-600">Kampanya Ürünleri</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.PARTNER_CREATE_LINK
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.PARTNER_DASHBOARD} >

                                <HiLink
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm text-zincXXX-600">Ürün Linkleri</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === "/bil" /* AppRoutes.PRODUCTS */
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.PARTNER_DASHBOARD} >

                                <HiMail
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm text-zincXXX-600">Bildirimler</span>

                            </Link>
                        </li>
                        <li id='nav-link'
                            className={classNames(asPath === "/settings" /* AppRoutes.PRODUCTS */
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.PARTNER_DASHBOARD} >

                                <HiCog
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm text-zincXXX-600">Kullanıcı Ayarları</span>

                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Sidenav
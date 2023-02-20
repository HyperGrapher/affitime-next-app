/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useSession } from "next-auth/react"
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from "next/router"
import { HiChartPie, HiCog, HiLink, HiMail, HiShoppingBag } from 'react-icons/hi'
import logo from '../../assets/tw_logo.svg'
import { AppRoutes } from '../../config/appRoutes'
import { UserRoles } from '../../interface/auth.interface'
import useNotificationStore from '../../store/notifications.store'
import classNames from '../../utils/classnames'
import { trpc } from "../../utils/trpc"
import { useEffect } from "react"

const Sidenav = () => {

    const { asPath } = useRouter();
    const { data: session } = useSession();
    const unreadNotifications = useNotificationStore(store => store.unread)
    const { pathname } = useRouter()

    const { data: nv, refetch: vFetch } = trpc.notifications.getUnreadNotificationsForVendor.useQuery(undefined, { enabled: false })
    const { data: vp, refetch: pFetch } = trpc.notifications.getUnreadNotificationsForPartner.useQuery(undefined, { enabled: false })

    const setUnread = useNotificationStore(store => store.setUnread)

    // TODO refactor these notifs & effects & trpc 
    useEffect(() => {

        if (session && session.role === UserRoles.PARTNER) {
            pFetch()
        }
        if (session && session.role === UserRoles.VENDOR) {
            vFetch()
        }
    }, [session, pathname])

    useEffect(() => {

        if (session && session.role === UserRoles.PARTNER) {
            setUnread(vp?.length ?? 0)
        }
        if (session && session.role === UserRoles.VENDOR) {
            setUnread(nv?.length ?? 0)
        }
    }, [nv, vp])



    const pathsToExlude = [
        '/r/',
        '/blog',
        '/pricing',
    ]
    for (const excluded of pathsToExlude) {

        if (pathname.startsWith(excluded)) return null

    }


    if (!session) return null

    return session.role === UserRoles.VENDOR ? (
        <nav
            className={classNames(
                'hidden lg:block fixed top-0 left-0',
                'h-full w-64 border border-slate-200  bg-neutral-200 py-2 px-2')}>
            <header className='relative'>
                <div id="image-text" className="flex opacity-0 items-center">
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
            <div id="menu-bar" className='mt-8'>
                <div id="menu" className="">
                    <ul id="menu-links" className="space-y-4">


                        <li id='nav-link'
                            className={classNames(asPath.startsWith(AppRoutes.VENDOR_DASHBOARD)
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

                                <span className="font-medium text-sm">Dashboard</span>

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

                                <span className="font-medium text-sm ">Kampanya Ürünleri</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.VENDOR_LINKS
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.VENDOR_LINKS} >

                                <HiLink
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Affiliate Linkleri</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath.startsWith(AppRoutes.VENDOR_PAYMENTS)
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.VENDOR_PAYMENTS} >

                                <HiLink
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Ödemelerim</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.VENDOR_NOTIFICATIONS
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.VENDOR_NOTIFICATIONS} >

                                <HiMail
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Bildirimler</span>

                                {unreadNotifications > 0 && <span
                                    className='scale-75 flex items-center justify-center font-medium text-center  py-1 px-2 bg-red-500 rounded-full '
                                >
                                    <p className='text-white text-xs'> {unreadNotifications}</p>
                                </span>}

                            </Link>
                        </li>
                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.SETTINGS_ACCOUNT /* AppRoutes.PRODUCTS */
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.SETTINGS_ACCOUNT} >

                                <HiCog
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Hesap Ayarları</span>

                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    ) : session.role === UserRoles.PARTNER ? (
        <nav
            className={classNames(
                'hidden lg:block fixed top-0 left-0',
                'h-full w-64 border border-slate-200  bg-neutral-200 py-2 px-2')}>
            <header className='relative'>
                <div id="image-text" className="flex opacity-0 items-center">
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
            <div id="menu-bar" className='mt-8'>
                <div id="menu" className="">
                    <ul id="menu-links" className="space-y-4">


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

                                <span className="font-medium text-sm">Dashboard</span>

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

                                <span className="font-medium text-sm ">Kampanya Ürünleri</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath.startsWith(AppRoutes.PARTNER_LINKS)
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.PARTNER_LINKS} >

                                <HiLink
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Affiliate Linkleri</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath.startsWith(AppRoutes.PARTNER_PAYMENTS)
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.PARTNER_PAYMENTS} >

                                <HiLink
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Ödemelerim</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.PARTNER_NOTIFICATIONS
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.PARTNER_NOTIFICATIONS} >

                                <HiMail
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Bildirimler</span>

                                {unreadNotifications > 0 && <span
                                    className=' scale-75 flex items-center justify-center font-medium text-center text-xs py-1 px-2 bg-red-500 rounded-full '
                                >
                                    <p className='text-white text-xs'> {unreadNotifications}</p>
                                </span>}

                            </Link>
                        </li>
                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.SETTINGS_ACCOUNT
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.SETTINGS_ACCOUNT} >

                                <HiCog
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Hesap Ayarları</span>

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
            <div id="menu-bar" className='mt-8'>
                <div id="menu" className="">
                    <ul id="menu-links" className="space-y-4">


                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.ADMIN_DASHBOARD
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.ADMIN_DASHBOARD} >

                                <HiChartPie
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm">Admin Dashboard</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath.startsWith(AppRoutes.ADMIN_PRODUCTS)
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.ADMIN_PRODUCTS} >

                                <HiShoppingBag
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Kampanya Ürünleri</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath.startsWith(AppRoutes.ADMIN_LINKS)
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.ADMIN_LINKS} >

                                <HiLink
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Affiliate Linkleri</span>

                            </Link>
                        </li>

                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.ADMIN_NOTIFICATIONS
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.ADMIN_NOTIFICATIONS} >

                                <HiMail
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Bildirimler</span>

                                {unreadNotifications > 0 && <span
                                    className=' scale-75 flex items-center justify-center font-medium text-center text-xs py-1 px-2 bg-red-500 rounded-full '
                                >
                                    <p className='text-white text-xs'> {unreadNotifications}</p>
                                </span>}

                            </Link>
                        </li>
                        <li id='nav-link'
                            className={classNames(asPath === AppRoutes.SETTINGS_ACCOUNT
                                ? "bg-violet-600 hover:bg-violet-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-zinc-700",
                                "h-10 rounded-md pl-4 flex items-center",
                                "cursor-pointer transition-colors"
                            )}>
                            <Link
                                className='flex items-center space-x-6 bg-redo-100 w-full h-full'
                                href={AppRoutes.SETTINGS_ACCOUNT} >

                                <HiCog
                                    id='toggle'
                                    className='h-6 w-6 p-1
                                             text-violet-50 bg-violet-600 rounded-full'
                                    aria-hidden='true' />

                                <span className="font-medium text-sm ">Hesap Ayarları</span>

                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Sidenav
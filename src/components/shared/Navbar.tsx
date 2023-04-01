/* eslint-disable react-hooks/exhaustive-deps */
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import profileImg from '../../assets/profile.webp'
import { AppRoutes } from '../../config/appRoutes'
import { UserRoles } from '../../interface/auth.interface'
import classNames from '../../utils/classnames'
import { trpc } from '../../utils/trpc'
import TopBarProgress from "react-topbar-progress-indicator";
import { HiOutlineMenu as IcMenu } from 'react-icons/hi'
import useNavbarStore from '../../store/navbar.store'


const pathsToExlude = [
  '/r/',
  '/auth/',
  '/rules-and-policies',
  '/pricing',
  '/blog',
  '/contact-us',

]

const Navbar: React.FC = () => {

  const [busy, setBusy] = useState(false)
  const { data: sessionData } = useSession()
  const { pathname } = useRouter()
  const deleteUserSession = trpc.auth.deleteSession.useMutation()
  const update = useNavbarStore(store => store.update)
  const { data, refetch } = trpc.user.getSessionAccount.useQuery()

  useEffect(() => {
    refetch()
    console.log(update);

  }, [update])

  const logUserOut = () => {
    setBusy(true)

    deleteUserSession.mutate(undefined, {
      onSettled: () => {
        signOut({ redirect: true, callbackUrl: '/' })
        setBusy(false)
      }
    })

  }

  if (pathname === '/') return null

  for (const excluded of pathsToExlude) {

    if (pathname.startsWith(excluded)) return null

  }

  return (
    <Disclosure as='nav' className='h-16 bg-violet-900x bg-white fixed top-0 left-0 right-0 shadow-sm z-10'>
      {() => (
        <>
          {busy && <TopBarProgress />}

          {/* <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 bg-red-300'> */}
          <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 '>
            <div className='relative flex h-16 items-center justify-between'>
              <div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
                {/* Mobile menu button*/}
                {/* <Disclosure.Button className='inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'>
                  <span className='sr-only'>Open main menu</span>
                  {open ? (
                    <HiX className='block h-6 w-6' aria-hidden='true' />
                  ) : (
                    <HiBookOpen className='block h-6 w-6' aria-hidden='true' />
                  )}
                </Disclosure.Button> */}
              </div>
              <div className='flex flex-1 items-center sm:items-stretch sm:justify-start'>
                <div className='flex flex-shrink-0 items-center absolute top-0 left-0 w-64 h-full bg-violetx-400'>

                  <div className="mx-auto">
                    <Image
                      className='h-8 w-auto'
                      src="/logo-sm.png"
                      alt='Affitime Logo'
                      width={220}
                      height={60}
                    />
                  </div>

                </div>
              </div>
              <div className='absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
                {/* dashboard dropdown */}
                <p className='text-slate-500 text-xs font-medium hidden md:inline'>{sessionData?.email}</p>
                <Menu as='div' className='relative ml-3'>
                  <div>
                    <Menu.Button className='flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 '>
                      <span className='sr-only'>Open user menu</span>
                      <Image height={40} width={40} className='h-10 w-10 rounded-full hidden lg:block' src={data?.image ? data?.image : profileImg} alt='dashboard image' />
                      <IcMenu width={40} height={40} className='block lg:hidden w-10 h-10' />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter='transition ease-out duration-100'
                    enterFrom='transform opacity-0 scale-95'
                    enterTo='transform opacity-100 scale-100'
                    leave='transition ease-in duration-75'
                    leaveFrom='transform opacity-100 scale-100'
                    leaveTo='transform opacity-0 scale-95'>
                    <Menu.Items className='absolute right-0 z-10 mt-5 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>


                      {!sessionData ? <Fragment>

                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href='/'
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}>
                              Anasayfa
                            </Link>
                          )}
                        </Menu.Item>


                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href={AppRoutes.SIGNIN}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}>
                              Giriş Yap
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href={AppRoutes.SIGNUP}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}>
                              Kayıt Ol
                            </Link>
                          )}
                        </Menu.Item>

                      </Fragment> :

                        <Fragment>

                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={`${sessionData.role === UserRoles.PARTNER ? AppRoutes.PARTNER_DASHBOARD : AppRoutes.VENDOR_DASHBOARD}`}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}>
                                Dashboard
                              </Link>
                            )}
                          </Menu.Item>

                          {sessionData.role === UserRoles.VENDOR ? <><Menu.Item>
                            {({ active }) => (
                              <Link
                                href={AppRoutes.VENDOR_PRODUCTS}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}>
                                Ürünler
                              </Link>
                            )}
                          </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={AppRoutes.VENDOR_LINKS}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}>
                                  Affiliate Linkleri
                                </Link>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={AppRoutes.VENDOR_PAYMENTS}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}>
                                  Ödemeler
                                </Link>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={AppRoutes.VENDOR_NOTIFICATIONS}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}>
                                  Bildirimler
                                </Link>
                              )}
                            </Menu.Item>


                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={AppRoutes.VENDOR_ACCOUNT_SETTINGS}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block w-full px-4 py-2 text-left text-sm text-gray-700'
                                  )}>
                                  Hesap Ayarlari
                                </Link>
                              )}
                            </Menu.Item>

                          </> : (<>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={AppRoutes.PARTNER_PRODUCTS}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}>
                                  Ürünler
                                </Link>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={AppRoutes.PARTNER_LINKS}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}>
                                  Affiliate Linklerim
                                </Link>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={AppRoutes.PARTNER_PAYMENTS}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}>
                                  Ödemelerim
                                </Link>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={AppRoutes.PARTNER_NOTIFICATIONS}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}>
                                  Bildirimler
                                </Link>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={AppRoutes.PARTNER_ACCOUNT_SETTINGS}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block w-full px-4 py-2 text-left text-sm text-gray-700'
                                  )}>
                                  Hesap Ayarlari
                                </Link>
                              )}
                            </Menu.Item>

                          </>
                          )}



                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={AppRoutes.LEGAL}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full px-4 py-2 text-left text-sm text-gray-700'
                                )}>
                                Kullanıcı Sözleşmesi
                              </Link>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <button
                                type='button'
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full px-4 py-2 text-left text-sm text-gray-700'
                                )}
                                onClick={logUserOut}>
                                Çıkış yap
                              </button>
                            )}
                          </Menu.Item>
                        </Fragment>

                      }

                    </Menu.Items>
                  </Transition>
                </Menu>

              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  )
}

export default Navbar
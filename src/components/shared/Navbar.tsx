import { Disclosure, Menu, Transition } from '@headlessui/react'
import Typography from '@mui/material/Typography'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment } from 'react'
import profileImg from '../../assets/profile.webp'
import logo from '../../assets/tw_logo.svg'
import { AppRoutes } from '../../config/appRoutes'
import { UserRoles } from '../../interface/auth.interface'
import classNames from '../../utils/classnames'

// https://github.com/joschan21/business-card-fullstack/blob/main/src/components/shared/Navbar.tsx
// https://www.youtube.com/watch?v=qJnIJa-cF2M

const pathsToExlude = [
  '/r/',
]

const Navbar: React.FC = () => {

  const { data: sessionData } = useSession()
  const { pathname } = useRouter()
  let sh = true
  if (pathname === '/') sh = true

  const logUserOut = () => {
    signOut({ redirect: true, callbackUrl: '/' })
  }

  for (const excluded of pathsToExlude) {

    if (pathname.startsWith(excluded)) return null

  }

  return (
    <Disclosure as='nav' className='h-16 bg-violet-900 fixed top-0 left-0 right-0 shadow-lg z-10'>
      {({ open }) => (
        <>
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
                <div className='flex flex-shrink-0 items-center'>
                  <Image
                    className='h-8 w-auto'
                    src={logo}
                    alt='Affitime Logo'
                    width={50}
                    height={50}
                  />
                  <Typography
                    color={'rgba(255, 255, 255, 0.849)'}
                    ml={'1rem'}
                    variant='h5'>Affitime</Typography>
                </div>
              </div>
              <div className='absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
                {/* dashboard dropdown */}
                <p className='text-white text-xs'>{sessionData?.email}</p>
                {sh && <Menu as='div' className='relative ml-3'>
                  <div>
                    <Menu.Button className='flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'>
                      <span className='sr-only'>Open user menu</span>
                      <Image className='h-8 w-8 rounded-full' src={sessionData?.image ?? profileImg} alt='dashboard image' />
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

                      {!sessionData ? <Fragment>

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

                          {sessionData.role === UserRoles.VENDOR ? <Menu.Item>
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
                          </Menu.Item> : null}

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
                </Menu>}

              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  )
}

export default Navbar
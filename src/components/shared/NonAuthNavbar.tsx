import { useSession } from "next-auth/react";
// import Logo from '../../assets/logo-sm.png';
import LogoAFT from '../../assets/aft-and-logo-sm.png';
import Link from "next/link";
import Image from "next/image";
import classNames from '../../utils/classnames';
import { AppRoutes } from "../../config/appRoutes";

const NonAuthNavbar = () => {

    const { data: session } = useSession()

    return session ? null : (
        <nav className={classNames(
            'flex items-center h-20 my-auto',
            'bg-white font-medium text-violet-800',
            'px-4 md:px-0'
        )}>
            <div className="flex items-center justify-between container mx-auto px-0 lg:px-8">
                <Link href="/">
                    <Image width={125} src={LogoAFT} alt="Affitime Logo" />
                </Link>

                <div className="hidden md:flex space-x-4 lg:space-x-10 ">

                    <Link href="/">
                        Anasayfa
                    </Link>

                    <Link href="/pricing">
                        Fiyatlandırma
                    </Link>

                    <Link href="/blog">
                        Blog
                    </Link>

                    <Link href={AppRoutes.CONTACT}>
                        İletişim
                    </Link>

                </div>


                <div className="flex space-x-4 lg:space-x-6 font-medium">
                    <Link
                        className={classNames(
                            'text-violet-600 hover:text-violet-500',
                            'py-2 text-smxx px-6',
                            'whitespace-nowrap',
                        )}
                        href="/auth/signin">
                        Giriş Yap
                    </Link>

                    <Link
                        className={classNames(
                            'text-violet-600 hover:text-violet-500',
                            'py-2 text-smxx px-6',
                            'rounded-lg',
                            'whitespace-nowrap',
                            'border-solid border-2 border-violet-500 ',
                            // 'outline outline-offset-0 outline-violet-500 ',
                        )}
                        href="/auth/signup">
                        Kayıt Ol
                    </Link>
                </div>

            </div>
        </nav>
    )
}

export default NonAuthNavbar
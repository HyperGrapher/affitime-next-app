
import Image from "next/image"
import Link from "next/link"
import FLogo from '../../assets/footer/logo-footer.png'
import MSStartup from '../../assets/footer/ms-startup-badge.png'
import Partners from '../../assets/footer/partners.png'
import SocFB from '../../assets/footer/social-facebook.png'
import SocIns from '../../assets/footer/social-instagram.png'
import SocLinkd from '../../assets/footer/social-linkedin.png'
import { AppRoutes } from "../../config/appRoutes"

const Footer = () => {

    return <footer className="bg-white py-28 px-1 lg:px-36 relative z-50">

        <div className="container mx-auto flex justify-center md:justify-between flex-wrap gap-8 md:gap-2">

            <section className="flex flex-col space-y-8">
                <div className="a">
                    <Image width={150} src={FLogo} alt="logo" />
                    <small className="text-slate-400"> {new Date().getFullYear()} Affitime Tüm hakları saklıdır.</small>
                </div>

                <div className="space-y-4">
                    <b className="text-slate-800">İş Ortaklarımız</b>
                    <Image width={300} src={Partners} alt="logo" />
                </div>

            </section>

            <section className="flex flex-col space-y-2">
                <b className="text-slate-800">Yasal</b>
                <Link href={`${AppRoutes.LEGAL}?tab=0`} className="text-slate-800 hover:text-blue-500 hover:underline">Kullanıcı sözleşmesi</Link>
                <Link href={`${AppRoutes.LEGAL}?tab=1`} className="text-slate-800 hover:text-blue-500 hover:underline">Gizlilik sözleşmesi</Link>
                <Link href={`${AppRoutes.LEGAL}?tab=2`} className="text-slate-800 hover:text-blue-500 hover:underline">Çerez Politikası</Link>
                <Link href={AppRoutes.CONTACT} className="text-slate-800 hover:text-blue-500 hover:underline">İletişim</Link>
            </section>

            <section className="flex flex-col space-y-8">
                <Image width={200} src={MSStartup} alt="microsoft for startups badge" />
                <div className="">
                    <b className="text-slate-800">Sosyal Ağlar</b>
                    <div className="flex space-x-2 mt-2 justify-betweens">

                        <Image width={24} src={SocFB} alt="facebook social" />
                        <Image width={24} src={SocIns} alt="instagram social" />
                        <Image width={24} src={SocLinkd} alt="linkedin social" />
                    </div>
                </div>
            </section>
        </div>
    </footer>
}



export default Footer
import Image from "next/image";
import PageCard from "../../components/card/Card"
import Head from "next/head";
import SocFB from '../../assets/footer/social-facebook.png'
import SocIns from '../../assets/footer/social-instagram.png'
import SocLinkd from '../../assets/footer/social-linkedin.png'

const Contact = () => {
    return (
        <div>
            <Head>
                <title>Affitime | İletişim</title>
            </Head>
            <section className="text-gray-600 body-font relative flex">


                <PageCard>
                    <div className="container px-5 py-24 mx-auto" >
                        <div className="flex flex-col text-center w-full mb-12" >
                            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">İletişim</h1>
                            <p className="lg:w-2/3 mx-auto leading-relaxed text-base">Mesajinizi bize iletin.</p>
                        </div>

                        <div className="lg:w-1/2 md:w-2/3 mx-auto" >
                            <div className="flex flex-wrap -m-2" >
                                <div className="p-2 w-1/2" >
                                    <div className="relative" >
                                        <label htmlFor="name" className="leading-7 text-sm text-gray-600">İsim</label>
                                        <input type="text" id="name" name="name" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                                    </div>
                                </div>
                                <div className="p-2 w-1/2" >
                                    <div className="relative" >
                                        <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
                                        <input type="email" id="email" name="email" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                                    </div>
                                </div>
                                <div className="p-2 w-full" >
                                    <div className="relative" >
                                        <label htmlFor="message" className="leading-7 text-sm text-gray-600">Mesaj</label>
                                        <textarea id="message" name="message" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out" />
                                    </div>
                                </div>
                                <div className="p-2 w-full" >
                                    <button className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Gönder</button>
                                </div>
                                <div className="p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center" >
                                    <a className="text-indigo-500">info@affitime.com</a>
                                    <p className="leading-normal my-5">
                                        Şirket Adı: Necdet Erim Işık
                                        <br />
                                        Adres: İTOB OSB Mah. 10032 Sk. No: 2 Bilimpark Menderes/ İzmir
                                        <br />
                                        Telefon: +90 506 755 2334
                                        <br />
                                        Vergi Dairesi: Menderes V.D.
                                        <br />
                                        Vergi Kimlik No: 4670676613
                                        <br />
                                    </p>
                                    <div className="flex space-x-2 mt-2 justify-center">

                                        <a className="#"
                                            href="https://www.facebook.com/affitimecom/"
                                            target="_blank"
                                            rel="noreferrer">
                                            <Image width={24} src={SocFB} alt="facebook social" />

                                        </a>
                                        <a className="#"
                                            href="https://www.instagram.com/affitimecom/"
                                            target="_blank"
                                            rel="noreferrer">
                                            <Image width={24} src={SocIns} alt="instagram social" />

                                        </a>
                                        <a className="#"
                                            href="https://www.linkedin.com/company/affitime/"
                                            target="_blank"
                                            rel="noreferrer">

                                            <Image width={24} src={SocLinkd} alt="linkedin social" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PageCard>
            </section >
        </div>

    )
}

export default Contact
// import Container from "@mui/material/Container";
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import MacMock from '../assets/home/mac-mockup.png';
import { FaqIndex } from "../components/shared/Faq"
import { AppRoutes } from "../config/appRoutes";
import { TbHeartHandshake } from "react-icons/tb";
import { GiReceiveMoney } from "react-icons/gi";
import { BiLineChart } from "react-icons/bi";
import Balancer from "react-wrap-balancer";


const Home: NextPage = () => {



  return <div className="">
    <Head>
      <title>Affitime | Anasayfa</title>
      <meta name="description" content="Affiliate uygulamasi" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <header className="text-white body-font bg-violet-700 py-12  bg-gradient-to-r from-indigo-900 to-violet-500">
      <div className="container mx-auto flex px-8 py-24 md:flex-row flex-col items-center" >
        <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center" >
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-white">

            <Balancer>
              affitime ile birden çok affiliate marketing kampanyası oluştur
              ve affiliatelerini yönet.
            </Balancer>

          </h1>
          <p className="mb-8 leading-relaxed text-xl">
            affitime ile firmanın satışlarını arttır.
            <br />
            affitime ile gelir elde et.
          </p>
          <div className="flex justify-center" >

            <Link href={AppRoutes.SIGNUP}
              className="inline-flex text-white bg-orange-500 border-0 py-2 px-6 focus:outline-none hover:bg-orange-600 rounded text-lg">
              Hadi Başlayalım
            </Link>
          </div>
        </div>
        <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6" >
          <div className="">
            <Image className="" src={MacMock} alt={"cover"} />
          </div>
        </div>
      </div>
    </header>

    <Feat />
    <Feat2 />

    <FaqIndex />
    <FooterTop />

  </div>

};

// <div className="relative flex justify-center items-center h-[350px] bg-gradient-to-r from-teal-900 to-teal-500">

const FooterTop = () => {
  return (<div className="relative flex justify-center items-center h-[350px] bg-gradient-to-r from-indigo-900 to-violet-500">

    <div className="flex flex-col items-center space-y-8 py-8">
      <h4 className="z-10 font-bold text-3xl text-center text-white">
      Affiliate marketing programını şimdi başlat
      </h4>

      <p className="text-lg text-center text-white/70">
        affitime affiliatelerini ve raporları yönetme, teklifleri duyurma ve ödeme yapma imkanı verecektir.
        <br />
        Performanstan ödün vermeden basit ve işlevsel kontrol paneli ile programını şimdi başlat.
      </p>

      <Link href={AppRoutes.PRICING}
        className="z-10 whitespace-nowrap text-white bg-orange-500 border-0 py-2 px-6 focus:outline-none hover:bg-orange-600 rounded text-lg"
      >Planları İncele</Link>
    </div>

    <div className="absolute left-0 top-0">
      <svg width="141" height="157" viewBox="0 0 141 157" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="41.5" cy="57.5" r="99.5" fill="#CA2D78" />
      </svg>

    </div>

    <div className="absolute right-0 bottom-0">
      <svg width="154" height="159" viewBox="0 0 154 159" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="99.5" cy="99.5" r="99.5" fill="#5087ff" />
      </svg>

    </div>

  </div>)
}

const Feat2 = () => {
  return (<section className="bg-violet-600 text-white relative  bg-gradient-to-r from-teal-800 to-green-500">
    <div className="container px-5 py-24 mx-auto" >
      <div className="flex flex-col text-center w-full mb-20" >
        <h3 className="z-10  sm:text-3xl text-2xl font-medium title-font text-white/80">affitime ile neler yapabilirsiniz?</h3>
      </div>
      <main className="flex flex-wrap justify-center gap-2 lg:gap-24 -m-4 mx-auto bg-red-100/20z" >
        <article className="flex flex-col gap-4">

          <section className="flex space-x-4">
            <b className="text-slate-200 font-bold text-3xl">01</b>
            <p className="z-10 text-white/70 w-[300px]">
              Tıklama başına ödeme ve/veya satış başına belirli bir yüzdeyle ödeme istediğin ödeme şeklini seç.
            </p>
          </section>

          <section className="flex space-x-4">
            <b className="text-slate-200 font-bold text-3xl">02</b>
            <p className="z-10 text-white/70 w-[300px]">
              Fraud Protection: affitime kendi geliştirdiği algoritmalarla sahte tıklamaların önüne geçer.
              Sadece Türkiye’de bulunan ve gerçek kullanıcıların yapmış olduğu tek tıklama geçerli sayılır.
            </p>
          </section>

        </article>

        <article className="flex flex-col gap-4 ">

          <section className="flex space-x-4">
            <b className="text-slate-200 font-bold text-3xl">03</b>
            <p className="text-white/70 w-[300px]">
              Kampanya oluştur ve başvuran influencerlar arasından onay verdiklerinle çalış.
              Tüm verileri anlık olarak görüntüle.

            </p>
          </section>

          <section className="flex space-x-4">
            <b className="text-slate-200 font-bold text-3xl">04</b>
            <p className="z-10 text-white/70 w-[300px]">
              Tek tıkla ödeme: Affiliatelere yapacağın ödemeleri platform üzerinden tek seferde öde.
            </p>
          </section>

        </article>
      </main>

    </div>


    <div className="absolute left-0 top-0 z-0">
      <svg width="141" height="157" viewBox="0 0 141 157" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="41.5" cy="57.5" r="99.5" fill="#46cf6f" />
      </svg>

    </div>

    <div className="absolute right-0 bottom-0">
      <svg width="154" height="159" viewBox="0 0 154 159" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="99.5" cy="99.5" r="99.5" fill="#ffc850" />
      </svg>

    </div>
  </section>
  )

}


const Feat = () => {
  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto" >
        <div className="flex flex-col text-center w-full mb-20" >
          <h3 className="z-10 sm:text-3xl text-2xl font-medium title-font text-gray-900">Neden affitime?</h3>
          <p className="text-lg mt-2">affitime marka bilinirliğini, satışlarını reklam maliyetleri olmadan arttırmanı sağlar.
            <br />
            affitime ile affiliate marketing kampanyaları oluşturabilir bu kampanyalar için
            hem yeni affiliatelere ulaşabilir
            <br />
            hem kendi çalışmak istediğin affiliateleri kampanyana dahil edebilirsin.</p>
        </div>
        <div className="flex flex-wrap -m-4" >
          <div className="p-4 md:w-1/3" >
            <div className="flex rounded-lg h-full bg-gray-200 p-8 flex-col" >
              <div className="flex items-center mb-3" >
                <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0" >
                  <GiReceiveMoney />
                </div>
                <h2 className="text-gray-900 text-lg title-font font-medium">Reklam maliyeti yok</h2>
              </div>
              <div className="flex-grow" >
                <p className="leading-relaxed text-base">
                  Affiliatelerden aldığın sonuç başına ödeme yap ve giderlerini düşür

                </p>

              </div>
            </div>
          </div>
          <div className="p-4 md:w-1/3" >
            <div className="flex rounded-lg h-full bg-gray-200 p-8 flex-col" >
              <div className="flex items-center mb-3" >
                <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0" >
                  <BiLineChart />
                </div>
                <h2 className="text-gray-900 text-lg title-font font-medium">Marka bilinirliğini arttır</h2>
              </div>
              <div className="flex-grow" >
                <p className="leading-relaxed text-base">
                  Her kategoriden influencerla çalış bu sana sponsorlu reklamlardan daha çok etkileşim sağlayacaktır.

                </p>

              </div>
            </div>
          </div>
          <div className="p-4 md:w-1/3" >
            <div className="flex rounded-lg h-full bg-gray-200 p-8 flex-col" >
              <div className="flex items-center mb-3" >
                <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0" >
                  <TbHeartHandshake height={'32px'} width={'32px'} />
                </div>
                <h2 className="text-gray-900 text-lg title-font font-medium">Marka sadakati</h2>
              </div>
              <div className="flex-grow" >
                <p className="leading-relaxed text-base">
                  Düzenli kampanyalar sayesinde hem affiliatelerinin hem takipçilerinin marka sadakatini arttır.
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}




export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {

  const session = await getSession(context)

  if (session) return {
    redirect: {
      destination: `/${session.role.toLowerCase()}/dashboard`,
      permanent: false
    }
  }


  return { props: {} }

}
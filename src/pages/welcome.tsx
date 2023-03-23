import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import { AppRoutes } from '../config/appRoutes';
import PageCard from "../components/card/Card";
import InterestItem from "../components/poll/InterestItem";
import { POLL_CATEGORIES } from "../config/constants";
import type { InterestType, PollCatsFormElement } from "../interface/pollform.interface";
import { notifyError } from "../utils/notifications";
import classNames from "../utils/classnames";
import { HiPencil } from 'react-icons/hi';
import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';
import SocialItem from "../components/poll/SocialItem";
import { Base64 } from 'js-base64';
import { useEffect, useState } from "react";
import InterestForm from "../components/poll/InterestForm";
import SocialForm from "../components/poll/SocialForm";


// ? TEST EXIST
const Welcome: NextPage = () => {


  const { replace } = useRouter()
  const [step, setStep] = useState(0)


  useEffect(() => {
    console.log(`Step: ${step}`);

  }, [step])


  return (
    <main className='mt-24'>

      <h1 className='text-4xl text-center'>Hoşgeldin</h1>

      <div className="flex flex-col items-center gap-2 container mx-auto px-2 md:px-24">


        {step === 0 && <InterestForm setStep={setStep} />}
        {step === 1 && <SocialForm setStep={setStep} />}

      </div>

    </main>
  )
}

export default Welcome



const TPollItem = () => {

  return (
    <div className="p-2 sm:w-1/2 w-full">
      <div className="bg-gray-100 rounded flex p-4 h-full items-center">

        <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" className="text-indigo-500 w-6 h-6 flex-shrink-0 mr-4" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
          <path d="M22 4L12 14.01l-3-3"></path>
        </svg>

        <span className="title-font font-medium">Pack Truffaut Blue</span>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {

  const session = await getSession(context)

  if (!session) return {
    redirect: {
      destination: AppRoutes.SIGNIN,
      permanent: false
    }
  }

  return { props: { session } }

}


/*

Kanka selam son olarak kontrol ettim affiliate kısmını
1) Affiliate kayıt olurken ilgilendiği sektörleri sormak
2) Affiliate'in banka hesap bilgilerini sormak IBAN ad soyad gibi (burda tabi paytr'ın pazaryeri entegrasyonuna bağlanıcağımız için belki onlar banka ismi de sorabilir.)
3) Affiliate kayıt olurken instagram, facebook, twitter, tiktok, linkedin hesap bilgilerini sormak kullanıcı adı veya hesap linki olarak
4) Affiliate kayıt olurken telefon numarası da soralım ama bu zorunlu olmasın mesela
bunların hepsini firma fatura ekranı gibi bişiyde talep edelim ilk kayıt olduktan sonra ve ileride ayarlardan bunları da değiştirebilirsin affiliateler bence

1) Takipçilerin hangi kategorilerdeki ürünlerle ilgileniyor? (Birden fazla seçim yapabilirsin.)
Elektronik
Giyim & Aksesuar
Müzik Aletleri
Cep Telefonu
Elektrikli Ev Aletleri
Anne & Bebek
Hobi & Oyuncak
Kişisel Bakım & Kozmetik
Oyun & Konsol
Takı, Mücevher & Altın
2) Seni daha iyi tanıyabilmemiz için sosyal medya platformlarındaki profilinin linkine ihtiyacımız var. Bu yüzden aşağıdaki bilgileri doldurmana ihtiyacımız var.
Instagram
Facebook
Twitter
LinkedIn
Tiktok

3) (ayri bir sayfada olabilir bu soru)
Firmaların sana yapacağı ödemeler için banka hesap bilgilerine ihtiyacımız var.
Alıcı İsim Soyismi
Banka Adı(coktan secmeli olabilir)(IBAN

Kanka selam anket sorulari bu sekilde olcak ama 3 numarada girilmesi gereken bilgiler belki paytr in pazaryeri cozumunun apisi uzerinden gerceklestirilecektir onlara destek mesaji attim bugun haftaici cevap verceklermis bilgin olsun istedim

*/
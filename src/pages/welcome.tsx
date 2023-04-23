import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import { useState } from "react";
import InterestForm from "../components/poll/InterestForm";
import SocialForm from "../components/poll/SocialForm";
import { AppRoutes } from '../config/appRoutes';
import { UserRoles } from "../interface/auth.interface";

// ? TEST EXIST
const Welcome: NextPage = () => {

  const [step, setStep] = useState(0)

  return (
    <main className='mt-24'>

      <h1 className='text-4xl font-bold text-violet-700 text-center'>Hoşgeldin</h1>

      <div className="flex flex-col items-center gap-2 container mx-auto px-2 md:px-24">


        {step === 0 && <InterestForm setStep={setStep} />}
        {step === 1 && <SocialForm />}

      </div>

    </main>
  )
}

export default Welcome

export const getServerSideProps: GetServerSideProps = async (context) => {

  const session = await getSession(context)

  // if (!session) return {
  //   redirect: {
  //     destination: AppRoutes.SIGNIN,
  //     permanent: false
  //   }
  // }


  // if (session.role !== UserRoles.PARTNER) return {
  //   redirect: {
  //     destination: `/${session.role.toLowerCase()}/dashboard`,
  //     permanent: false
  //   }
  // }

  return { props: {} }

}


/*

Kanka selam son olarak kontrol ettim affiliate kısmını
1) Affiliate kayıt olurken ilgilendiği sektörleri sormak
2) Affiliate'in banka hesap bilgilerini sormak IBAN ad soyad gibi (burda tabi paytr'ın pazaryeri entegrasyonuna bağlanıcağımız için belki onlar banka ismi de sorabilir.)
3) Affiliate kayıt olurken instagram, facebook, twitter, tiktok, linkedin hesap bilgilerini sormak kullanıcı adı veya hesap linki olarak
4) Affiliate kayıt olurken telefon numarası da soralım ama bu zorunlu olmasın mesela
bunların hepsini firma fatura ekranı gibi bişiyde talep edelim ilk kayıt olduktan sonra ve ileride ayarlardan bunları da değiştirebilirsin affiliateler bence

3) (ayri bir sayfada olabilir bu soru)
Firmaların sana yapacağı ödemeler için banka hesap bilgilerine ihtiyacımız var.
Alıcı İsim Soyismi
Banka Adı(coktan secmeli olabilir)(IBAN

Kanka selam anket sorulari bu sekilde olcak ama 3 numarada girilmesi gereken bilgiler belki paytr in pazaryeri cozumunun apisi uzerinden gerceklestirilecektir onlara destek mesaji attim bugun haftaici cevap verceklermis bilgin olsun istedim

*/
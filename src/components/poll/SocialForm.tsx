import PageCard from "../card/Card";
import InterestItem from "./InterestItem";
import { POLL_CATEGORIES } from "../../config/constants";
import type { PollSocialFormElement, SocialType } from "../../interface/pollform.interface";
import { notifyError } from "../../utils/notifications";
import classNames from "../../utils/classnames";
import { HiPencil } from 'react-icons/hi';
import { trpc } from '../../utils/trpc';
import { useRouter } from 'next/router';
import { useState } from "react";
import { AppRoutes } from "../../config/appRoutes";
import SocialItem from "./SocialItem";
import type { Dispatch, SetStateAction } from 'react';
import TopBarProgress from "react-topbar-progress-indicator";

type Props = {
  setStep: Dispatch<SetStateAction<number>>
}

const SocialForm: React.FC<Props> = ({ setStep }) => {

  const { replace } = useRouter()
  const [busy, setBusy] = useState(false)
  const updatePartnerSocials = trpc.partner.updateSocials.useMutation()


  const onPollSubmit = (e: React.FormEvent<PollSocialFormElement>) => {
    e.preventDefault()
    setBusy(true)
    const data = [
      {
        platform: "instagram",
        handle: e.currentTarget.elements.instagram.value,
      },
      {
        platform: "facebook",
        handle: e.currentTarget.elements.facebook.value,
      },
      {
        platform: "twitter",
        handle: e.currentTarget.elements.twitter.value,
      },
      {
        platform: "linkedin",
        handle: e.currentTarget.elements.linkedin.value,
      },
      {
        platform: "tiktok",
        handle: e.currentTarget.elements.tiktok.value,
      },



    ]

    const truthySocials = data.map(x => x.handle ? x : undefined).filter(x => x !== undefined)

    if (truthySocials.length === 0) {
      setBusy(false)
      return notifyError("En az bir sosyal platform ismi girin!")
    }

    updatePartnerSocials.mutate(truthySocials as SocialType[], {
      onSuccess: () => {
        console.log("ok");
        setBusy(false)
        replace(AppRoutes.PARTNER_DASHBOARD)
        

      },
      onError(error) {
        console.log(error)
        notifyError('Hata. ilgi alanları düzenlenemedi!')
        replace(AppRoutes.PARTNER_DASHBOARD)
        setBusy(false)

      },
    })




  }

  return (
    <PageCard>
      {busy && <TopBarProgress />}
      <h1 className='text-xl text-center font-medium text-slate-600'>Seni daha iyi tanıyabilmemiz için sosyal medya platformlarındaki profilinin linkine ihtiyacımız var. Bu yüzden aşağıdaki bilgileri doldurmana ihtiyacımız var.</h1>

      <section className="my-8">

        <form onSubmit={onPollSubmit} className="mx-auto">

          <div className="flex flex-wrap lg:w-4/5 sm:mx-auto sm:mb-2 -mx-2">

            <SocialItem name="instagram" label="Instagram" />
            <SocialItem name="facebook" label="Facebook" />
            <SocialItem name="twitter" label="Twitter" />
            <SocialItem name="linkedin" label="LinkedIn" />
            <SocialItem name="tiktok" label="TikTok" />


          </div>




          <div className="bg-redx-100 mt-8 px-2 md:px-24">

            {/* <IconButton title={"Gonder"} fn={() => null} /> */}

            <button
              type='submit'
              className={classNames(
                "bg-violet-600 hover:bg-violet-700 transition-colors",
                "flex items-center justify-center flex-nowrap space-x-2",
                "shadow-sm hover:shadow-lg rounded-md ",
                "py-2 px-8",
                "disabled:bg-violet-400 disabled:shadow-none",
                "w-full"
              )}
            >

              <HiPencil color="white" size="16px" />

              <span className="text-slate-50 text-xs font-medium tracking-wide text-center">
                Gönder
              </span>
            </button>

          </div>


        </form>


      </section>

    </PageCard>
  )
}

export default SocialForm
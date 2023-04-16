import { useRouter } from 'next/router';
import { useState } from "react";
import { HiChevronRight } from 'react-icons/hi';
import TopBarProgress from "react-topbar-progress-indicator";
import Balancer from "react-wrap-balancer";
import { AppRoutes } from "../../config/appRoutes";
import type { PollSocialFormElement, SocialType } from "../../interface/pollform.interface";
import classNames from "../../utils/classnames";
import { notifyError } from "../../utils/notifications";
import { trpc } from '../../utils/trpc';
import PageCard from "../card/Card";
import SocialItem from "./SocialItem";

const SocialForm: React.FC = () => {

  const { replace } = useRouter()
  const [busy, setBusy] = useState(false)
  const updatePartnerSocials = trpc.partner.updateSocials.useMutation()


  const onPollSubmit = (e: React.FormEvent<PollSocialFormElement>) => {
    e.preventDefault()

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

    const truthySocials = data.map(x => x.handle.trim() ? x : undefined).filter(x => x !== undefined)

    if (truthySocials.length === 0) return notifyError("En az bir sosyal platform ismi girin!")

    setBusy(true)

    updatePartnerSocials.mutate(truthySocials as SocialType[], {
      onSuccess: () => {
        replace(AppRoutes.PARTNER_DASHBOARD)
      },
      onError(error) {
        console.error(error)
        notifyError('Hata. ilgi alanları düzenlenemedi!')
        replace(AppRoutes.PARTNER_DASHBOARD)
      },
      onSettled() {
        setBusy(false)
      }
    })

  }

  return (
    <PageCard>
      {busy && <TopBarProgress />}
      <h1 className='text-xl text-center font-medium text-slate-600'>
        <Balancer>
          Seni daha iyi tanıyabilmemiz için sosyal medya platformlarındaki profilinin linkine ihtiyacımız var.
          Bu yüzden aşağıdaki bilgileri doldurmana ihtiyacımız var.
        </Balancer>
      </h1>


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

            <button
              type='submit'
              className={classNames(
                "bg-violet-600 hover:bg-violet-700 transition-colors",
                "flex items-center justify-center flex-nowrap space-x-2",
                "shadow-sm hover:shadow-lg rounded-md ",
                "py-2 px-8",
                "disabled:bg-violet-400 disabled:shadow-none",
                "w-full"
              )} >

              <HiChevronRight color="white" size="16px" />

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
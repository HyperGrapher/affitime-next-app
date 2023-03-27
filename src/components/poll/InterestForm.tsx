import { useRouter } from 'next/router';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from "react";
import { HiChevronRight } from 'react-icons/hi';
import TopBarProgress from "react-topbar-progress-indicator";
import { AppRoutes } from "../../config/appRoutes";
import { POLL_CATEGORIES } from "../../config/constants";
import type { InterestType, PollCatsFormElement } from "../../interface/pollform.interface";
import classNames from "../../utils/classnames";
import { notifyError } from "../../utils/notifications";
import { trpc } from '../../utils/trpc';
import PageCard from "../card/Card";
import InterestItem from "./InterestItem";

type Props = {
    setStep: Dispatch<SetStateAction<number>>
}

const InterestForm: React.FC<Props> = ({ setStep }) => {

    const { replace } = useRouter()
    const [busy, setBusy] = useState(false)

    const updatePartnerInterests = trpc.partner.updateInterests.useMutation()


    const onPollSubmit = (e: React.FormEvent<PollCatsFormElement>) => {
        e.preventDefault()

        const data = [
            {
                name: POLL_CATEGORIES["cat1"],
                checked: e.currentTarget.elements.cat1.checked,
            },
            {
                name: POLL_CATEGORIES["cat2"],
                checked: e.currentTarget.elements.cat2.checked,
            },
            {
                name: POLL_CATEGORIES["cat3"],
                checked: e.currentTarget.elements.cat3.checked,
            },
            {
                name: POLL_CATEGORIES["cat4"],
                checked: e.currentTarget.elements.cat4.checked,
            },
            {
                name: POLL_CATEGORIES["cat5"],
                checked: e.currentTarget.elements.cat5.checked,
            },
            {
                name: POLL_CATEGORIES["cat6"],
                checked: e.currentTarget.elements.cat6.checked,
            },
            {
                name: POLL_CATEGORIES["cat7"],
                checked: e.currentTarget.elements.cat7.checked,
            },
            {
                name: POLL_CATEGORIES["cat8"],
                checked: e.currentTarget.elements.cat8.checked,
            },
            {
                name: POLL_CATEGORIES["cat9"],
                checked: e.currentTarget.elements.cat9.checked,
            },
            {
                name: POLL_CATEGORIES["cat10"],
                checked: e.currentTarget.elements.cat10.checked,
            },

        ]

        const truthyCats = data.map(x => x.checked ? x : undefined).filter(x => x !== undefined) // Boolean

        if (truthyCats.length === 0) return notifyError("En az bir kategori seçin!")

        setBusy(true)

        updatePartnerInterests.mutate(truthyCats as InterestType[], {
            onSuccess: () => {
                setStep(1)
                setBusy(false)
            },
            onError(error) {
                console.log(error)
                setBusy(false)
                notifyError('Hata. ilgi alanları düzenlenemedi!')
                replace(AppRoutes.PARTNER_DASHBOARD)
            },
        })

    }

    return (
        <PageCard>
            {busy && <TopBarProgress />}
            <h1 className='text-xl text-center font-medium text-slate-600'>
                Takipçilerin hangi kategorilerdeki ürünlerle ilgileniyor?
                <br />
                (Birden fazla seçim yapabilirsin.)
            </h1>

            <section className="my-8">

                <form onSubmit={onPollSubmit} className="mx-auto">

                    <div className="flex flex-wrap lg:w-4/5 sm:mx-auto sm:mb-2 -mx-2">

                        <InterestItem label={POLL_CATEGORIES.cat1} cat="cat1" />
                        <InterestItem label={POLL_CATEGORIES.cat2} cat="cat2" />
                        <InterestItem label={POLL_CATEGORIES.cat3} cat="cat3" />
                        <InterestItem label={POLL_CATEGORIES.cat4} cat="cat4" />
                        <InterestItem label={POLL_CATEGORIES.cat5} cat="cat5" />
                        <InterestItem label={POLL_CATEGORIES.cat6} cat="cat6" />
                        <InterestItem label={POLL_CATEGORIES.cat7} cat="cat7" />
                        <InterestItem label={POLL_CATEGORIES.cat8} cat="cat8" />
                        <InterestItem label={POLL_CATEGORIES.cat9} cat="cat9" />
                        <InterestItem label={POLL_CATEGORIES.cat10} cat="cat10" />
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
                                Sonraki
                            </span>
                        </button>

                    </div>


                </form>


            </section>

        </PageCard>
    )
}

export default InterestForm
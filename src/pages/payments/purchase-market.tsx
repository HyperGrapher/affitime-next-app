/* eslint-disable @typescript-eslint/no-unused-vars */
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { HiArrowLeft as BackIcon } from 'react-icons/hi';
import IconButton from '../../components/buttons/IconButton';
import PageCard from '../../components/card/Card';
import ScrollToTop from '../../components/scroll-to-top/ScrollToTop';


const DynamicPaymentCardMarket = dynamic(() => import('../../components/purchase_plan/PaymentCardMarket'), {
    ssr: false,
})


const Purchase = () => {

    const { back, query } = useRouter()
    const [busy, setBusy] = useState(false)

    return (
        <div className='containerx mx-auto px-0 md:px-6 sm:px-24 mt-24 max-w-[1280px] pb-16 '>
            <Head>
                <title>Affitime | Market Ödeme Yapın</title>
            </Head>
            <PageCard>
                <div className="flex items-start px-2">


                    <div className='ml-auto scale-75 md:scale-100'>
                        <IconButton
                            title={"Geri Git"}
                            disabled={busy}
                            icon={<BackIcon color="white" size="16px" />}
                            twClasses="ml-auto w-38"
                            fn={back} />
                    </div>

                </div>
            </PageCard>

            <ScrollToTop> <DynamicPaymentCardMarket /> </ScrollToTop>

        </div>
    )
}

export default Purchase



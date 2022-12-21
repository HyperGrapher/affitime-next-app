/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
import { trpc } from '../../../utils/trpc';
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from 'next/router'
import TopBarProgress from 'react-topbar-progress-indicator';
import PageCard from '../../../components/card/Card';
import classNames from '../../../utils/classnames';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { notifyError, notifySuccessTC, notifySuccessBR } from '../../../utils/notifications';
import { useState } from 'react';
import LinkButton from "../../../components/buttons/LinkButton";
import IconButton from '../../../components/buttons/IconButton';
import { HiArrowLeft as BackIcon } from 'react-icons/hi'
import Image from "next/image";
import productImg from '../../../assets/product.png';
import { FormFieldWrapper } from '../../../components/error-messages/FormError';
import ACComboBox from '../../../components/combobox/ComboBox';
import { UserRoles } from '../../../interface/auth.interface';

export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: '/auth/signin',
            permanent: false
        }
    }
    if (session.role !== UserRoles.VENDOR) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }

    return { props: { userId: session.id } }

}


const LinkCreate: NextPage = () => {
    const [busy, setBusy] = useState(false)
    const { back, query } = useRouter()
    const id = query.pid as string
    const edit = query.edit === "true"


    // const { register, handleSubmit, setValue, formState: { errors } } = useForm<IProductFormData>({
    //     resolver: zodResolver(validationSchema),
    //     reValidateMode: 'onBlur',
    //     mode: 'onBlur',
    // });

    const createProduct = trpc.product.createProduct.useMutation()
    const { data: pd } = trpc.product.getProductById.useQuery({ id })


    return (
        <div className={'px-1'}>

            <PageCard>

                <div className="flex items-center">

                    <h2 className="font-bold text-xl text-slate-700 ml-2">
                        {edit ? "Link Düzenle" : "Affiliate Linki Oluştur"}
                    </h2>

                    <IconButton
                        title={"Geri Git"}
                        disabled={busy}
                        icon={<BackIcon color="white" size="16px" />}
                        twClasses="ml-auto w-38"
                        fn={back} />

                </div>

                <div className='mb-6 ml-2 w-1/2 sm:w-80'>
                    <p className="text-slate-400 text-sm font- leading-tight">
                        Affiliate sayfasinda davet ettiginiz kullanicilar icin bir paylasim linki olusturun.
                    </p>
                </div>

                <hr />

                <section className="mb-4">
                    <h5 className='text-slate-600 text-base mt-2 font-medium leading-tight'>Ürün</h5>
                    <div className="flex space-x-2 mt-2">
                        {pd?.image ?
                            <img
                                className="object-cover hover:shadow rounded object-center w-12 h-12 aspect-square"
                                src={pd?.image}
                                alt={pd?.title ?? ""} />
                            : <Image
                                className={classNames(
                                    "object-cover rounded hover:shadow object-center",
                                    "w-12 h-12 aspect-square",
                                    "border border-1 border-stone-300"
                                )}
                                width={"85"}
                                height={"85"}
                                src={productImg}
                                alt={"Generic Foto"} />
                        }

                        <div className=''>
                            <p className="text-sm">
                                <b className='text-neutral-400'> Başlık: </b>   {pd?.title}
                            </p>
                            <p className="text-sm">
                                <b className='text-neutral-400'> ID:</b> {pd?.id}
                            </p>
                        </div>
                    </div>
                </section>

                <hr />

                <main className='mt-4'>
                    {/* Title */}
                    <section className={classNames(
                        "bg-slate-100 hover:bg-slate-50",
                        "w-full rounded-md  py-2 px-2   ",
                        "shadow hover:shadow-md shadow-slate-300 transition-all",
                        "border hover:border-black/5 space-y-2 pb-8 "

                    )}>


                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 mb-4"
                            )}
                            htmlFor="title">
                            Affiliate kullanici secin
                        </label>


                        <ACComboBox />


                    </section>
                </main>

            </PageCard>

        </div>
    )
}

export default LinkCreate
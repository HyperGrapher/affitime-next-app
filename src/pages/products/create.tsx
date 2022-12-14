/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import type { GetServerSideProps } from "next";
import { type NextPage, NextApiRequest, InferGetServerSidePropsType } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { Product, Vendor } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from 'next/router'
import TopBarProgress from 'react-topbar-progress-indicator';
import { UserRoles } from '../../interface/auth.interface';
import PageCard from '../../components/card/Card';
import LinkButton from "../../components/link-button/LinkButton";
import { HiArrowLeft as BackIcon } from 'react-icons/hi'
import classNames from '../../utils/classnames';
import { HiPlus, HiCheck } from 'react-icons/hi'
import ErrorMessage from '../../components/error-messages/ErrorMessage';
import FormError, { FormFieldError, FormFieldWrapper } from '../../components/error-messages/FormError';
import { CommissionType } from "@prisma/client";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'
import Commissons from '../../components/products/Commissons';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';


const ptitles = [
    'NCMOTORS 2020 BAYİ AMG GT43 DESIGNO HEAD UP BURMESTR AIRMTC 360°',
    'LG 38 inch Ultrawide Monitor',
    'Fender Stratocaster 1974'
]
const pdescs = [
    'NC MOTORSTAN BAYİ ÇIKIŞLI 2020 MERCEDES AMG GT43+ 4MATIC 2024 KASIM AYINA KADAR GARANTİLİ',
    'Best LG Ultrawide screen',
    'Great Fender start from 1974 in good condition'
]
{/* {capitalizeFirstLetter(errorMsg)} */ }

{/* <FormError state={true} message="Bu alani doldurmalisiniz" /> */ }

interface IProductFormData {
    title: string;
    desc: string;
    product_url: string;
    image: string;
    price: number;
    perSale: number;
    perClick: number;
    perClickType: string;
    perSaleType: string;
}

const FormSchema = z.object({
    email: z.string().email(),
    accept: z.literal(true, {
        invalid_type_error: "You must accept Terms and Conditions.",
    }),
    tier: z
        .string({ invalid_type_error: "Please select a payment tier." })
        .refine((val) => [{ id: "BRONZE" }, { id: "SILVER" }, { id: "GOLD" }].map((item) => item.id).includes(val)),
});

// https://blog.logrocket.com/schema-validation-typescript-zod/
// https://www.austinshelby.com/blog/build-a-react-form-with-react-hook-form-and-zod
const validationSchema = z.object({
    title: z.string().trim().min(5, "En az 5 karakter olmalı!"),
    desc: z.string().trim().min(20, "Lütfen ürün hakkında açıklayıcı bilgi giriniz"),
    product_url: z.string().url("Lütfen https ile başlayan mağaza linkini giriniz!"),
    image: z.string().url("Lütfen https ile başlayan mağaza linkini giriniz!").optional().nullable(),
    price: z.number()?.positive("Pozitif bir rakam giriniz"),
    perSale: z.number()?.positive("Pozitif bir rakam giriniz"),
    perClick: z.number()?.positive("Pozitif bir rakam giriniz"),
    perClickType: z.string().optional().nullable(),
    perSaleType: z.string().optional().nullable()
}).required();



const ProductCreate: NextPage = () => {

    const [perClickType, setPerClickType] = useState<CommissionType>(CommissionType.PERC)
    const [perSaleType, setPerSaleType] = useState<CommissionType>(CommissionType.PERC)
    const { data, status } = useSession()
    const [createdProduct, setCreatedProduct] = useState<Product | undefined>()
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const createProduct = trpc.product.createProduct.useMutation()
    const { back } = useRouter()

    const { register, handleSubmit, watch, formState: { errors } } = useForm<IProductFormData>({
        resolver: zodResolver(validationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });

    const onSubmit: SubmitHandler<IProductFormData> = async (data) => {
        setBusy(true)
        data.perClickType = perClickType
        data.perSaleType = perSaleType

        const prodRes = await createProduct.mutateAsync(data)

        if (!prodRes) {
            setBusy(false)
            setError('Cannot create product')
            return
        }

        setBusy(false)
        back()
        return

        await new Promise(async (resolve) => {
            setTimeout(() => {
                console.log(data);
                resolve(undefined);
                setBusy(false)
                // back()
            }, 3000);
        });
    };



    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onCreateProduct = async (e: React.FormEvent<any>) => {
        setBusy(true)
        e.preventDefault()

        const p = {
            title: e.currentTarget?.title?.value,
            desc: e.currentTarget?.desc?.value,
            product_url: e.currentTarget?.product_url?.value,
            image: e.currentTarget?.image?.value,
            price: e.currentTarget?.price?.valueAsNumber,
        }

        const prodRes = await createProduct.mutateAsync(p)

        if (!prodRes) {
            setBusy(false)
            setError('Cannot create product')
            return
        }

        setBusy(false)
        back()
        // setCreatedProduct(prodRes)


    }

    // const handlePerClickChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    //     const val = (event.target as HTMLInputElement).value as CommissionType
    //     setPerClickType(val);
    // };


    // const handlePerSaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    //     const val = (event.target as HTMLInputElement).value as CommissionType
    //     setPerSaleType(val);
    // };


    if (status === 'loading') return <div>Loading</div>

    return (
        <div className='px-1'>
            {busy && <TopBarProgress />}

            <PageCard>

                <div className="flex items-center mb-6">

                    <h2 className="font-bold text-xl text-slate-700 ml-2">Ürün Ekle</h2>

                    <LinkButton
                        title={"Geri Git"}
                        disabled={busy}
                        href={'/products'}
                        icon={<BackIcon color="white" size="16px" />}
                        twClasses="ml-auto w-38" />

                </div>

                <main className=''>

                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)} >



                        {/* Title */}
                        <section className={classNames(
                            "bg-slate-100 hover:bg-slate-50",
                            "w-full rounded-md  py-2 px-2   ",
                            "shadow hover:shadow-md shadow-slate-300 transition-all",
                            "border hover:border-black/5 space-y-2 pb-8 "

                        )}>

                            <FormFieldWrapper>


                                <label
                                    className={classNames(
                                        "font-medium text-sm pl-2 mb-4"
                                    )}
                                    htmlFor="title">
                                    Ürün Başlığı
                                </label>

                                <input
                                    className='block w-full rounded-md border-gray-300 shadow-sm 
                                    disabled:bg-slate-200
                                      `focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    type="text"
                                    disabled={busy}
                                    placeholder='Ürün Başlığı'
                                    {...register("title", { required: true, minLength: 8 })}
                                />

                                <FormFieldError state={!!errors.title} message={errors.title?.message} />


                            </FormFieldWrapper>


                        </section>


                        {/* Desc */}
                        <section className={classNames(
                            "bg-slate-100 hover:bg-slate-50",
                            "w-full rounded-md  py-2 px-2   ",
                            "shadow hover:shadow-md shadow-slate-300 transition-all",
                            "border hover:border-black/5 space-y-2 pb-8 "

                        )}>

                            <FormFieldWrapper>


                                <label
                                    className={classNames(
                                        "font-medium text-sm pl-2 mb-4"
                                    )}
                                    htmlFor="title">
                                    Ürün Açıklaması
                                </label>

                                <input
                                    className='block w-full rounded-md border-gray-300 shadow-sm 
                                    disabled:bg-slate-200
                                      `focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    type="text"
                                    disabled={busy}
                                    placeholder='Ürün Açıklaması'
                                    {...register("desc", { required: true, minLength: 8 })}
                                />

                                <FormFieldError state={!!errors.desc} message={errors.desc?.message} />


                            </FormFieldWrapper>


                        </section>



                        {/* Price */}
                        <section className={classNames(
                            "bg-slate-100 hover:bg-slate-50",
                            "w-full rounded-md  py-2 px-2   ",
                            "shadow hover:shadow-md shadow-slate-300 transition-all",
                            "border hover:border-black/5 space-y-2 pb-8 ",

                        )}>

                            <FormFieldWrapper>

                                <label
                                    className={classNames(
                                        "font-medium text-sm pl-2 mb-4"
                                    )}
                                    htmlFor="price">
                                    Yaklaşık Ürün Fiyatı (TL)
                                </label>

                                <input
                                    className='block w-full rounded-md border-gray-300 shadow-sm 
                                    disabled:bg-slate-200
                                      `focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    type="number"
                                    defaultValue={10}
                                    min={10}
                                    disabled={busy}
                                    placeholder='Ürün Fiyatı'
                                    {...register("price", {
                                        required: true,
                                        setValueAs: (v) => v === "" ? 0 : parseInt(v, 10),
                                    })}
                                />

                                <FormFieldError state={!!errors.price} message={errors.price?.message} />


                            </FormFieldWrapper>


                        </section>



                        {/* Product Link */}
                        <section className={classNames(
                            "bg-slate-100 hover:bg-slate-50",
                            "w-full rounded-md  py-2 px-2   ",
                            "shadow hover:shadow-md shadow-slate-300 transition-all",
                            "border hover:border-black/5 space-y-2 pb-8 "

                        )}>

                            <FormFieldWrapper>


                                <label
                                    className={classNames(
                                        "font-medium text-sm pl-2 mb-4"
                                    )}
                                    htmlFor="product_url">
                                    Hedef Ürün Linki
                                </label>

                                <input
                                    className='block w-full rounded-md border-gray-300 shadow-sm 
                                    disabled:bg-slate-200
                                      `focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    type="text"
                                    disabled={busy}
                                    placeholder='https://'
                                    {...register("product_url", { required: true })}
                                />

                                <FormFieldError state={!!errors.product_url} message={errors.product_url?.message} />


                            </FormFieldWrapper>


                        </section>



                        {/* image */}
                        <section className={classNames(
                            "bg-slate-100 hover:bg-slate-50",
                            "w-full rounded-md  py-2 px-2   ",
                            "shadow hover:shadow-md shadow-slate-300 transition-all",
                            "border hover:border-black/5 space-y-2 pb-8 "

                        )}>

                            <FormFieldWrapper>


                                <label
                                    className={classNames(
                                        "font-medium text-sm pl-2 mb-4"
                                    )}
                                    htmlFor="product_url">
                                    Ürün Fotoğrafı
                                </label>

                                <input
                                    className='block w-full rounded-md border-gray-300 shadow-sm 
                                    disabled:bg-slate-200
                                      `focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    type="text"
                                    disabled={busy}
                                    placeholder='https://'
                                    {...register("image", { required: true })}
                                />

                                <FormFieldError state={!!errors.image} message={errors.image?.message} />


                            </FormFieldWrapper>


                        </section>


                        {/* Commissions */}
                        <section className={classNames(
                            "bg-slate-100 hover:bg-slate-50",
                            "w-full rounded-md  py-2 px-2   ",
                            "shadow hover:shadow-md shadow-slate-300 transition-all",
                            "border hover:border-black/5  pb-8 ",
                            "flex flex-row justify-center items-center"

                        )}>


                            <div className="flex flex-col items-center flex-1 xw-2/4 xbg-red-200">

                                <FormControl>
                                    <FormFieldWrapper>
                                        <label
                                            className={classNames(
                                                "font-medium text-sm text-center  mb-4"
                                            )}
                                            htmlFor="product_url">
                                            Tiklama Bedeli
                                        </label>

                                        <RadioGroup
                                            aria-labelledby="perClicka"
                                            className='text-xs bg-red-0'
                                            value={perClickType} >


                                            <div className="flex">
                                                <FormControlLabel
                                                    className='text-xs bg-red-0'
                                                    onChange={() => setPerClickType(CommissionType.CASH)}
                                                    value={"CASH"}
                                                    control={<Radio size="small" />}
                                                    label="Nakit" />
                                                <FormControlLabel
                                                    value={"PERC"}
                                                    onChange={() => setPerClickType(CommissionType.PERC)}
                                                    control={<Radio size="small" />}
                                                    label="Yuzde" />

                                            </div>
                                        </RadioGroup>
                                        <FormFieldError state={!!errors.perClickType} message={errors.perClickType?.message} />
                                    </FormFieldWrapper>
                                </FormControl>

                                <FormFieldWrapper>


                                    <label
                                        className={classNames(
                                            "font-medium text-sm text-center mb-4"
                                        )}
                                        htmlFor="title">
                                        Tıklama Komisyonu
                                    </label>

                                    <input
                                        className='block w-48 mx-auto rounded-md border-gray-300 shadow-sm 
                                        disabled:bg-slate-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                        type="number"
                                        disabled={busy}
                                        placeholder={perClickType === CommissionType.CASH ? "TL" : "%"}
                                        {...register("perClick", {
                                            required: true,
                                            setValueAs: (v) => v === "" ? 0 : parseInt(v, 10),
                                        })}
                                    />

                                    <FormFieldError state={!!errors.perClick} message={errors.perClick?.message} />


                                </FormFieldWrapper>

                            </div>



                            <div className="flex flex-col items-center flex-1 xw-2/4 xbg-sky-200">

                                <FormControl>
                                    <FormFieldWrapper>
                                        <label
                                            className={classNames(
                                                "font-medium text-sm text-center mb-4"
                                            )}
                                            htmlFor="product_url">
                                            Satış Bedeli
                                        </label>

                                        <RadioGroup
                                            aria-labelledby="perSalex"
                                            className='text-xs bg-red-0'
                                            value={perSaleType}>

                                            <div className="flex">
                                                <FormControlLabel
                                                    className='text-xs bg-red-0'
                                                    value={"CASH"}
                                                    onChange={() => setPerSaleType(CommissionType.CASH)}
                                                    control={<Radio size="small" />}
                                                    label="Nakit" />
                                                <FormControlLabel
                                                    value={"PERC"}
                                                    onChange={() => setPerSaleType(CommissionType.PERC)}
                                                    control={<Radio size="small" />}
                                                    label="Yuzde" />

                                            </div>
                                        </RadioGroup>
                                        <FormFieldError state={!!errors.perSaleType} message={errors.perSaleType?.message} />
                                    </FormFieldWrapper>
                                </FormControl>

                                <FormFieldWrapper>


                                    <label
                                        className={classNames(
                                            "font-medium text-sm text-center mb-4"
                                        )}
                                        htmlFor="title">
                                        Satış Komisyonu
                                    </label>

                                    <input
                                        className='block w-48 mx-auto rounded-md border-gray-300 shadow-sm 
                                        disabled:bg-slate-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                        type="number"
                                        disabled={busy}
                                        placeholder={perSaleType === CommissionType.CASH ? "TL" : "%"}
                                        {...register("perSale", {
                                            required: true,
                                            setValueAs: (v) => v === "" ? 0 : parseInt(v, 10),
                                        })}
                                    />

                                    <FormFieldError state={!!errors.perSale} message={errors.perSale?.message} />


                                </FormFieldWrapper>

                            </div>





                        </section>


                        {/* Submit */}
                        <button
                            disabled={busy}
                            type='submit'
                            className={classNames(
                                "bg-violet-600 hover:bg-violet-700 transition",
                                "flex items-center justify-center flex-nowrap space-x-2",
                                "shadow-sm hover:shadow-lg rounded-md ",
                                "py-2 px-8",
                                "disabled:bg-violet-400 disabled:shadow-none"
                            )}

                        >

                            <HiPlus color="white" size="16px" />

                            <span className="text-slate-50 text-xs font-medium tracking-wide text-center">
                                Create Product
                            </span>
                        </button>

                    </form>


                </main>

            </PageCard>

        </div>
    )
}

export default ProductCreate

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
            destination: '/dashboard',
            permanent: false
        }
    }

    return { props: { userId: session.id } }

}
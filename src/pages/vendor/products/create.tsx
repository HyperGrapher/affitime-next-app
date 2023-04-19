import { zodResolver } from '@hookform/resolvers/zod';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { CommissionType, type Category } from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiArrowLeft as BackIcon, HiPencil, HiPlus, HiRefresh as IcRefresh, HiClipboardCopy } from 'react-icons/hi';
import TopBarProgress from 'react-topbar-progress-indicator';
import { z } from 'zod';
import CategoriesCombo from '../../../components/_vendor/products/CategoriesCombo';
import IconButton from '../../../components/buttons/IconButton';
import PageCard from '../../../components/card/Card';
import { FormFieldError, FormFieldWrapper } from '../../../components/error-messages/FormError';
import { AppRoutes } from '../../../config/appRoutes';
import { UserRoles } from '../../../interface/auth.interface';
import { prisma } from "../../../server/db/client";
import classNames from '../../../utils/classnames';
import { notifyError, notifySuccessBR, notifySuccessTC } from '../../../utils/notifications';
import { trpc } from '../../../utils/trpc';
import Head from "next/head";
import { checkUserStatus } from '../../../utils/checkUserStatus';

interface IServerSideProps {
    cats: Category[]
}

export const getServerSideProps: GetServerSideProps<IServerSideProps> = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }
    if (session.role !== UserRoles.VENDOR) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }

    const check = await checkUserStatus(session)
    if (check.paymentRequired) return {
        redirect: {
            destination: `${AppRoutes.PAYWALL}?reason=${check.type}`,
            permanent: false
        }
    }


    const cats = await prisma.category.findMany()

    return { props: { cats } }

}


interface IProductFormData {
    id: string;
    title: string;
    desc: string;
    product_url: string;
    image: string;
    price: number;
    perSale: number;
    perClick: number;
    perClickType: string;
    perSaleType: string;
    category: number;
}

const validationSchema = z.object({
    id: z.string().optional().nullable(),
    title: z.string().trim().min(5, "En az 5 karakter olmalı!"),
    desc: z.string().trim().min(20, "Lütfen ürün hakkında açıklayıcı bilgi giriniz"),
    product_url: z.string().url("Lütfen https ile başlayan mağaza linkini giriniz!"),
    image: z.string().url("Lütfen https ile başlayan mağaza linkini giriniz!").optional().nullable(),
    price: z.number()?.positive("Pozitif bir rakam giriniz"),// todo .min(100),
    perSale: z.number().default(0),
    perClick: z.number().default(0),
    perClickType: z.string().optional().nullable(),
    perSaleType: z.string().optional().nullable(),
}).required();


const ProductCreate = ({ cats }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    const [perClickType, setPerClickType] = useState<CommissionType>(CommissionType.CASH)
    const [perSaleType, setPerSaleType] = useState<CommissionType>(CommissionType.PERC)
    const [selectedCat, setSelectedCat] = useState({ id: 0, name: "" })
    const [catErr, setCatErr] = useState(false)

    const [busy, setBusy] = useState(false)
    const { back, query } = useRouter()

    const id = query.pid as string
    const edit = query.edit === "true"


    useEffect(() => {

        if (selectedCat.name !== "") setCatErr(false)

    }, [selectedCat])


    const { register, handleSubmit, setValue, formState: { errors }, setError } = useForm<IProductFormData>({
        resolver: zodResolver(validationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });

    const createProduct = trpc.product.createProduct.useMutation()
    const updateProduct = trpc.product.updateProduct.useMutation()
    const updateKey = trpc.apikey.upsertApikey.useMutation()
    const { data: apikey, refetch } = trpc.apikey.getApikey.useQuery()
    trpc.product.getProductById.useQuery({ id }, {
        enabled: edit && id?.length > 20,
        onSuccess(data) {
            setValue("title", data?.title ?? "")
            setValue("desc", data?.desc ?? "")
            setValue("price", data?.price ?? 10)
            setValue("product_url", data?.product_url ?? "")
            setValue("image", data?.image ?? "")
            setValue("perClick", data?.perClick ?? 0)
            setValue("perSale", data?.perSale ?? 0)
            setValue("category", data?.categoryId ?? 0)

            const editCat = cats.filter(c => c.id === data?.categoryId)[0]
            const c = editCat ?? { id: 0, name: "" }
            setSelectedCat(c)



            const PCT = data?.perClickType as CommissionType
            const PST = data?.perSaleType as CommissionType
            setPerClickType(PCT)
            setPerSaleType(PST)

        }
    })

    const onSubmit: SubmitHandler<IProductFormData> = async (data) => {

        setBusy(true)
        data.perClickType = perClickType // ? Fix later
        data.perSaleType = perSaleType // ? Fix later

        if (data.perClick < 0) {
            setError('perClick', { message: 'Negatif rakam girilemez' })
            setBusy(false)
            return
        }

        if (data.perSale < 0) {
            setError('perSale', { message: 'Negatif rakam girilemez' })
            setBusy(false)
            return
        }


        if (selectedCat.id === 0) {
            setCatErr(true)
            setBusy(false)
            return
        }

        if (data.perClick === 0 && data.perSale === 0) {

            setError('perClick', { message: 'Komisyonlardan en az biri pozitif rakam olmalı' })
            setError('perSale', { message: 'Komisyonlardan en az biri pozitif rakam olmalı' })
            setBusy(false)
            return

        }

        data.category = selectedCat.id

        if (edit) {

            if (!id) return notifyError("Bir hata oluştu! [pid error]")
            data.id = id

            updateProduct.mutate(data, {
                onSuccess: () => {
                    notifySuccessTC("Düzenleme başarılı!", true)
                    back()
                },
                onError(error) {
                    console.error(error)
                    notifyError('Hata. Kampanya ürünü düzenlenemedi!')
                    setBusy(false)
                },
            })

        } else {

            createProduct.mutate(data, {
                onSuccess() {
                    notifySuccessBR("Kampanya ürünü eklendi!")
                    back()
                },
                onError(error) {
                    console.error(error)
                    setBusy(false)
                    notifyError('Hata. Kampanya ürünü eklenemedi!')
                },
            })

        }

    };


    return (
        <div className='auth-container' style={{ overflowX: 'hidden' }}>
            {busy && <TopBarProgress />}
            <Head>
                <title>Affitime | Ürün Oluştur</title>
            </Head>
            <PageCard>

                <div className="flex items-center mb-2">

                    <h2 className="font-bold text-base md:text-xl text-slate-700 ml-2">
                        API Anahtarı
                    </h2>

                </div>

                <div className='mb-0 ml-2 w-1/2 md:w-1/3'>
                    <p className="text-slate-400 text-sm font- leading-tight">
                        Mağaza entegrasyonu için API anahtarını yönetin.
                        <br />
                        Api anahtarinizi mağaza konsolundan eklemeniz gerekli.
                    </p>
                </div>

                <div className="flex flex-col space-y-4 mt-6 w-full">

                    <div className="flex w-1/2 md:w-2/3 font-bold">
                        <small className=''>API KEY</small>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center mb-4 w-full sm:w-2/3">
                        <small className='border-b-2 pb-1 text-xs sm:text-sm'>
                            {apikey?.apikey}
                        </small>
                        <button
                            onClick={() => {
                                updateKey.mutate(undefined, {
                                    onSuccess: () => {
                                        notifySuccessBR("Api anahtari yenilendi.")
                                        refetch()
                                    },
                                    onError(error) {
                                        console.error(error)
                                        notifyError('Hata. Apikey yenilenemedi.')
                                    },
                                })
                            }}
                            className={
                                classNames(
                                    `bg-orange-600 hover:bg-orange-700 text-white text-sm transition`,
                                    `flex items-center justify-center flex-nowrap space-x-2`,
                                    `shadow-sm hover:shadow-lg rounded-md `,
                                    `py-1 px-4 whitespace-nowrap ml-auto w-32`,
                                    `disabled:bg-orange-400 disabled:shadow-none`,
                                    `aria-disabled:bg-orange-400 aria-disabled:shadow-none`,
                                )}>

                            <IcRefresh />

                            <span className={classNames(
                                "text-slate-50 text-xs font-medium tracking-wide text-center",

                            )}> Yenile
                            </span>
                        </button>
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                const key = apikey?.apikey ?? ""
                                await navigator.clipboard.writeText(key);
                                notifySuccessBR("Api anahtari kopyalandı.")
                                console.log('Content copied to clipboard');
                            } catch (err) {
                                console.error('Failed to copy: ', err);
                            }
                        }}
                        className={
                            classNames(
                                `bg-violet-600 hover:bg-violet-700 text-white text-sm transition`,
                                `flex items-center justify-center flex-nowrap space-x-2`,
                                `shadow-sm hover:shadow-lg rounded-md `,
                                `py-1 px-4 mt-8 whitespace-nowrap w-32`,
                                `disabled:bg-violet-400 disabled:shadow-none`,
                                `aria-disabled:bg-violet-400 aria-disabled:shadow-none`,
                            )}>

                        <HiClipboardCopy />

                        <span className={classNames(
                            "text-slate-50 text-xs font-medium tracking-wide text-center",

                        )}> Kopyala
                        </span>
                    </button>

                </div>

            </PageCard>

            <PageCard>

                <div className="flex items-center mb-2">

                    <h2 className="font-bold text-base md:text-xl text-slate-700 ml-2">
                        {edit ? "Ürün Düzenle" : "Ürün Ekle"}
                    </h2>
                    <div className="whitespace-nowrap ml-auto w-38 scale-75 md:scale-100">
                        <IconButton
                            title={"Geri Git"}
                            disabled={busy}
                            icon={<BackIcon color="white" size="16px" />}
                            twClasses="ml-auto w-38"
                            fn={back} />
                    </div>
                </div>

                {edit ? null : <div className='mb-6 ml-2 w-1/2 md:w-1/3'>
                    <p className="text-slate-400 text-sm font- leading-tight">
                        Aşağıdaki formu doldurarak kampanyanı oluştur. Her ürün için
                        affiliate isteği geldiğinde bildirim alacaksın.
                    </p>
                </div>}

                {edit ? null : <hr />}


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
                                    className={classNames(
                                        'block w-full rounded-md shadow-sm sm:text-sm',
                                        'disabled:bg-slate-200 border-gray-300 transition-colors',
                                        'focus:border-indigo-500 focus:ring-indigo-500'
                                    )}
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
                                    className={classNames(
                                        'block w-full rounded-md shadow-sm sm:text-sm',
                                        'disabled:bg-slate-200 border-gray-300 transition-colors',
                                        'focus:border-indigo-500 focus:ring-indigo-500'
                                    )}
                                    type="text"
                                    disabled={busy}
                                    placeholder='Ürün Açıklaması'
                                    {...register("desc", { required: true, minLength: 8 })}
                                />

                                <FormFieldError state={!!errors.desc} message={errors.desc?.message} />


                            </FormFieldWrapper>


                        </section>

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
                                Kategori seçin
                            </label>


                            {cats && <CategoriesCombo
                                cats={cats}
                                selected={selectedCat}
                                setSelected={setSelectedCat}
                                err={catErr}
                            />}


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
                                    className={classNames(
                                        'block w-full rounded-md shadow-sm sm:text-sm',
                                        'disabled:bg-slate-200 border-gray-300 transition-colors',
                                        'focus:border-indigo-500 focus:ring-indigo-500'
                                    )}
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
                            "w-full rounded-md py-2 px-2 ",
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
                                    className={classNames(
                                        'block w-full rounded-md shadow-sm sm:text-sm',
                                        'disabled:bg-slate-200 border-gray-300 transition-colors',
                                        'focus:border-indigo-500 focus:ring-indigo-500'
                                    )}
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
                                    Ürün Görseli
                                </label>

                                <input
                                    className={classNames(
                                        'block w-full rounded-md shadow-sm sm:text-sm',
                                        'disabled:bg-slate-200 border-gray-300 transition-colors',
                                        'focus:border-indigo-500 focus:ring-indigo-500'
                                    )}
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


                            <div className="flex flex-col items-center flex-1 w-2/4 sm:w-auto xbg-red-200">

                                <FormControl>
                                    <FormFieldWrapper>
                                        <label
                                            className={classNames(
                                                "font-medium text-sm text-center  mb-4"
                                            )}
                                            htmlFor="product_url">
                                            Tıklama Bedeli
                                        </label>

                                        <RadioGroup
                                            aria-labelledby="perClicka"
                                            className='text-xs bg-red-0 scale-90 xsm:scale-100'
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
                                                    label="Yüzde" />

                                            </div>
                                        </RadioGroup>
                                        <FormFieldError state={!!errors.perClickType} message={errors.perClickType?.message} />
                                    </FormFieldWrapper>
                                </FormControl>

                                <FormFieldWrapper>


                                    <label
                                        className={classNames(
                                            "font-medium text-sm text-center mb-2 mt-4"
                                        )}
                                        htmlFor="title">
                                        Tıklama Komisyonu
                                    </label>

                                    <input
                                        className={classNames(
                                            'block w-36 sm:w-60 mx-auto rounded-md sm:text-sm',
                                            'disabled:bg-slate-200 border-gray-300 shadow-sm',
                                            'transition-colors focus:border-indigo-500 focus:ring-indigo-500 '
                                        )}
                                        type="number"
                                        defaultValue={0}
                                        disabled={busy}
                                        placeholder={perClickType === CommissionType.CASH ? "TL" : "%"}
                                        {...register("perClick", {
                                            required: true,
                                            setValueAs: (v) => v === "" ? 0 : parseInt(v, 10),
                                        })}
                                    />

                                    {/* <span className="translate-x-24 scroll-mx-0"> */}
                                    <FormFieldError state={!!errors.perClick} message={errors.perClick?.message} />
                                    {/* </span> */}

                                </FormFieldWrapper>

                            </div>



                            <div className="flex flex-col items-center flex-1 w-2/4 sm:w-auto xbg-sky-200">

                                <FormControl>
                                    <FormFieldWrapper>
                                        <label
                                            className={classNames(
                                                "font-medium text-sm text-center mb-4 "
                                            )}
                                            htmlFor="product_url">
                                            Satış Bedeli
                                        </label>

                                        <RadioGroup
                                            aria-labelledby="perSalex"
                                            className='text-xs scale-90 xsm:scale-100'
                                            value={perSaleType}>

                                            <div className="flex">
                                                <FormControlLabel
                                                    className='text-xs'
                                                    value={"CASH"}
                                                    onChange={() => setPerSaleType(CommissionType.CASH)}
                                                    control={<Radio size="small" />}
                                                    label="Nakit" />
                                                <FormControlLabel
                                                    className='text-xs'
                                                    value={"PERC"}
                                                    onChange={() => setPerSaleType(CommissionType.PERC)}
                                                    control={<Radio size="small" />}
                                                    label="Yüzde" />

                                            </div>
                                        </RadioGroup>
                                        <FormFieldError state={!!errors.perSaleType} message={errors.perSaleType?.message} />
                                    </FormFieldWrapper>
                                </FormControl>

                                <FormFieldWrapper>


                                    <label
                                        className={classNames(
                                            "font-medium text-sm text-center mb-2 mt-4"
                                        )}
                                        htmlFor="title">
                                        Satış Komisyonu
                                    </label>

                                    <input
                                        className={classNames(
                                            'block w-36 sm:w-60 mx-auto rounded-md sm:text-sm',
                                            'disabled:bg-slate-200 border-gray-300 shadow-sm',
                                            'transition-colors focus:border-indigo-500 focus:ring-indigo-500 '
                                        )}
                                        type="number"
                                        defaultValue={0}
                                        disabled={busy}
                                        placeholder={perSaleType === CommissionType.CASH ? "TL" : "%"}
                                        {...register("perSale", {
                                            required: true,
                                            setValueAs: (v) => v === "" ? 0 : parseInt(v, 10),
                                        })}
                                    />
                                    {/* <span className="translate-x-24 scroll-mx-0"> */}
                                    <FormFieldError state={!!errors.perSale} message={errors.perSale?.message} />
                                    {/* </span> */}


                                </FormFieldWrapper>

                            </div>





                        </section>


                        {/* Submit */}
                        <button
                            disabled={busy}
                            onClick={() => {
                                // console.log(selectedCat);
                                if (selectedCat.id === 0) {
                                    setCatErr(true)
                                }

                            }}
                            type='submit'
                            className={classNames(
                                "bg-violet-600 hover:bg-violet-700 transition-colors",
                                "flex items-center justify-center flex-nowrap space-x-2",
                                "shadow-sm hover:shadow-lg rounded-md ",
                                "py-2 px-8",
                                "disabled:bg-violet-400 disabled:shadow-none"
                            )}

                        >

                            {edit ? <HiPencil color="white" size="16px" /> : <HiPlus color="white" size="16px" />}

                            <span className="text-slate-50 text-xs font-medium tracking-wide text-center">
                                {edit ? "Ürünü Düzenle" : "Ürün Ekle"}
                            </span>
                        </button>

                    </form>


                </main>

            </PageCard>

        </div>
    )
}


export default ProductCreate


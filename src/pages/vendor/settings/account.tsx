import { Tab } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiPencil, HiUpload as IcUpload } from 'react-icons/hi';
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from 'zod';
import IconButton from "../../../components/buttons/IconButton";
import PageCard from "../../../components/card/Card";
import { FormFieldError, FormFieldWrapper } from '../../../components/error-messages/FormError';
import TabItem from "../../../components/tab-item/TabItem";
import { AppRoutes } from "../../../config/appRoutes";
import { UserRoles } from "../../../interface/auth.interface";
import { IpSchema } from "../../../interface/zod.schema";
import classNames from '../../../utils/classnames';
import getClientIp from "../../../utils/getClientIp";
import { notifyError, notifySuccessBR } from '../../../utils/notifications';
import { trpc } from '../../../utils/trpc';
import Image from 'next/image';
import profileImg from '../../../assets/profile.webp'
import axios from 'axios';
import useNavbarStore from '../../../store/navbar.store';
import { AVATAR_URL } from '../../../config/constants';


const Account = () => {

    const [selectedIndex, setSelectedIndex] = useState(0)



    return (
        <div className={"auth-container"}>
            <Head>
                <title>Affitime | Hesap Ayarları</title>
            </Head>

            <main className="mx-auto container min-h-screen px-2 pt-6">

                <div className="mb-2">
                    <h1 className="text-slate-600 font-bold text-2xl">
                        Hesap Ayarları
                    </h1>
                    <small className="text-slate-400 text-sm">
                        Hesabınızla ilgili bilgileri bu sayfada güncelleyebilirsiniz
                    </small>
                </div>


                <Tab.Group defaultIndex={0} selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <Tab.List className={classNames(
                        "space-x-8 "
                    )}>
                        <TabItem id="0" title="Hesap Bilgileri" selected={selectedIndex} query="0" />
                        <TabItem id="1" title="Parola Yenile" selected={selectedIndex} query="1" />
                        {/* <TabItem id="2" title="Third" selected={selectedIndex} query="2" /> */}

                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>{selectedIndex === 0 && <VendorAccountInfo />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 1 && <UpdatePassword />}</Tab.Panel>
                        {/* <Tab.Panel>{selectedIndex === 2 && <div id="3" />}</Tab.Panel> */}
                    </Tab.Panels>
                </Tab.Group>

            </main>

            <TestButtonsSection />

        </div>
    )
}

export default Account


interface IVendorAccountInfoFormData {
    email: string;
    fname: string;
    lname: string;
    brand: string;
    website: string;
    phone: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // image: any;


}
const MAX_FILE_SIZE = 100000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// const MB_BYTES = 1000000; // Number of bytes in a megabyte.
// const ACCEPTED_MIME_TYPES = ["image/gif", "image/jpeg", "image/png"];

const vendorAccountValidationSchema = z.object({
    email: z.string().trim().email("Lütfen geçerli bir email giriniz!"),
    fname: z.string().trim().min(3, "En az 3 karakter olmalı!"),
    lname: z.string().trim().min(2, "En az 2 karakter olmalı!"),
    brand: z.string().trim().min(5, "En az 5 karakter olmalı!"),
    website: z.string().trim().url("Geçerli bir adres giriniz!"),
    phone: z.string().trim().min(10, "En az 10 haneli numaranızı giriniz"),
    // image: z.string().optional()
}).required();




interface ImageUploadData {
    name: string;
    data: string;
}

const imageUploadSchema = z.object({
    name: z.string(),
    data: z.string(),
});

const VendorAccountInfo = () => {

    const [busy, setBusy] = useState(false)
    const [uploading, setUploading] = useState(false)
    // const [imgErr, setImgErr] = useState('')
    const [selectedImg, setSelectedImg] = useState("")
    const [selectedFile, setSelectedFile] = useState<File>()
    const setupdate = useNavbarStore(store => store.setupdate)

    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<IVendorAccountInfoFormData>({
        resolver: zodResolver(vendorAccountValidationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });

    const updateVendorAccount = trpc.user.updateVendorAccount.useMutation()
    trpc.user.getVendorAccount.useQuery(undefined, {
        onSuccess(data) {
            setValue("email", data?.email ?? "")
            setValue("fname", data?.fname ?? "")
            setValue("lname", data?.lname ?? "")
            setSelectedImg(data?.image ? `${AVATAR_URL}/${data?.image}`  : "")
            setValue("phone", data?.vendor?.phone ?? "")
            setValue("brand", data?.vendor?.brand ?? "")
            setValue("website", data?.vendor?.website ?? "")
        }
    })


    const handleImageUpload = async () => {
        if (!selectedFile) return notifyError('Foto seçiniz')

        setUploading(true)

        try {
            const fd = new FormData()
            fd.append('image', selectedFile)
            const { data } = await axios.post('/api/image', fd)
            localStorage.setItem("image", JSON.stringify(data.path))
            setupdate(data.path)
            notifySuccessBR('Başarıyla yüklendi')

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.log(error.response?.data);

        }

        setUploading(false)
    }


    const onSubmit: SubmitHandler<IVendorAccountInfoFormData> = async (data) => {

        // console.log(data.image);

        setBusy(true)
        updateVendorAccount.mutate(data, {
            onSuccess: () => {
                notifySuccessBR("Bilgileriniz Güncellendi!")
            },
            onError(error) {
                console.log(error)
                notifyError(error.message ?? 'Hata. Bilgileriniz Güncellenemedi!')
            },
            onSettled: () => {

                setBusy(false)
            }
        })

    }


    const convertToBase64 = async (file: File) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            return new Promise<ImageUploadData>((resolve, reject) => {
                reader.onload = () => {
                    const base64String = reader.result?.toString()?.split(',')[1]?.replace(/\s/g, '');
                    console.log({ name: file.name });

                    const imageData = {
                        name: file.name,
                        data: base64String || '',
                    };
                    try {
                        imageUploadSchema.parse(imageData);
                        resolve(imageData);
                    } catch (err) {
                        console.error(err);
                        reject(err);
                    }
                };

                reader.onerror = () => {
                    reject(reader.error);
                };
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    }


    return (
        <PageCard>
            {(busy || uploading) && <TopBarProgress />}
            <h2 className="text-center text-lg font-bold text-slate-500">Bilgilerinizi Güncelleyin</h2>

            <div className="w-64 flex flex-col gap-4 mx-auto">

                <form className='flex flex-col gap-10 my-12' onSubmit={handleSubmit(onSubmit)}>


                   {/*  <FormFieldWrapper>

                        <Image className='object-cover self-center mb-2' width={50} height={50} src={selectedImg ? selectedImg : profileImg} alt='avatar' />
                        

                        <label
                            className={classNames(
                                "font-medium text-sm w-full bg-violet-100/50",
                                'w-full h-16 flex flex-col items-center justify-center',
                                'cursor-pointer border-2 border-dashed'
                            )}
                        >
                            <IcUpload className='w-16 h-16 text-slate-500' height={42} width={42} />
                            <div>Foto Seçin</div>
                            <input
                                type='file'
                                hidden
                                onChange={({ target }) => {
                                    if (target.files) {
                                        const file = target.files[0]
                                        setSelectedFile(file)
                                        if (file) setSelectedImg(URL.createObjectURL(file))
                                        else notifyError('Foto yüklenemedi')
                                    }


                                }}

                            />
                        </label>

                        <div className={classNames(
                            "bg-violet-600 text-white ",
                            'px-4 py-1 rounded-md',
                            'flex justify-center',
                            'mt-2 cursor-pointer',
                            `${selectedFile ? "" : 'bg-violet-400'}`,
                            `${uploading ? "bg-violet-400" : 'bg-violet-600'}`

                        )}
                            onClick={handleImageUpload}
                        >Yükle</div>


                    </FormFieldWrapper> */}


                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="email">
                            Email adresiniz
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="email"
                            placeholder='Email Adresi'
                            {...register("email", { required: true })}
                        />

                        <FormFieldError state={!!errors.email} message={errors.email?.message} />

                    </FormFieldWrapper>

                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="fname">
                            Adınız
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="text"
                            placeholder='Adınız'
                            {...register("fname", { required: true })}
                        />

                        <FormFieldError state={!!errors.fname} message={errors.fname?.message} />

                    </FormFieldWrapper>

                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="lname">
                            Soyadınız
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="text"
                            placeholder='Soyadınız'
                            {...register("lname", { required: true })}
                        />

                        <FormFieldError state={!!errors.lname} message={errors.lname?.message} />

                    </FormFieldWrapper>



                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="lname">
                            Firma ismi
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="text"
                            placeholder='Firma ismi'
                            {...register("brand", { required: true })}
                        />

                        <FormFieldError state={!!errors.brand} message={errors.brand?.message} />

                    </FormFieldWrapper>


                    <FormFieldWrapper>
                        <label htmlFor="website" className={classNames(
                            "font-medium text-sm pl-2 "
                        )}>Website</label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="text"
                            placeholder='https://'
                            {...register("website", { required: true })}
                        />

                        <FormFieldError state={!!errors.website} message={errors.website?.message} />

                    </FormFieldWrapper>



                    <FormFieldWrapper>
                        <label htmlFor="phone" className={classNames(
                            "font-medium text-sm pl-2 "
                        )}>Telefon No</label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="text"
                            placeholder='5xx'
                            {...register("phone", { required: true })}
                        />

                        <FormFieldError state={!!errors.phone} message={errors.phone?.message} />

                    </FormFieldWrapper>



                    <IconButton
                        icon={<HiPencil color="white" size={"16px"} />}
                        title="Güncelle"
                        disabled={busy}
                        fn={() => null} />
                </form>



            </div>
        </PageCard>
    )
}

interface IPasswordFormData {
    oldPassword: string;
    password1: string;
    password2: string;

}

const passwordValidationSchema = z.object({
    oldPassword: z.string().trim().min(8, "En az 8 karakter olmalı!"),
    password1: z.string().trim().min(8, "En az 8 karakter olmalı!"),
    password2: z.string().trim().min(8, "En az 8 karakter olmalı!"),
}).required().superRefine(({ password1, password2 }, ctx) => {
    if (password1 !== password2) {
        ctx.addIssue({
            code: "custom",
            message: "Şifre tekrarı aynı olmalı",
            path: ['password2']
        });
    }
});

const UpdatePassword = () => {

    const [busy, setBusy] = useState(false)
    const updatePass = trpc.auth.updatePassword.useMutation()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<IPasswordFormData>({
        resolver: zodResolver(passwordValidationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });


    const onSubmit: SubmitHandler<IPasswordFormData> = async (data) => {
        setBusy(true)
        updatePass.mutate(data, {
            onSuccess: () => {
                notifySuccessBR("Bilgileriniz Güncellendi!")
            },
            onError(error) {
                console.log(error)
                notifyError(error.message ?? 'Hata. Bilgileriniz Güncellenemedi!')
            },
            onSettled: () => {
                reset()
                setBusy(false)
            }
        })

    }


    return (
        <PageCard>
            {busy && <TopBarProgress />}
            <h2 className="text-center text-lg font-bold text-slate-500">Parolanızı Güncelleyin</h2>

            <div className="w-64 flex flex-col gap-4 mx-auto">

                <form className='flex flex-col gap-10 my-12' onSubmit={handleSubmit(onSubmit)}>

                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="title">
                            Eski şifreniz
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="password"
                            placeholder='Eski şifreniz'
                            {...register("oldPassword", { required: true })}
                        />

                        <FormFieldError state={!!errors.oldPassword} message={errors.oldPassword?.message} />

                    </FormFieldWrapper>


                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="title">
                            Yeni şifreniz
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="password"
                            placeholder='Yeni şifreniz'
                            {...register("password1", { required: true })}
                        />

                        <FormFieldError state={!!errors.password1} message={errors.password1?.message} />

                    </FormFieldWrapper>


                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="title">
                            Yeni şifre tekrarı
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="password"
                            placeholder='Yeni şifrenizi tekrarlayın'
                            {...register("password2", { required: true })}
                        />

                        <FormFieldError state={!!errors.password2} message={errors.password2?.message} />

                    </FormFieldWrapper>


                    <IconButton
                        icon={<HiPencil color="white" size={"16px"} />}
                        title="Güncelle"
                        disabled={busy}
                        fn={() => null} />
                </form>



            </div>
        </PageCard>
    )
}



const TestButtonsSection = () => {

    const endTrialForTest = trpc.testing.endTrialForTest.useMutation()
    const puchaseForTest = trpc.testing.purchasePackForTest.useMutation()
    const { data: session } = useSession()
    const { replace } = useRouter()


    const payForTest = async () => {
        const ipData = await getClientIp()
        const userIp = IpSchema.parse(ipData)

        const tax = localStorage.getItem("taxinfo")

        if (!tax) return notifyError('Vergi bilgileri eksik')
        const taxInfo = JSON.parse(tax)
        type PlanType = "BASIC" | "PRO" | "ULTIMATE"
        const plan = "BASIC" as PlanType
        const annual = false

        const datam = {
            user_ip: userIp.ip,
            currency: 'TL',
            user_address: taxInfo.address,
            plan,
            annual
        }

        puchaseForTest.mutate(datam, {
            onSuccess: (data) => {
                console.log("ok", data.payment_amount);
                notifySuccessBR('Test payment OK')

                setTimeout(() => {
                    replace(AppRoutes.PAYMENT_SUCCESS)
                }, 3000);
            },
            onError(error) {
                console.log(error)
                notifyError('Ödeme sırasında bir hata oluştu!')

            },

        })
    }


    return (
        (session?.role === UserRoles.VENDOR
            && (session.email === 'wendy@email.com' || session.email === 'veronica@email.com'))
            ? <div id="testing" className="text-center flex flex-col gap-2 px-8">
                <h3 className="text-center text-red-500">Bu alan sadece wendy@email.com icin goruntulenir</h3>
                {/* <h3 className="text-center">{session.pro ? "Plan satin almis" : "Plan satin alinmamis"}</h3> */}
                {/* <h3 className="text-center">{session.trial ? "Trial surecinde veya sonlanmis" : "Plan Satin Alinmis"}</h3> */}
                <button className="text-slate-100 mt-4 py-2 px-3 rounded-md bg-slate-700 hover:bg-slate-500 transition-all duration-500"
                    onClick={() => {

                        endTrialForTest.mutate(undefined, {
                            onSuccess: () => {
                                notifySuccessBR("Trial Sonlandi!")

                                setTimeout(() => {

                                    replace(AppRoutes.VENDOR_DASHBOARD)
                                }, 1500);

                            },
                            onError(error) {
                                console.log(error)
                                notifyError(error.message ?? 'Hata. Trial Güncellenemedi!')
                            },

                        })

                    }}>
                    Trial suresini veya Plani sonlandir
                </button>


                <button
                    onClick={payForTest}
                    className="text-slate-100 mt-4 py-2 px-3 rounded-md bg-slate-700 hover:bg-slate-500 transition-all duration-500">
                    Basic plan satin al
                </button>


            </div>
            : null
    )
}


import Image from 'next/image';
import { useState } from 'react';
import { HiLogin } from 'react-icons/hi';
import Balancer from "react-wrap-balancer";
import IconButton from "../../components/buttons/IconButton";
import { notifyError, notifySuccessBR } from '../../utils/notifications';
import { trpc } from "../../utils/trpc";
import Head from "next/head";


const NotVerified = () => {

    const [busy, setBusy] = useState(false)
    const [sent, setSent] = useState(false)
    const [mail, setMail] = useState('')

    const { mutate: reset } = trpc.auth.sendResetPasswordEmail.useMutation()


    function resetPassword() {

        if (!mail || !mail.includes('@')) return notifyError('Geçerli bir E-posta adresi girin!')
        setBusy(true)
        reset({ email: mail }, {

            onSuccess() {
                notifySuccessBR('E-posta adresine yenileme linki gönderildi')
                setSent(true)
            },
            onError(error, variables, context) {
                notifyError(error.message)
            },
            onSettled() {
                setBusy(false)
            }
        }

        )
    }

    return (
        <div className='grid justify-center h-screenx bg-slate-100'>
            <Head>
                <title>Affitime | Şifremi unuttum</title>
            </Head>

            <div className="px-4 bg-white rounded-xl mt-8 max-w-lg w-[400px] py-6 shadow-md border">

                <div className="mx-auto">
                    <Image
                        className='h-8 w-auto mx-auto my-3'
                        src="/logo-sm.png"
                        alt='Affitime Logo'
                        width={220}
                        height={60}
                    />
                </div>
                <h3 className='font-bold text-xl text-slate-500 text-center mb-4'>
                    {sent ? "E-posta Gönderildi" : "Şifrenizi Yenileyin"}
                </h3>

                <div className="my-4 space-y-4">

                    {!sent && (<>


                        <div className="">
                            <label htmlFor="email" className="leading-7 text-sm font-bold text-gray-400">Kayıtlı E-posta adresi</label>

                            <input
                                className='disabled:bg-slate-200 block w-full 
                                        rounded-md border-gray-300 shadow-sm 
                                      focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                disabled={busy}
                                value={mail}
                                onChange={(e) => setMail(e.target.value)}
                                type="email"
                                placeholder='E-posta'
                            />


                        </div>

                        <IconButton
                            icon={<HiLogin color="white" size={"16px"} />}
                            title="Şifre Yenileme"
                            twClasses='w-full mx-auto'
                            fn={() => resetPassword()} />
                    </>)



                    }
                </div>


                <p className='text-base text-center'>
                    <Balancer>
                        Kayıtlı E-posta adresinize gönderilecek linke tıklayarak
                        şifrenizi yenileyin.
                    </Balancer>
                </p>
            </div>

        </div>
    )
}

export default NotVerified


/* 
export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { emailVerified: true }
    });

    if (user?.emailVerified) {

        return {
            redirect: {
                destination: `/${session.role.toLowerCase()}/dashboard`,
                permanent: false
            }
        }

    }

    return { props: {} }
}

*/
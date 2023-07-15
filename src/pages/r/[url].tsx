/* eslint-disable react-hooks/exhaustive-deps */
import { Ipware } from '@fullerstack/nax-ipware';
import type { UserIps } from "@prisma/client";
import Cookies from 'cookies';
import isbot from 'isbot';
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import userAgentLib from "useragent";
import { COOKIE_SIGN_KEY } from "../../config/constants";
import { UserRoles } from "../../interface/auth.interface";
import type { ILVCookie } from "../../interface/zod.schema";
import { IpSchema } from "../../interface/zod.schema";
import { prisma } from "../../server/db/client";
import getClientIp from "../../utils/getClientIp";
import { trpc } from '../../utils/trpc';
import axios from 'axios';
import getParsedClientIp from '../../utils/request-client-ip';

/*
twitter: '199.16.157.183' -> bot: true
twitter: '34.82.121.157' -> bot: false postladiktan sonra
twitter '34.82.121.157' ipsi ile farkli cihazlarla ve browserlarla req yapiyor
*/

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context)
    const cookies = new Cookies(context.req, context.res, { keys: [COOKIE_SIGN_KEY] })
    const ipware = new Ipware();
    const ipwareObj = ipware.getClientIP(context.req)
    const agentObj = userAgentLib.parse(context.req.headers['user-agent']);
    const url = context.params?.url as string
    const query = context.query
    const lastVisitCk = cookies.get('lv', { signed: true })
    const cookie = lastVisitCk ? JSON.parse(lastVisitCk) as ILVCookie : undefined
    const daysToExpire = 60
    const cookieOpts = {
        signed: true,
        expires: new Date(Date.now() + (daysToExpire * 24 * 60 * 60 * 1000))
    }
    const ckData: ILVCookie = { dt: new Date().toISOString(), c: cookie ? cookie.c + 1 : 1, previp: ipwareObj?.ip }
    cookies.set('lv', JSON.stringify(ckData), cookieOpts)
    const xForwardedFor = context.req.headers['x-forwarded-for']
    const referer = context.req.headers['referer']
    const osRegexArray = agentObj.source.match(/(?<=\().*?(?=;)/)
    context.res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=6000')

    const link = await prisma.link.findFirst({
        where: { url },
        include: {
            product: true,
            vendor: {
                include: {
                    apiKey: true,
                    user: true
                }
            }
        }
    });

    if (link?.vendor.user.trial === false && link?.vendor.user.pro === false) {

        // user plan is ended
        if (link?.vendor.user.validTill) {

            if (link.product.product_url) {

                // TODO magaza pluginlerinin tamamlanmasi gerekli
                // await axios.post(`${link.product.product_url}?err=true&msg=eop`)
            }

            // send error "Kullanim suresi sona erdi"
        } else {
            //  user trial ended
            if (link?.product.product_url) {

                // TODO magaza pluginlerinin tamamlanmasi gerekli
                // await axios.post(`${link.product.product_url}?err=true&msg=eot`)
            }

            // send error "Deneme suresi sona erdi"

        }

        return {
            redirect: {
                destination: `/r/not-found/${url}?trial=${link?.vendor.user.trial.valueOf()}&pro=${link?.vendor.user.pro.valueOf()}&err=100`, permanent: false
            }
        }


    }

    if (!link) return { redirect: { destination: `/r/not-found/${url}?err=105-no-link`, permanent: false } }

    if (!link.vendor.apiKey?.installed) {



        return { redirect: { destination: `/r/not-found/${url}&err=112-no-install`, permanent: false } }
    }
    if (!link.active) {


        return { redirect: { destination: `/r/not-found/${url}?err=118-not-active`, permanent: false } }

    }

    const prevUserIp = await prisma.userIps.findFirst({ where: { ip: ipwareObj?.ip === '::1' ? "176.33.101.203" : ipwareObj?.ip }, })

    const checkFraudAndUniqness = (): {
        unique: boolean, ipData: UserIps | null,
        dubious: boolean, cause: string | null
    } => {

        if (isbot(agentObj.source)) return {
            unique: false, ipData: prevUserIp, dubious: true,
            cause: `bot`
        }

        if (context.req.headers['user-agent'] === undefined) return {
            unique: false, ipData: prevUserIp, dubious: true,
            cause: `bot`
        }


        if (session) {

            if (session.role === UserRoles.ADMIN) return { unique: false, ipData: prevUserIp, dubious: true, cause: 'bot' }

            return {
                unique: false, ipData: prevUserIp, dubious: true,
                cause: `${session.role === UserRoles.PARTNER ? "partner" : "vendor"}`
            }

        }

        if (prevUserIp) return {
            unique: false, ipData: prevUserIp, dubious: true,
            cause: `${prevUserIp.partner_id ? "partner" : "vendor"}`
        }


        if (!!cookie) return { unique: false, ipData: null, dubious: false, cause: null }
        return { unique: true, ipData: prevUserIp, dubious: false, cause: null }
    }

    const visitData = {
        unique: checkFraudAndUniqness().unique,
        dubious: checkFraudAndUniqness().dubious,
        cause: checkFraudAndUniqness().cause,
        isPartner: checkFraudAndUniqness().ipData?.partner_id ? true : null,
        isVendor: checkFraudAndUniqness().ipData?.vendor_id ? true : null,
        params: JSON.stringify(query),
        bot: isbot(agentObj.source),
        link_id: link.id,
        vendor_id: link.vendor_id,
        partner_id: link.partner_id,
        productId: link.product_id,
        price: link.price,
        perClickType: link.perClickType,
        perSaleType: link.perSaleType,
        perSale: link.perSale,
        perClick: link.perClick,
        ipware: ipwareObj?.ip,
        hasCookie: !!cookie,
        cookie: !!cookie ? cookie : undefined,
        prevIp: cookie?.previp,
        vpn: false,
        os: osRegexArray ? osRegexArray[0] : null,
        agent: agentObj.source,
        uaFamily: agentObj.family,
        uaMajor: agentObj.major,
        referer: referer ?? (query.referer as string ?? null),
    }
    const visit = await prisma.visit.create({ data: visitData })

    prisma.$disconnect()

    return {
        props: {
            visitId: visit.id,
            product_url: link.product.product_url,
            image: link.product.image,
            desc: link.product.desc,
            title: link.product.title,
            isBot: isbot(agentObj.source),
        }
    }

}

const AffiProduct: NextPage = ({
    visitId,
    image,
    desc,
    title,
    product_url,
    isBot,

}: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    const updateVisit = trpc.visit.updateVisit.useMutation()

    const setUserIp = async () => {
        const ipData = await getParsedClientIp()

        updateVisit.mutate(
            {
                visitId,
                ipInfo: ipData
            },
            {
                onSuccess: async () => {
                    window.location.href = product_url;
                },

                onSettled: () => {
                    console.log('settled');

                }
            })

    }

    useEffect(() => { setUserIp() }, [])


    return (
        <div className="">
            <Head>
                <title>{title}</title>
                <meta name="description" content={desc} />

                <meta property="og:url" content="https://affitime.com" />
                <meta property="og:site_name" content="affitime" />
                <meta property="og:locale" content="tr_TR" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={desc} />
                <meta property="og:image" content={image} />
                <meta property="og:image:type" content="image/png" />


                <meta name="twitter:card" content="summary_large_image" />
                <meta property="twitter:domain" content="affitime.com" />
                <meta property="twitter:url" content="https://affitime.com" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={desc} />
                <meta name="twitter:image" content={image} />

            </Head>

            <section className="text-gray-600 body-font">
                <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
                    <img className="lg:w-2/6 md:w-3/6 w-5/6 mb-10 object-cover object-center rounded" alt="hero" src={image} />
                    <div className="text-center lg:w-2/3 w-full">
                        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">{title}</h1>
                        <p className="mb-8 leading-relaxed">{desc}</p>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default AffiProduct


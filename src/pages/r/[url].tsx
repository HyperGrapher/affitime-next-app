/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Ipware } from '@fullerstack/nax-ipware';
import type { UserIps } from "@prisma/client";
import Cookies from 'cookies';
import isbot from 'isbot';
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import userAgentLib from "useragent";
import { COOKIE_SIGN_KEY } from "../../config/constants";
import { UserRoles } from "../../interface/auth.interface";
import type { ILVCookie } from "../../interface/zod.schema";
import { IpSchema } from "../../interface/zod.schema";
import { prisma } from "../../server/db/client";
import getClientIp from "../../utils/getClientIp";
// https://github.com/omrilotan/isbot
// import { BlockList } from "net"
// https://www.npmjs.com/package/request-info
// https://www.npmjs.com/package/keygrip for checking .sig cookie value

/*
http://affitime.com/r/ULGhrzxx
http://affiti.me/r/ULGhrzxx
http://affiti.me/r/RaDExlWe
* if session exist DUBIOUS - vendor veya partner visit as cause
me: '176.33.101.203'
twitter: '199.16.157.183' -> bot: true
twitter: '176.33.101.203' -> bot: false
twitter: '34.82.121.157' -> bot: false postladiktan sonra
twitter '34.82.121.157' ipsi ile farkli cihazlarla ve browserlarla req yapiyor bot false

*/

export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)
    const cookies = new Cookies(context.req, context.res, { keys: [COOKIE_SIGN_KEY] })
    const ipware = new Ipware();
    const ipwareObj = ipware.getClientIP(context.req)
    const agentObj = userAgentLib.parse(context.req.headers['user-agent']);
    const url = context.params?.url as string
    const query = context.query

    // Get a cookie
    const lastVisitCk = cookies.get('lv', { signed: true })
    const cook = lastVisitCk ? JSON.parse(lastVisitCk) as ILVCookie : undefined

    const daysToExpire = 60
    const cookieOpts = {
        signed: true,
        expires: new Date(Date.now() + (daysToExpire * 24 * 60 * 60 * 1000))
    }
    // ? Maybe jwt ?
    const ckData: ILVCookie = { dt: new Date().toISOString(), c: cook ? cook.c + 1 : 1, previp: ipwareObj?.ip }
    cookies.set('lv', JSON.stringify(ckData), cookieOpts)

    // if the server is behind a proxy
    const xForwardedFor = context.req.headers['x-forwarded-for']
    const referer = context.req.headers['referer']
    console.log({ xForwardedFor });
    console.log({ referer });

    const osRegexArray = agentObj.source.match(/(?<=\().*?(?=;)/)
    context.res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=6000')

    const link = await prisma.link.findFirst({
        where: { url }, include: { product: true }
    });

    // Redirects
    if (!link) return { redirect: { destination: `/r/not-found/${url}`, permanent: false } }
    if (!link.active) return { redirect: { destination: `/r/not-found/${url}`, permanent: false } }

    const prevUserIp = await prisma.userIps.findFirst({ where: { ip: ipwareObj?.ip === '::1' ? "176.33.101.203" : ipwareObj?.ip }, })

    const checkFraudAndUniqness = (): {
        isUnique: boolean, ipData: UserIps | null,
        dubious: boolean, dubiousCause: string | null
    } => {

        if (isbot(agentObj.source)) {


            return {
                isUnique: false, ipData: prevUserIp, dubious: true,
                dubiousCause: `bot`
            }

        }


        if (context.req.headers['user-agent'] === undefined) {


            return {
                isUnique: false, ipData: prevUserIp, dubious: true,
                dubiousCause: `bot`
            }

        }

        if (session) {


            return {
                isUnique: false, ipData: prevUserIp, dubious: true,
                dubiousCause: `${session.role === "PARTNER" ? "partner" : "vendor"}`
            }

        }


        if (prevUserIp) {


            return {
                isUnique: false, ipData: prevUserIp, dubious: true,
                dubiousCause: `${prevUserIp.partner_id ? "partner" : "vendor"}`
            }

        }

        if (!!cook) return { isUnique: false, ipData: null, dubious: false, dubiousCause: null }
        return { isUnique: true, ipData: prevUserIp, dubious: false, dubiousCause: null }
    }

    const visitData = {
        link_id: link.id,
        ipwareIp: ipwareObj?.ip,
        hasCookie: !!cook,
        cookieInfo: !!cook ? cook : undefined,
        lastVisit: cook?.dt,
        prevIp: cook?.previp,
        isVpn: false,
        isUnique: checkFraudAndUniqness().isUnique,
        params: JSON.stringify(query),
        dubious: checkFraudAndUniqness().dubious,
        dubiousCause: checkFraudAndUniqness().dubiousCause,
        isPartner: checkFraudAndUniqness().ipData?.partner_id ? true : null,
        isVendor: checkFraudAndUniqness().ipData?.vendor_id ? true : null,
        os: osRegexArray ? osRegexArray[0] : null,
        userAgent: agentObj.source,
        isAgentBot: isbot(agentObj.source),
        ua_family: agentObj.family,
        ua_major: agentObj.major,
    }
    const visit = await prisma.visit.create({ data: visitData })
    const visitId = visit.id
    console.log(visit);

    const getPartnerVisitCount = (): number => {
        let result = link.partnerVisitCount
        
        if (session && session.role == UserRoles.PARTNER) {
            console.log("\n PARTNER CLICK \n");
            
            return result = result + 1
        }
        if (prevUserIp?.partner_id ) {
            console.log("\n partner_id CLICK \n", prevUserIp?.partner_id );
            return result = result + 1
        }
        return result
    }

    // const linkPartnerId = link.partner_id

    await prisma.link.update({
        where: {
            id: link.id
        },
        data: {
            count: link.count + 1,
            partnerVisitCount: getPartnerVisitCount(),
            repeated: (!checkFraudAndUniqness().dubious && cook) ? link.repeated + 1 : link.repeated,
            declined: checkFraudAndUniqness().dubious ? link.declined + 1 : link.declined,

        }

    });

    prisma.$disconnect()

    return {
        props: {
            visitId,
            url,
            query,
            product_url: link.product.product_url,
            image: link.product.image,
            desc: link.product.desc,
            title: link.product.title,
            valid: !!!session, // ! check
            ipInfo: ipwareObj,
            lastVisitCk: lastVisitCk ? lastVisitCk : null,
            isBot: isbot(agentObj.source)
        }
    }

}
// * server'a atilacak

const AffiProduct: NextPage = ({
    visitId,
    image,
    desc,
    title,
    product_url,
    lastVisitCk,
    query,
    isBot,
    
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    // ? if isBot dont redirect and get the list of last 100 product page link from serverSideProps

    const [done, setDone] = useState(false)
    const [sch, setSch] = useState<unknown>({})

    const setUserIp = async () => {
        const userIp = await getClientIp()
        const ipData = IpSchema.parse(userIp)
        setSch(ipData)
        return
    }

    useEffect(() => { setUserIp() }, [])
    useEffect(() => {
        if (done) console.log('DONE, Navigate'); // window.location.href = product_url;
    }, [done])

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
                <meta
                    property="og:description"
                    content={desc}
                />
                <meta property="og:image" content={image} />
                <meta property="og:image:type" content="image/png" />


                <meta name="twitter:card" content="summary_large_image" />
                <meta property="twitter:domain" content="affitime.com" />
                <meta property="twitter:url" content="https://affitime.com" />
                <meta name="twitter:title" content={title} />
                <meta
                    name="twitter:description"
                    content={desc}
                />

                <meta name="twitter:image" content={image} />

            </Head>

            <section className="text-gray-600 body-font">
                <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
                    <img className="lg:w-2/6 md:w-3/6 w-5/6 mb-10 object-cover object-center rounded" alt="hero" src={image} />
                    <div className="text-center lg:w-2/3 w-full">
                        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">{title}</h1>
                        <p className="mb-8 leading-relaxed">{desc}</p>

                        {/* <div className="flex justify-center">
                            <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Sayfa</button>
                            <button className="ml-4 inline-flex text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg">Button</button>
                        </div> */}
                    </div>
                </div>
            </section>

            <div className="px-8 pb-16">

                <b>query: </b>

                <pre className="mt-8 pb-8">
                    {JSON.stringify(query, null, 4)}
                </pre>


                <br />
                <b>Cookie: </b>
                <p>{lastVisitCk}</p>


                <br />
                <b>visitId: </b>
                <p>{visitId}</p>

                <br />

                <pre className="mt-8 pb-8">
                    {JSON.stringify(sch, null, 4)}
                </pre>


                <b className="mt-8 ">visitData</b>
                {/* <pre className="pb-8">
                    {JSON.stringify(visitData, null, 4)}
                </pre> */}

            </div>

        </div>
    )
}

export default AffiProduct


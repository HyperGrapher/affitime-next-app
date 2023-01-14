/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { type NextPage } from "next";
import Head from "next/head";
// import { trpc } from "../../utils/trpc";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession } from "next-auth/react";
// import { useRouter } from "next/router";
import { prisma } from "../../server/db/client";
import { UserRoles } from "../../interface/auth.interface";
import { useEffect, useState } from "react";
import userAgentLib from "useragent";
import Cookies from 'cookies'
import { Ipware } from '@fullerstack/nax-ipware';
import { COOKIE_SIGN_KEY } from "../../config/constants";
import isbot from 'isbot'
import getClientIp from "../../utils/getClientIp";
import { IpSchema } from "../../interface/zod.schema";
import type { Visit } from "@prisma/client";
// https://github.com/omrilotan/isbot
// import { BlockList } from "net"

/*
- if session exist DUBIOUS

*/

export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)
    const cookies = new Cookies(context.req, context.res, { keys: [COOKIE_SIGN_KEY] })
    const ipware = new Ipware();
    const ipInfo = ipware.getClientIP(context.req)
    const agent = userAgentLib.parse(context.req.headers['user-agent']);
    const ua = userAgentLib.is(context.req.headers['user-agent'])

    const url = context.params?.url as string
    const query = context.query
    const locale = context.locale
    const headers = context.req.headers
    // const vp = context.params
    console.log("headers");
    console.log(headers);
    console.log(locale);
    console.log("agent");
    console.log(agent);
    console.log("context.req.headers['user-agent']: ", context.req.headers['user-agent']);
    console.log("ua");
    console.log(ua);

    console.log("is bot: ", isbot(context.req.headers['user-agent'] ?? "no data"));

    const visitData: Partial<Visit> = {
        link_id: "",
        visiterIp: null,
        country: "",
        ipInfo: null,
        ipwareIp: null,
        ipwareIsPublic: null,
        ipwareIsRouteTrusted: null,
        hasCookie: false,
        cookieInfo: null,
        lastVisit: null,
        prevIp: null,
        isVpn: false,
        isUnique: false,
        params: null,
        dubious: null,
        dubiousCause: null,
        partnerVisit: null,
        vendorVisit: null,
        paid: null,
        os: null,
        device: null,
        userAgent: null,
        isAgentBot: null,
        ua_family: null,
        ua_major: null,
    }

    if (isbot(context.req.headers['user-agent'] ?? "")) {
        const isDoub = true
        const reason = "Crawler veya bot"
    }


    const csrfCk = cookies.get('next-auth.csrf-token')
    const sessCk = cookies.get('next-auth.session-token')

    // Get a cookie
    const lastVisitCk = cookies.get('lv', { signed: true })

    const daysToExpire = 60
    const cookieOpts = {
        signed: true,
        expires: new Date(Date.now() + (daysToExpire * 24 * 60 * 60 * 1000))
    }
    // https://www.npmjs.com/package/keygrip for checking .sig cookie value
    const ckData = {
        dt: new Date().toISOString(),
        c: lastVisitCk ? Number(JSON.parse(lastVisitCk).c) + 1 : 1,
        previp: ipInfo?.ip
    }
    // Set the cookie to a value
    cookies.set('lv', JSON.stringify(ckData), cookieOpts)

    // 2023-01-09T19:46:31.613Z
    if (!lastVisitCk) {
        console.log('No LastVisit');

    } else {
        console.log("lastVisitCk")
        console.log(lastVisitCk)
    }

    console.log("\n");
    console.log(ipInfo);
    let visterIp = ""

    if (context.req.socket.remoteAddress === '::1') {
        visterIp = 'localhost'
    }

    // if the server is behind a proxy
    const xForwardedFor = context.req.headers['x-forwarded-for']
    const referer = context.req.headers['referer']
    const connection = context.req.headers['connection']
    let osPlatform = context.req.headers['sec-ch-ua-platform']
    console.log({ xForwardedFor });
    console.log({ connection });
    console.log({ referer });


    const userAgent = agent.source
    const us_family = agent.family
    const us_major = agent.major
    console.log(osPlatform?.toString());
    if (osPlatform === undefined) osPlatform = userAgent.includes('Windows NT') ? "Windows" : undefined
    console.log({ osPlatform });

    // This value is considered fresh for ten seconds (s-maxage=10).
    // If a request is repeated within the next 10 seconds, the previously
    // cached value will still be fresh. If the request is repeated before 59 seconds,
    // the cached value will be stale but still render (stale-while-revalidate=59).
    //
    // In the background, a revalidation request will be made to populate the cache
    // with a fresh value. If you refresh the page, you will see the new value.


    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=600, stale-while-revalidate=6000'
    )


    // if (session) return {
    //     redirect: {
    //         destination: AppRoutes.SIGNIN,
    //         permanent: false
    //     }
    // }

    const link = await prisma.link.findFirst({
        where: {
            url
        },
        select: {
            id: true,
            url: true,
            vendor_id: true,
            partner_id: true,
            partner: true,
            count: true,
            declined: true,
            visits: false,
            active: true,
            platform: true,
            repeated: true,
            confirmed: true,
            partnerVisitCount: true,
            product: {
                select: {
                    image: true,
                    product_url: true,
                    desc: true,
                    title: true,
                    cookieLife: true,
                }
            }


        }

    });

    if (!link) return {
        redirect: {
            destination: `/r/not-found/${url}`,
            permanent: false
        }
    }


    if (!link.active) return {
        redirect: {
            destination: `/r/not-found/${url}`,
            permanent: false
        }
    }

    const getPartnerVisitCount = (): number => {
        // console.log("partId", link);
        let result = link.partnerVisitCount

        if (session && session.role == UserRoles.PARTNER) {
            result = result + 1

        }

        return result
    }

    // const visit = await prisma.visit.findMany({
    //     where: {
    //         link: {
    //             product_id: "assa"
    //         }
    //     }
    // })

    // const ll = await prisma.link.findMany({
    //     where: {

    //     }
    // })

    const linkPartnerId = link.partner_id

    /* 
        const linkUp = await prisma.link.update({
            where: {
                id: link.id
            },
            data: {
                count: session ? link.count : link.count + 1,
                partnerVisitCount: getPartnerVisitCount()
            }
    
        });
    
        const visit = await prisma.visit.create({
            data: {
                link_id: link.id
            }
        })
    
        prisma.$disconnect()
    
         */
    return {
        props: {
            url,
            query,
            product_url: link.product.product_url,
            image: link.product.image,
            desc: link.product.desc,
            title: link.product.title,
            valid: !!!session, // ! check
            ipInfo,
            lastVisitCk: lastVisitCk ? lastVisitCk : null,
            visterIp,
            visitData,
        }
    }

}
// * server'a atilacak

const AffiProduct: NextPage = ({ 
    url, 
    image, 
    desc, 
    title, 
    valid, 
    product_url, 
    ipInfo, 
    lastVisitCk,
    visterIp,
    query
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {

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
        if (done) console.log('DONE, Navigate');

        // window.location.href = product_url;

    }, [done])

    return (
        <div className="">
            <Head>
                <title>{title}</title>
                <link rel="icon" href={" // afffitime ico //"} />
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

                <b>socket.remoteAddress: </b>
                <p>{visterIp}</p>

                <br />

                <pre className="mt-8 pb-8">
                    {JSON.stringify(sch, null, 4)}
                </pre>


                <b className="mt-8 ">IpWare</b>
                <pre className="pb-8">
                    {JSON.stringify(ipInfo, null, 4)}
                </pre>

            </div>

        </div>
    )
}

export default AffiProduct


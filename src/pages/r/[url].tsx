/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { InferGetServerSidePropsType, type NextPage } from "next";
import Head from "next/head";
import { trpc } from "../../utils/trpc";
import type { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { prisma } from "../../server/db/client";
import { UserRoles } from "../../interface/auth.interface";
import { useEffect, useState } from "react";




export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    const url = context.params?.url as string
    const query = context.query

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
    //         destination: '/auth/signin',
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

    // const getPartnerVisitCount = () => {
    //     console.log("partId", link);
    //     let result

    //     if (session && session.role == UserRoles.PARTNER) {
    //         result = link.partnerVisitCount + 1

    //     }

    //     return result
    // }

    const linkPartnerId = link.partner_id

    // const linkUp = await prisma.link.update({
    //     where: {
    //         id: link.id
    //     },
    //     data: {
    //         count: session ? link.count : link.count + 1,
    //         partnerVisitCount: (session && session.partnerId === linkPartnerId)
    //             ? link.partnerVisitCount + 1
    //             : link.partnerVisitCount,
    //     }

    // });

    // const visit = await prisma.visit.create({
    //     data: {
    //         link_id: link.id
    //     }
    // })

    prisma.$disconnect()

    return {
        props: {
            url,
            query,
            product_url: link.product.product_url,
            image: link.product.image,
            desc: link.product.desc,
            title: link.product.title,
            valid: !!!session // ! check 
        }
    }

}


const AffiProduct: NextPage = ({ url, image, desc, title, valid, query, product_url }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    const [done, setDone] = useState(false)

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


        </div>
    )
}

export default AffiProduct


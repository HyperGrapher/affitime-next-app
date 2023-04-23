import { LinkStatus, type Link, type Product } from '@prisma/client'
import Image from "next/image"
import NextLink from 'next/link'
import React from 'react'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'
import productImg from '../../assets/product.png'
import { AppRoutes } from '../../config/appRoutes'
import classNames from '../../utils/classnames'


type Props = {
    links: (Link & {
        product: Product
    })[],
    setModal: () => void,
}

const PartnerLinksModal: React.FC<Props> = ({ links, setModal }) => {
    return (
        <section
            className={classNames(
                "bg-white shadow-2xl rounded-xl",
                "flex flex-col items-center ",
                "px-12 py-8 w-full sm:w-3/5",
                "min-w-full overflow-y-scroll"
            )}>


            <h4 className="text-xl font-semibold mb-5 text-center whitespace-nowrap">
                Partner Linkleri
            </h4>

            <div className="space-y-2">
                {links.map(link => (
                    <main
                        key={link.id}
                        className={classNames(
                            "border hover:border-black/5 w-full",
                            "py-2 px-2 bg-slate-100 hover:bg-slate-50 rounded-md",
                            "shadow hover:shadow-md transition-all shadow-slate-300",
                            "md:min-w-[400px]"
                        )} >

                        <NextLink
                            href={`${AppRoutes.VENDOR_LINK_DETAIL}/${link.id}`}
                            className="flex gap-4 items-center justify-between">

                            <div className="flex items-center space-x-2">
                                <div
                                    className="aspect-square  w-8 h-8 "
                                >
                                    {link.product.image ?
                                        <img
                                            className="object-cover hover:shadow rounded object-center w-8 h-8 aspect-square"
                                            src={link.product.image ?? ""}
                                            alt={link.id} />
                                        : <Image
                                            className={classNames(
                                                "object-cover rounded hover:shadow object-center",
                                                "w-8 h-8 aspect-square",
                                                "border border-1 border-stone-300"
                                            )}
                                            width={"32"}
                                            height={"32"}
                                            src={productImg}
                                            alt={"Generic Foto"} />
                                    }
                                </div>

                                <div

                                    className='text-xs md:text-sm font-medium text-left whitespace-nowrap text-blue-700'>
                                    {link.product.title && link.product.title.length > 18 ? link.product.title.substring(0, 18) + " ..." : link.product.title}
                                </div>
                            </div>


                            {/* STATUS */}
                            <div
                                title={link.active
                                    ? "Onaylandi"
                                    : "İptal edildi"
                                }
                                className="text-center gap-1 flex flex-col items-center min-w-[8ch]">

                                <b className={`${link.active ? "text-green-500" : "text-red-400"} text-xs font-bold whitespace-nowrap`}>
                                    {link.active
                                        ? <HiCheckCircle size={"1.25rem"} color="text-green-500" />
                                        : <HiXCircle size={"1.25rem"} color="text-red-400" />}
                                </b>

                                <b className="text-xs font-bold whitespace-nowrap">

                                    {link.status === LinkStatus.AWAITING && "Onay Bekliyor"}
                                    {link.status === LinkStatus.REQUEST_DENIED && "Onaylanmadı"}
                                    {link.status === LinkStatus.CANCELED_BY_VENDOR && "İptal Edilidi"}
                                    {link.status === LinkStatus.PRODUCT_DELETED && "Ürün Silindi"}
                                    {link.status === LinkStatus.CONFIRMED && "Onaylandı"}
                                    {link.status === LinkStatus.PAUSED_BY_VENDOR && "Duraklatıldı"}
                                </b>

                            </div>

                        </NextLink>


                    </main>
                ))}
            </div>

            <button
                onClick={() => setModal()}
                className={classNames(
                    "bg-violet-600 hover:bg-violet-700 transition",
                    "w-full sm:w-36 md:w-40",
                    "shadow-sm hover:shadow-lg rounded-md",
                    "py-2 px-8 mt-8",
                    "text-white font-medium text-sm",
                    "disabled:bg-violet-400 disabled:shadow-none",
                    "aria-disabled:bg-violet-400 aria-disabled:shadow-none",
                )}>
                Kapat
            </button>

        </section>
    )
}

export default PartnerLinksModal

const xx = [{
    "id": "clgji9oom0007cqd0q6142gm2",
    "product_id": "clgjethms001dcqk4e3d166a1",
    "partner_id": "clgjeth120002cqk43nx98vmy",
    "partner_user_id": "clgjeth0s0000cqk4gm0kzypn",
    "vendor_id": "clgjethgw000lcqk41x4kj8xl",
    "vendor_user_id": "clgjethg6000icqk4kp0nntks",
    "categoryId": 3,
    "url": "mpCs-YMQ",
    "platform": null,
    "status": "CONFIRMED",
    "active": true,
    "vendor_notified": true,
    "partner_notified": false,
    "cookieLife": 60,
    "price": 1000,
    "perClick": 1,
    "perClickType": "CASH",
    "perSale": 8, "perSaleType": "PERC", "createdAt": "2023-04-16T14:31:45.719Z", "updatedAt": "2023-04-16T14:36:15.057Z",
    "product": { "id": "clgjethms001dcqk4e3d166a1", "title": "1974 Fender Stratocaster, Sunburst", "desc": "Wonderful 1974 Fender Stratocaster in three-tone Sunburst, with Rosewood fingerboard, large headstock, bullet trussrod, staggered pole pickups all in excellent condition complete with bridge cover and tremolo arm at a good price thanks to a replacement neck pickup.", "fullDesc": null, "price": 1000, "cookieLife": 60, "perClick": 1, "perClickType": "CASH", "perSale": 8, "perSaleType": "PERC", "vendor_profile_id": "clgjethgw000lcqk41x4kj8xl", "vendor_user_id": "clgjethg6000icqk4kp0nntks", "product_url": "https://www.vintageandrareguitars.com/products/1974-fender-stratocaster-sunburst", "image": "https://guitarpoint.de/app/uploads/products/1974-fender-stratocaster-3t-sunburst-mapleneck-3/Fender74Strat3tSBMN574421_18.jpg", "categoryId": 3, "published": true, "active": true, "extra_info": null, "createdAt": "2023-04-16T12:55:11.237Z", "updatedAt": "2023-04-16T12:55:11.237Z" }
}]
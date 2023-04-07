import CheckIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import IconButton from '@mui/material/IconButton';
import { type Link as LinkEntity, type Partner, type Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import TimeAgo from "timeago-react";
import productImg from '../../../assets/product.png';
import { AppRoutes } from "../../../config/appRoutes";
import classNames from "../../../utils/classnames";
import { formatDateTR, numberWithCommas } from "../../../utils/helpers";
import Divider from "../../shared/Divider";
import { Lira } from "../../shared/HtmlCodes";


type ItemProps = {
    link: (LinkEntity & { partner: Partner; product: Product; });
    confirmModal: () => void;
    cancelModal: () => void;
    setLinkId: (id: string) => void;
}

const NotificationItem: React.FC<ItemProps> = ({ link, confirmModal, cancelModal, setLinkId }) => {

    function cancel() {
        setLinkId(link.id)
        cancelModal()
    }

    function confirm() {
        setLinkId(link.id)
        confirmModal()
    }

    return (
        <li className={
            classNames(
                "border hover:border-black/5 w-full",
                "py-2 px-2 bg-slate-100 hover:bg-slate-50 rounded-md",
                "shadow hover:shadow-md transition-all shadow-slate-300",
                ""
            )}>

            {/* IMAGE */}
            <div className="flex gap-4 items-center justify-between">
                <Link
                    className="aspect-square  w-12 h-12 "
                    href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${link.product.id}`}>
                    {link.product.image ?
                        <img
                            className="object-cover hover:shadow rounded object-center w-12 h-12 aspect-square"
                            src={link.product.image ?? ""}
                            alt={link.id} />
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
                </Link>


                <div className="flex flex-col gap-1 items-start min-w-[20ch] h-full">
                    <Link href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${link.product.id}`}>
                        <h4 className="text-xs whitespace-nowrap
                        font-bold hover:text-sky-500 transition-colors">
                            {link.product.title && link.product.title.length > 25 ? link.product.title.substring(0, 25) + " ..." : link.product.title}
                        </h4>
                    </Link>

                    <p className="text-stone-400 text-xs whitespace-nowrap">
                        <b className="text-stone-500">Fiyat: </b>
                        {numberWithCommas(link.product.price)}
                        <Lira />
                    </p>

                </div>



                <Divider />

                <div className="flex flex-col items-center gap-1 min-w-[5ch] h-full">
                    <b className="text-xs whitespace-nowrap text-slate-500  text-center
                        font-bold transition-colors">
                        Kullanici:
                    </b>


                    <b className="text-violet-600 text-sm font-medium whitespace-nowrap text-center">
                        {link.partner.username}
                    </b>


                </div>



                <Divider />

                <div className="min-w-[5ch]">

                    <small className="text-slate-500 text-xs font-medium whitespace-nowrap">
                        <TimeAgo
                            className="whitespace-nowrap"
                            title={formatDateTR(link.createdAt)}
                            datetime={link.createdAt as Date}
                            locale={'tr'}
                        />
                    </small>
                </div>



                <Divider />


                {/* EDIT BUTTONS */}
                <div className="w-fulll">
                    <div className="flex flex-row">


                        <div className=" flex flex-nowrap gap-2 ml-auto mr-4 h-full place-self-center">

                            <IconButton
                                size="small"
                                onClick={() => cancel()}
                                title="Affiliate linkini iptal et"
                                aria-label="Affiliate linkini iptal et">
                                <DeleteIcon className="text-red-400 w-6 h-6" />
                            </IconButton>
                            <IconButton
                                size="small"
                                title="Affiliate Linki Onayla"
                                onClick={() => confirm()}
                                aria-label="Affiliate linki onayla">
                                <CheckIcon className="text-green-600 w-6 h-6" />
                            </IconButton>
                        </div>

                    </div>


                </div>



            </div>



        </li>)
}

export default NotificationItem
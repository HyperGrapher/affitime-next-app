/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import PageCard from "../../../components/card/Card";
import ProductList from '../../../components/products/ProductList';
import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from '../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../components/buttons/LinkButton";
import { Link, Partner, Product } from "@prisma/client";
import classNames from "../../../utils/classnames";
import Image from "next/image";
import product from '../../../assets/product.png';
import { numberWithCommas } from "../../../utils/helpers";
// import { Lira } from "../shared/HtmlCodes";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import EditIcon from '@mui/icons-material/EditOutlined';
import LinkIcon from '@mui/icons-material/Link';


const LinkPage: NextPage = () => {


    const { data: links, status: linkStatus, refetch: refetchLinks } = trpc.link.getAllLinksForVendor.useQuery()

    return (
        <div className='auth-container'>


            <section className="a">
                <table>
                    <tr>
                        <th>Foto</th>
                        <th>Isim</th>
                        <th>Urun Sahibi</th>
                    </tr>

                    <tbody className={
                        classNames(
                            "border hover:border-black/5 w-full",
                            "py-2 px-2 bg-slate-100 hover:bg-slate-50 rounded-md",
                            "shadow hover:shadow-md transition-all shadow-slate-300",
                            ""
                        )}>

                        {links?.map(ln => <LinkItem key={ln.id} ln={ln} />)}

                    </tbody>

                </table>
            </section>


        </div>
    )
}

export default LinkPage


interface Props {
    ln: Link & {
        partner: Partner;
        product: Product;
    }
}
const LinkItem: React.FC<Props> = ({ ln }) => {


    return (
        <tr className="flex gap-4 items-center justify-between">


            {/* Photo */}
            <td>

                <button
                    className="aspect-square w-12 h-12"
                    onClick={() => null}>
                    {ln.product.image ?
                        <img
                            className="object-cover hover:shadow rounded object-center w-12 h-12 aspect-square"
                            src={ln.product.image}
                            alt={ln.product?.title ?? ""} />
                        : <Image
                            className={classNames(
                                "object-cover rounded hover:shadow object-center",
                                "w-12 h-12 aspect-square",
                                "border border-1 border-stone-300"
                            )}
                            width={"85"}
                            height={"85"}
                            src={product}
                            alt={"Generic Foto"} />
                    }
                </button>

            </td>



            {/* Title */}
            <td className="flex flex-col items-start gap-1 min-w-[20ch] h-full">

                <button onClick={() => null}>
                    <h4 className="text-xs whitespace-nowrap text-stone-5000 
                        font-bold hover:text-sky-500 transition-colors">
                        {ln.product.title!.length > 25 ? ln.product.title!.substring(0, 25) + " ..." : ln.product.title}
                    </h4>
                </button>

                <p className="text-stone-400 text-xs whitespace-nowrap">
                    <b className="text-stone-500">Fiyat: </b>
                    {numberWithCommas(ln.product.price)}
                    {/* <Lira /> */}
                </p>


            </td>


            {/* DIVIDER */}
            <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " />

            {/* Vendor  */}
            <td className="flex flex-col gap-1 items-start  bg-purplex-200 min-w-[12ch] h-full">
                <p>{ln.partner.username}</p>
            </td>


        </tr>
    )
}
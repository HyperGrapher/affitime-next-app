import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import profileImg from '../../../assets/profile.webp'
import type { IUnpaidItemForVendor } from '../../../interface/dashboard.interface'
import classNames from '../../../utils/classnames'
import { numberWithCommas } from '../../../utils/helpers'
import { Lira } from '../../shared/HtmlCodes'

type Props = {
    item: IUnpaidItemForVendor
}

const AwaitingItemMobile: React.FC<Props> = ({ item }) => {



    return (
        <div className={
            classNames(
                "border hover:border-black/5 w-full",
                "py-2 px-2 bg-slate-100 hover:bg-slate-50 rounded-md",
                "shadow hover:shadow-md transition-all shadow-slate-300",
            )}>

            <div className="flex gap-4 items-center  justify-between">

                <div className="flex gap-2 items-center">
                    <div
                        className="aspect-square  w-12 h-12">
                        <Image
                            className={classNames(
                                "object-cover rounded hover:shadow object-center",
                                "w-12 h-12 aspect-square",
                                "border border-1 border-stone-300"
                            )}
                            width={"85"}
                            height={"85"}
                            src={profileImg}
                            alt={"Generic Foto"} />

                    </div>

                    <div className="flex flex-col gap-1 items-start xjustify-start">

                        <section className="">
                            <h4 className="text-xs whitespace-nowrap text-stone-5000 
                        font-bold hover:text-sky-500 transition-colors">
                                {item.username}
                            </h4>

                        </section>


{/* 
                        <div className="flex items-center gap-1">
                            <b className="text-xs whitespace-nowrap text-slate-500 text-center font-bold transition-colors">
                                Linkler:
                            </b>

                            <b className="text-violet-600 text-sm font-medium whitespace-nowrap text-center">
                                {numberWithCommas(item.links)}
                            </b>

                        </div> */}

                    </div>


                </div>


                <div className="flex items-center gap-1 h-full">
                    <b className="text-xs whitespace-nowrap text-slate-500  text-center
                        font-bold transition-colors">
                        Tutar:
                    </b>

                    <b className="text-violet-600 text-sm font-medium whitespace-nowrap text-center">
                        {numberWithCommas(item.calc)} <Lira />
                    </b>

                </div>

                {/* TODO Odeme fonsiyonu */}
                <div className="text-center mr-4">
                    <b className="text-xs whitespace-nowrap text-blue-500  
                        font-bold transition-colors">
                        <Link href={`#`}>Ödeme Yap</Link>
                    </b>
                </div>


            </div>

        </div>
    )
}

export default AwaitingItemMobile
import Image from 'next/image'
import React from 'react'
import profileImg from '../../../assets/profile.webp'
import type { IUnpaidItemForPartner } from '../../../interface/dashboard.interface'
import classNames from '../../../utils/classnames'
import { numberWithCommas } from '../../../utils/helpers'
import Divider from '../../shared/Divider'
import { Lira } from '../../shared/HtmlCodes'

type Props = {
    item: IUnpaidItemForPartner
}

const AwaitingItem: React.FC<Props> = ({ item }) => {



    return (
        <div className={
            classNames(
                "border hover:border-black/5 w-full",
                "py-2 px-2 bg-slate-100 hover:bg-slate-50 rounded-md",
                "shadow hover:shadow-md transition-all shadow-slate-300",
                ""
            )}>

            <div className="flex gap-4 items-center xjustify-between">
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

                <section className="ml-8 min-w-[12ch] h-full">
                    <h4 className="text-xs whitespace-nowrap text-stone-5000 
                        font-bold hover:text-sky-500 transition-colors">
                        {item.brand}
                    </h4>

                </section>

                <Divider />


                <div className="flex flex-col items-center gap-1 min-w-[15ch] h-full">
                    <b className="text-xs whitespace-nowrap text-slate-500  text-center
                        font-bold transition-colors">
                        Tutar:
                    </b>

                    <b className="text-violet-600 text-sm font-medium whitespace-nowrap text-center">
                        {numberWithCommas(item.calc)} <Lira />
                    </b>

                </div>


                <Divider />


                <div className="flex flex-col items-center gap-1 min-w-[15ch] h-full">
                    <b className="text-xs whitespace-nowrap text-slate-500  text-center
                        font-bold transition-colors">
                        Toplam Link Sayısı:
                    </b>

                    <b className="text-violet-600 text-sm font-medium whitespace-nowrap text-center">
                        {numberWithCommas(item.links)}
                    </b>

                </div>


                <Divider />
{/* 
                <div className="min-w-[15ch] text-center">
                    <b className="text-xs whitespace-nowrap text-blue-500  
                        font-bold transition-colors">
                        <Link href={`#`}>Ödeme Talep Et</Link>
                    </b>
                </div> */}


            </div>

        </div>
    )
}

export default AwaitingItem
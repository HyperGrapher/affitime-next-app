import type { Partner, Vendor, Visit } from "@prisma/client";
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { capitalize, formatDateTR } from "../../utils/helpers";


type TableProps = {
    vd: (Visit & {
        vendor: Vendor;
        partner: Partner;
    })[] | undefined
}


const VisitTable: React.FC<TableProps> = ({ vd }) => {

    return (
        <div className="w-full xxmx-auto overflow-auto">

            <table className="table-auto w-full text-left whitespace-no-wrap text-xs sm:text-sm">
                <thead>
                    <tr>
                        <th className="px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100">Tarih</th>
                        <th className="px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100">Ülke</th>
                        <th className="px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100">Ödeme</th>
                        <th className="px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100">Geçerli</th>
                        <th className="px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100">Sebep</th>
                        <th className="px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100">Satın <br /> alma</th>
                        <th className="hidden sm:table-cell px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100 rounded-tl rounded-bl">OS</th>
                        <th className="hidden sm:table-cell px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100 rounded-tl rounded-bl">Browser</th>
                    </tr>
                </thead>
                <tbody>

                    {
                        vd?.map(x => (
                            <tr key={x.id}>
                                <td className="px-2 py-2 md:px-4 md:py-2 whitespace-nowrap ">{formatDateTR(x.createdAt)}</td>
                                <td className="px-2 py-2 md:px-4 md:py-2 whitespace-nowrap text-gray-900 ">{x.country}</td>
                                <td className={`px-2 py-2 md:px-4 md:py-2 whitespace-nowrap ${x.paid ? "text-green-500" : "text-red-400"} `}>{x.paid ? <HiCheckCircle size={"1.25rem"} color="text-green-500" /> : <HiXCircle size={"1.25rem"} color="text-red-400" />}</td>
                                <td className={`px-2 py-2 md:px-4 md:py-2 whitespace-nowrap text-gray-900 ${x.dubious ? "text-red-400" : "text-green-500"} `}>{x.dubious ? <HiXCircle size={"1.25rem"} color="text-red-400" /> : <HiCheckCircle size={"1.25rem"} color="text-green-500" />}</td>
                                <td className="px-2 py-2 md:px-4 md:py-2 whitespace-nowrap text-gray-900 ">{capitalize(x.cause)}</td>
                                <td className="px-2 py-2 md:px-4 md:py-2 whitespace-nowrap text-gray-900 ">
                                    {x.sold ? "Evet" : "-"}
                                </td>
                                <td className={`hidden sm:table-cell px-2 py-2 md:px-4 md:py-2 `}>
                                    {x.os?.toLowerCase().startsWith('win') ? "Windos" : x.os}
                                </td>
                                <td className={`hidden sm:table-cell px-2 py-2 md:px-4 md:py-2 whitespace-nowrap `}> {x.uaFamily}  </td>
                            </tr>
                        ))
                    }

                </tbody>
            </table>
        </div>
    )
}

export default VisitTable
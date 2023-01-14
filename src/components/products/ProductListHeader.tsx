

const ProductListHeader: React.FC = () => {
    return (
        <div className="border hover:border-black/5 w-full 
        py-2 px-2 bg-slate-200 hover:bg-slate-50 rounded-md 
        shadow hover:shadow-md transition-all shadow-slate-300 mb-2 pr-4
        ">

            {/* IMAGE */}
            <div className=" ml-20 flex gap-4 items-center justify-between">


                {/* <b className="text-xs w-12 min-w-[32px]" >
                    Foto
                </b> */}



                {/* TITLE */}
                <div className="min-w-[20ch] h-full">

                    <b className="text-xs whitespace-nowrap " >
                        Ürün Ismi
                    </b>


                </div>




                {/* DIVIDER */}
                {/* <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " /> */}



                {/* COMMISSON */}
                <div className="bg-purplex-200 xmin-w-[18ch]">

                    <b className="text-xs whitespace-nowrap " >
                        Komisyon
                    </b>

                </div>



                {/* DIVIDER */}
                {/* <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " /> */}



                {/* PRODUCT LINK */}
                <div className=" translate-x-8">

                    <b className="text-xs whitespace-nowrap" >
                        Hedef Ürün Linki
                    </b>
                </div>


                {/* DIVIDER */}
                {/* <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " /> */}



                {/* STATUS */}
                <div className="text-center min-w-[5ch]">


                    <b className="text-xs whitespace-nowrap " >
                        Status
                    </b>

                </div>


                {/* DIVIDER */}
                {/* <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " /> */}



                {/* LINK COUNT */}
                <div className=" text-center xmin-w-[3ch]">


                    <b className="text-xs whitespace-nowrap text-center" >
                        Link
                    </b>

                </div>



                {/* DIVIDER */}
                {/* <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " /> */}



                {/* EDIT BUTTONS */}
                <div className="">

                    <b className="text-xs whitespace-nowrap text-center" >
                        Duzenle
                    </b>
                </div>



            </div>



        </div>)
}

export default ProductListHeader
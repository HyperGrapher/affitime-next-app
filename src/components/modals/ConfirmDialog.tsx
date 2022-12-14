// import { trpc } from '../../utils/trpc';
// import { useState, useEffect } from 'react';
import Typography from "@mui/material/Typography";
import classNames from "../../utils/classnames";



const ConfirmDialog: React.FC = () => {

    const handleDelete = async (id: string) => {

        // const deleteRes = await deleteProd.mutateAsync({ id })

        // if (deleteRes.error) {
        //     setError('Cannot delete product')
        //     return
        // }
        // refetch()

    }


    return (
        <dialog open={false}
            className={classNames(
                "bg-white shadow-2xl rounded-xl h-48",
                "flex flex-col items-center space-y-4",
                "absolute inset-0 backdrop-blur-md",
                "translate-x-0 lg:translate-x-10"

            )} >
            <Typography variant="h5" >
                Ürünü silmek istiyor musunuz?
            </Typography>

            <Typography variant="body2" >
                Ürün için oluşturulan tüm linkler geçersiz hale gelecektir.
            </Typography>


            <div className="flex space-x-4 absolute bottom-4">
                <button
                    onClick={() => null}
                    className={classNames(
                        "bg-violet-600 hover:bg-violet-700 transition",
                        "w-32",
                        "shadow-sm hover:shadow-lg rounded-md ",
                        "py-2 px-8",
                        "text-white font-medium",
                        "disabled:bg-violet-400 disabled:shadow-none",
                        "aria-disabled:bg-violet-400 aria-disabled:shadow-none",
                    )}>
                    Vazgeç
                </button>

                <button
                    onClick={() => null}
                    className={classNames(
                        "bg-red-600 hover:bg-red-700 transition",
                        "w-32",
                        "shadow-sm hover:shadow-lg rounded-md ",
                        "py-2 px-8",
                        "text-white font-medium",
                        "disabled:bg-red-400 disabled:shadow-none",
                        "aria-disabled:bg-red-400 aria-disabled:shadow-none",
                    )}>
                    Sil
                </button>

            </div>

        </dialog>
    )
}

export default ConfirmDialog
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from 'react';
import Typography from "@mui/material/Typography";
import classNames from "../../utils/classnames";


type Props = {
    title: string;
    desc: string;
    confirmFn: (arg: string) => void;
    dismissFn: () => void;
}


const ConfirmDeleteDialog = (props: Props) => {

    return (
        <section
            className={classNames(
                "bg-white shadow-xl rounded-xl ",
                "flex flex-col items-center justify-around ",
                "space- px-12 py-8 w-full sm:w-3/5",

            )}>

            <Typography color={'red'} align="center" whiteSpace={'normal'} variant="h5">
                {props.title}
            </Typography>

            <Typography align="center" mt={'1.5rem'} variant="body1" >
                {props.desc}
            </Typography>


            <div className="space-y-4 sm-space-y-0 space-x-0 sm:space-x-4 mt-6  text-center">
                <button
                    onClick={() => props.dismissFn()}
                    className={classNames(
                        "bg-violet-600 hover:bg-violet-700 transition",
                        "w-full sm:w-32",
                        "shadow-sm hover:shadow-lg rounded-md ",
                        "py-2 px-8",
                        "text-white font-medium",
                        "disabled:bg-violet-400 disabled:shadow-none",
                        "aria-disabled:bg-violet-400 aria-disabled:shadow-none",
                    )}>
                    Vazgeç
                </button>

                <button
                    onClick={() => props.confirmFn("ass")}
                    className={classNames(
                        "bg-red-600 hover:bg-red-700 transition",
                        "w-full sm:w-32",
                        "shadow-sm hover:shadow-lg rounded-md ",
                        "py-2 px-8",
                        "text-white font-medium",
                        "disabled:bg-red-400 disabled:shadow-none",
                        "aria-disabled:bg-red-400 aria-disabled:shadow-none",
                    )}>
                    Sil
                </button>


            </div>


        </section>
    )

}

export default ConfirmDeleteDialog

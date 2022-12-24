// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from 'react';
import Typography from "@mui/material/Typography";
import classNames from "../../utils/classnames";


type Props = {
    title: string;
    desc: string;
    busy: boolean;
    confirmFn: () => void;
    dismissFn: () => void;
}


const ConfirmLinkCreateDialog = (props: Props) => {

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


            <div className="space-y-4 sm:space-y-2 sm:space-x-2 space-x-0 md:space-x-4 mt-6  text-center">
                <button
                    disabled={props.busy}
                    onClick={() => props.dismissFn()}
                    className={classNames(
                        "bg-violet-600 hover:bg-violet-700 transition",
                        "w-full sm:w-36 md:w-40",
                        "shadow-sm hover:shadow-lg rounded-md ",
                        "py-2 px-8",
                        "text-white font-medium",
                        "disabled:bg-violet-400 disabled:shadow-none",
                        "aria-disabled:bg-violet-400 aria-disabled:shadow-none",
                    )}>
                    Vazgeç
                </button>

                <button
                    disabled={props.busy}
                    onClick={() => props.confirmFn()}
                    className={classNames(
                        "bg-green-600 hover:bg-green-700 transition",
                        "w-full sm:w-36 md:w-40",
                        "shadow-sm hover:shadow-lg rounded-md ",
                        "py-2 px-8",
                        "text-white font-medium whitespace-nowrap",
                        "disabled:bg-green-400 disabled:shadow-none",
                        "aria-disabled:bg-green-400 aria-disabled:shadow-none",
                    )}>
                    Oluştur
                </button>


            </div>


        </section>
    )

}

export default ConfirmLinkCreateDialog

import classNames from "../../utils/classnames";
import Balancer from 'react-wrap-balancer';


type Props = {
    title: string;
    desc: string;
    confirmBtnText: string;
    busy?: boolean;
    confirmFn: () => void;
    dismissFn: () => void;
}


const WarnDialog: React.FC<Props> = ({ title, desc, confirmBtnText, busy, confirmFn, dismissFn }) => {

    return (
        <section
            className={classNames(
                "bg-white shadow-2xl rounded-xl ",
                "flex flex-col items-center justify-around ",
                "space- px-12 py-8 w-full sm:w-3/5",

            )}>

            <Balancer>
                <h3 className="text-red-500 text-xl font-bold text-center">
                    {title}
                </h3>
            </Balancer>

            <p className="text-base mt-5 text-center">
                {desc}
            </p>

            <div className="space-y-4 sm:space-y-2 sm:space-x-2 space-x-0 md:space-x-4 mt-6  text-center">
                <button
                    disabled={busy}
                    onClick={() => dismissFn()}
                    className={classNames(
                        "bg-violet-600 hover:bg-violet-700 transition",
                        "w-full sm:w-36 md:w-40",
                        "shadow-sm hover:shadow-lg rounded-md ",
                        "py-2 px-8",
                        "text-white font-medium text-sm",
                        "disabled:bg-violet-400 disabled:shadow-none",
                        "aria-disabled:bg-violet-400 aria-disabled:shadow-none",
                    )}>
                    Vazgeç
                </button>

                <button
                    disabled={busy}
                    onClick={() => confirmFn()}
                    className={classNames(
                        `bg-red-600 hover:bg-red-700 transition`,
                        "w-full sm:w-36 md:w-40",
                        "shadow-sm hover:shadow-lg rounded-md text-sm",
                        "py-2 px-8",
                        "text-white font-medium whitespace-nowrap",
                        `disabled:bg-red-400 disabled:shadow-none aria-disabled:bg-red-400`,
                        "aria-disabled:shadow-none",
                    )}>
                    {confirmBtnText}
                </button>


            </div>


        </section>
    )

}

export default WarnDialog

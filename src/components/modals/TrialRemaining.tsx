import classNames from "../../utils/classnames";
import Balancer from 'react-wrap-balancer';


type Props = {
    days: string;
}


const TrialRemaining: React.FC<Props> = ({ days }) => {

    return (
        <section
            className={classNames(
                "bg-white shadow-2xl rounded-xl ",
                "flex flex-col items-center justify-around ",
                "space- px-12 py-8 w-full sm:w-3/5",

            )}>

            <Balancer>
                <h3 className="text-violet-600 text-xl font-bold text-center">
                    Deneme süren {days} gün sonra bitiyor!
                </h3>
            </Balancer>


            <Balancer>
                <p className="text-base mt-5 text-center">
                    Şimdi bir plan seçerek affitime uygulamasını kesintisiz kullanmaya devam edebilirsin.
                </p>
            </Balancer>
            
            <div className="space-y-4 sm:space-y-2 sm:space-x-2 space-x-0 md:space-x-4 mt-6  text-center">
                <button
                    onClick={() => null}
                    className={classNames(
                        "bg-violet-600 hover:bg-violet-700 transition",
                        "w-full sm:w-36 md:w-40",
                        "shadow-sm hover:shadow-lg rounded-md",
                        "py-2 px-8",
                        "text-white font-medium text-sm",
                        "disabled:bg-violet-400 disabled:shadow-none",
                        "aria-disabled:bg-violet-400 aria-disabled:shadow-none",
                    )}>
                    Kapat
                </button>

                <button
                    onClick={() => null}
                    className={classNames(
                        `bg-green-600 hover:bg-green-700 transition`,
                        "w-full sm:w-36 md:w-40",
                        "shadow-sm hover:shadow-lg rounded-md text-sm",
                        "py-2 px-8",
                        "text-white font-medium whitespace-nowrap",
                        `disabled:bg-green-400 disabled:shadow-none aria-disabled:bg-green-400`,
                        "aria-disabled:shadow-none",
                    )}>
                    Ödeme Planı Seç
                </button>


            </div>


        </section>
    )

}

export default TrialRemaining
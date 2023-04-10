import Head from "next/head";
import PageCard from "../../../components/card/Card";

// https://discord.com/developers/applications/1094909344526643240/information
const ApiKeys = () => {
    return (
        <div className='auth-container'>
            <Head>
                <title>Affitime | API Keyleri</title>
            </Head>

            <main className="mx-auto container min-h-screen px-2 pt-6">

                <div className="mb-2">
                    <h1 className="text-slate-600 font-bold text-2xl">
                        API Anahtarları
                    </h1>
                    <small className="text-slate-400 text-sm">
                        Mağaza entegrasyonu için API anahtarlarını yönetin.
                    </small>
                </div>

                <PageCard>


                    <div className="flex flex-col w-full mb-4">

                        <div className="flex w-full mb-1">
                            <p className="lg:w-2/3 font-medium leading-relaxed text-sm md:text-base">MAĞAZA ID</p>
                            <p className="font-medium leading-relaxed text-sm md:text-base">CLIENT SECRET</p>
                        </div>
                        <div className="flex w-full mb-4">
                            <p className="lg:w-2/3 leading-relaxed text-sm md:text-base">asfasfasfgfgh45345523123</p>
                            <button className="bg-red-600 text-white text-sm md:text-base px-3 py-1 rounded">Yenile</button>
                        </div>
                    </div>
 
                </PageCard>

            </main>

        </div>
    )
}

export default ApiKeys
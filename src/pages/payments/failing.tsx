import Head from "next/head";

const Failing = () => {
  return (
    <div className='container bg-redx-100 mx-auto'>

      <Head>
        <title>Affitime | Bilgilendirme</title>
      </Head>

      <div className="mt-16 bg-yellow-50 py-8">
        <h1 className="text-3xl text-red-500 font-bold text-center">Ödeme Başarısız</h1>
      </div>

    </div>
  )
}

export default Failing

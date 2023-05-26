import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import { useState } from "react";
import InterestForm from "../components/poll/InterestForm";
import SocialForm from "../components/poll/SocialForm";

// ? TEST EXIST
const Welcome: NextPage = () => {

  const [step, setStep] = useState(0)

  return (
    <main className='mt-24'>

      <h1 className='text-4xl font-bold text-violet-700 text-center'>Hoşgeldin</h1>

      <div className="flex flex-col items-center gap-2 container mx-auto px-2 md:px-24">


        {step === 0 && <InterestForm setStep={setStep} />}
        {step === 1 && <SocialForm />}

      </div>

    </main>
  )
}

export default Welcome

export const getServerSideProps: GetServerSideProps = async (context) => {

  const session = await getSession(context)


  return { props: {} }

}

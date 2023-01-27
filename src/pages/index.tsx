// import Container from "@mui/material/Container";
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import MacMock from '../assets/home/mac-mockup.png';
import AccordItem from "../components/accordion/AccordItem";


const Home: NextPage = () => {



  return <div className="">
    <Head>
      <title>Affitime | Anasayfa</title>
      <meta name="description" content="Affiliate uygulamasi" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <header className="text-white body-font bg-violet-700 py-12  bg-gradient-to-r from-indigo-900 to-violet-500">
      <div className="container mx-auto flex px-8 py-24 md:flex-row flex-col items-center" >
        <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center" >
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-white">Lorem ipsum dolor sit amet
            <br className="hidden lg:inline-block" />consect adi elit.
          </h1>
          <p className="mb-8 leading-relaxed">Copper mug try-hard pitchfork pour-over freegan heirloom neutra air plant cold-pressed tacos poke beard tote bag. Heirloom echo park mlkshk tote bag selvage hot chicken authentic tumeric truffaut hexagon try-hard chambray.</p>
          <div className="flex justify-center" >

            <button className="inline-flex text-white bg-orange-500 border-0 py-2 px-6 focus:outline-none hover:bg-orange-600 rounded text-lg">Hadi Başlayalım</button>
          </div>
        </div>
        <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6" >
          <div className="">
            <Image className="" src={MacMock} alt={"cover"} />
          </div>
        </div>
      </div>
    </header>

    <Feat />
    <Feat2 />

    <Accords />
    <FooterTop />

  </div>

};



const Accords = () => {
  return (<section className="text-white">
    <div className="container px-5 py-24 mx-auto" >
      <div className="flex flex-col text-center w-full mb-20" >
        <h3 className="sm:text-3xl text-2xl font-medium title-font text-gray-900/50">
          Sıkça Sorulan Sorular
        </h3>
      </div>

      <section className="space-y-8 mx-auto max-w-screen-md">

        <AccordItem
          id="1"
          title="Lorem ipsum dolor sit amet consectetur adipisicing."
          desc="Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
            Dolore vel placeat labore doloremque inventore magni optio tenetur. 
            Labore deserunt aut est cumque, eveniet molestias odio quibusdam, 
            velit quidem laudantium amet consequuntur, accusantium ipsum neque!"
        />

        <AccordItem
          id="2"
          title="Lorem ipsum dolor sit amet consectetur adipisicing."
          desc="Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
            Dolore vel placeat labore doloremque inventore magni optio tenetur. 
            Labore deserunt aut est cumque, eveniet molestias odio quibusdam, 
            velit quidem laudantium amet consequuntur, accusantium ipsum neque!"
        />

        <AccordItem
          id="3"
          title="Lorem ipsum dolor sit amet consectetur adipisicing."
          desc="Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
            Dolore vel placeat labore doloremque inventore magni optio tenetur. 
            Labore deserunt aut est cumque, eveniet molestias odio quibusdam, 
            velit quidem laudantium amet consequuntur, accusantium ipsum neque!"
        />

      </section>
    </div>
  </section>
  )

}


// <div className="relative flex justify-center items-center h-[350px] bg-gradient-to-r from-teal-900 to-teal-500">

const FooterTop = () => {
  return (<div className="relative flex justify-center items-center h-[350px] bg-gradient-to-r from-indigo-900 to-violet-500">

    <div className="flex flex-col items-center space-y-8 py-8">
      <h4 className="font-bold text-3xl text-center text-white">
        Lorem ipsum dolor sit amet, consectetur <br /> adipiscing elit, sed do eiusmod
      </h4>

      <Link href={'#'}
        className="whitespace-nowrap text-white bg-orange-500 border-0 py-2 px-6 focus:outline-none hover:bg-orange-600 rounded text-lg"
      >Planları İncele</Link>
    </div>

    <div className="absolute left-0 top-0">
      <svg width="141" height="157" viewBox="0 0 141 157" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="41.5" cy="57.5" r="99.5" fill="#CA2D78" />
      </svg>

    </div>

    <div className="absolute right-0 bottom-0">
      <svg width="154" height="159" viewBox="0 0 154 159" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="99.5" cy="99.5" r="99.5" fill="#FF7E50" />
      </svg>

    </div>

  </div>)
}

const Feat2 = () => {
  return (<section className="bg-violet-600 text-white relative  bg-gradient-to-r from-teal-800 to-green-500">
    <div className="container px-5 py-24 mx-auto" >
      <div className="flex flex-col text-center w-full mb-20" >
        <h3 className="sm:text-3xl text-2xl font-medium title-font text-white/80">Affitime ile neler yapabilirsiniz?</h3>
        <p className="mt-6 text-white/70">Lorem ipsum dolor sit amet consectetur adipisicing elit.
          <br />
          Illum iure dolores maxime! Nam, error autem. Numquam, dolorum.</p>
      </div>
      <main className="flex flex-wrap justify-center gap-2 lg:gap-24 -m-4 mx-auto bg-red-100/20z" >
        <article className="flex flex-col gap-4">

          <section className="flex space-x-4">
            <b className="text-slate-200 font-bold text-3xl">01</b>
            <p className="text-white/70 w-[300px]">Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Assumenda, eos voluptatum. Laudantium, sapiente corrupti.</p>
          </section>

          <section className="flex space-x-4">
            <b className="text-slate-200 font-bold text-3xl">02</b>
            <p className="text-white/70 w-[300px]">Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Assumenda, eos voluptatum. Laudantium, sapiente corrupti.</p>
          </section>

        </article>

        <article className="flex flex-col gap-4 ">

          <section className="flex space-x-4">
            <b className="text-slate-200 font-bold text-3xl">03</b>
            <p className="text-white/70 w-[300px]">Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Assumenda, eos voluptatum. Laudantium, sapiente corrupti.</p>
          </section>

          <section className="flex space-x-4">
            <b className="text-slate-200 font-bold text-3xl">04</b>
            <p className="text-white/70 w-[300px]">Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Assumenda, eos voluptatum. Laudantium, sapiente corrupti.</p>
          </section>

        </article>
      </main>

    </div>


    <div className="absolute left-0 top-0">
      <svg width="141" height="157" viewBox="0 0 141 157" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="41.5" cy="57.5" r="99.5" fill="#e51fec" />
      </svg>

    </div>

    <div className="absolute right-0 bottom-0">
      <svg width="154" height="159" viewBox="0 0 154 159" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="99.5" cy="99.5" r="99.5" fill="#ffc850" />
      </svg>

    </div>
  </section>
  )

}


const Feat = () => {
  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto" >
        <div className="flex flex-col text-center w-full mb-20" >
          <h3 className="sm:text-3xl text-2xl font-medium title-font text-gray-900">Neden Affitime?</h3>
          <p className="a">Lorem ipsum dolor sit amet consectetur adipisicing elit.
            <br />
            Illum iure dolores maxime! Nam, error autem. Numquam, dolorum.</p>
        </div>
        <div className="flex flex-wrap -m-4" >
          <div className="p-4 md:w-1/3" >
            <div className="flex rounded-lg h-full bg-gray-200 p-8 flex-col" >
              <div className="flex items-center mb-3" >
                <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0" >
                  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <h2 className="text-gray-900 text-lg title-font font-medium">Shooting Stars</h2>
              </div>
              <div className="flex-grow" >
                <p className="leading-relaxed text-base">Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine.</p>

              </div>
            </div>
          </div>
          <div className="p-4 md:w-1/3" >
            <div className="flex rounded-lg h-full bg-gray-200 p-8 flex-col" >
              <div className="flex items-center mb-3" >
                <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0" >
                  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2 className="text-gray-900 text-lg title-font font-medium">The Catalyzer</h2>
              </div>
              <div className="flex-grow" >
                <p className="leading-relaxed text-base">Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine.</p>

              </div>
            </div>
          </div>
          <div className="p-4 md:w-1/3" >
            <div className="flex rounded-lg h-full bg-gray-200 p-8 flex-col" >
              <div className="flex items-center mb-3" >
                <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0" >
                  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                    <circle cx="6" cy="6" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"></path>
                  </svg>
                </div>
                <h2 className="text-gray-900 text-lg title-font font-medium">Neptune</h2>
              </div>
              <div className="flex-grow" >
                <p className="leading-relaxed text-base">Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine.</p>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}




export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {

  const session = await getSession(context)

  if (session) return {
    redirect: {
      destination: `/${session.role.toLowerCase()}/dashboard`,
      permanent: false
    }
  }


  return { props: {} }

}
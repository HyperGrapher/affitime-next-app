import fs from 'fs'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import path from 'path'


interface IServerSideProps {
    blogs: string[]
}

export const getStaticProps: GetStaticProps<IServerSideProps> = async (context) => {


    const photos = fs.readdirSync(path.join('public', 'images', 'blog'))

    photos.map((fn) => {
        console.log(fn);

    })



    return {
        props: {
            blogs: []
        }
    }

}

const BlogIndex = ({ blogs }: InferGetStaticPropsType<typeof getStaticProps>) => {

    const { data: session } = useSession();

    return (
        <div>

            <Head>
                <title>Affitime | Blog</title>
            </Head>

           

            <h1 className='text-3xl text-center font-bold mt-24'>Blog Yazıları</h1>

            <main>
                <section className="text-gray-600 body-font">
                    <div className="container px-5 py-24 mx-auto" >
                        <div className="flex flex-wrap -m-4" >
                            <div className="p-4 md:w-1/3" >
                                <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden bg-white" >
                                    <img className="lg:h-48 md:h-36 w-full object-cover object-center" src="https://dummyimage.com/720x400" alt="blog" />
                                    <div className="p-6" >

                                        <h1 className="title-font text-lg font-medium text-gray-900 mb-3">The Catalyzer</h1>
                                        <p className="leading-relaxed mb-3">Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.</p>
                                        <div className="flex items-center flex-wrap " >
                                            <a className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">Devamını Oku
                                                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" >
                                                    <path d="M5 12h14"></path>
                                                    <path d="M12 5l7 7-7 7"></path>
                                                </svg>
                                            </a>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 md:w-1/3" >
                                <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden bg-white" >
                                    <img className="lg:h-48 md:h-36 w-full object-cover object-center" src="https://dummyimage.com/721x401" alt="blog" />
                                    <div className="p-6" >

                                        <h1 className="title-font text-lg font-medium text-gray-900 mb-3">The 400 Blows</h1>
                                        <p className="leading-relaxed mb-3">Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.</p>
                                        <div className="flex items-center flex-wrap" >
                                            <a className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">Devamını Oku
                                                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" >
                                                    <path d="M5 12h14"></path>
                                                    <path d="M12 5l7 7-7 7"></path>
                                                </svg>
                                            </a>
               
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="p-4 md:w-1/3" >
                                <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden bg-white" >
                                    <img className="lg:h-48 md:h-36 w-full object-cover object-center" src="https://dummyimage.com/722x402" alt="blog" />
                                    <div className="p-6" >

                                        <h1 className="title-font text-lg font-medium text-gray-900 mb-3">Shooting Stars</h1>
                                        <p className="leading-relaxed mb-3">Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.</p>
                                        <div className="flex items-center flex-wrap " >
                                            <a className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">Devamını Oku
                                                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" >
                                                    <path d="M5 12h14"></path>
                                                    <path d="M12 5l7 7-7 7"></path>
                                                </svg>
                                            </a>
                 
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 md:w-1/3" >
                                <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden bg-white" >
                                    <img className="lg:h-48 md:h-36 w-full object-cover object-center" src="https://dummyimage.com/722x402" alt="blog" />
                                    <div className="p-6" >

                                        <h1 className="title-font text-lg font-medium text-gray-900 mb-3">Shooting Stars</h1>
                                        <p className="leading-relaxed mb-3">Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.</p>
                                        <div className="flex items-center flex-wrap " >
                                            <a className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">Devamını Oku
                                                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" >
                                                    <path d="M5 12h14"></path>
                                                    <path d="M12 5l7 7-7 7"></path>
                                                </svg>
                                            </a>
                    
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 md:w-1/3" >
                                <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden bg-white" >
                                    <img className="lg:h-48 md:h-36 w-full object-cover object-center" src="https://dummyimage.com/722x402" alt="blog" />
                                    <div className="p-6" >

                                        <h1 className="title-font text-lg font-medium text-gray-900 mb-3">Shooting Stars</h1>
                                        <p className="leading-relaxed mb-3">Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.</p>
                                        <div className="flex items-center flex-wrap " >
                                            <a className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">Devamını Oku
                                                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" >
                                                    <path d="M5 12h14"></path>
                                                    <path d="M12 5l7 7-7 7"></path>
                                                </svg>
                                            </a>
                                  
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


            </main>


        </div>
    )
}

export default BlogIndex


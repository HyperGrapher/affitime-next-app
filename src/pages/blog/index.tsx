import fs from 'fs'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import path from 'path'
import { HiPhotograph, HiUpload } from 'react-icons/hi'
import IconButton from '../../components/buttons/IconButton'

interface IServerSideProps {
    blogs: string[]
}

export const getStaticProps: GetStaticProps<IServerSideProps> = async (context) => {

    console.log(context.params);

    console.log(process.cwd());
    // md files should not be in src
    // const mds = fs.readdirSync(path.join('..', 'examples-codes'))
    const photos = fs.readdirSync(path.join('public', 'images', 'blog'))
    console.log(photos);

    photos.map((fn) => {
        console.log(fn);

    })



    return {
        props: {
            blogs: ["abc", "cde"]
        }
    }

}

const BlogIndex = ({ blogs }: InferGetStaticPropsType<typeof getStaticProps>) => {

    const { data: session } = useSession();

    console.log(blogs);

    return (
        <div>
            {/* 
                Admin icin gorunur component olacak. Sidebarda oldugu gibi visibility admin ise
                Her bir blog item uzerinde admin icin delete btn
            */}
            <Head>
                <title>Affitime | Blog</title>
            </Head>

            {session?.role === "ADMIN" &&
                <div className='fixed bottom-0 left-0 right-0 bg-slate-900 px-8 py-4 flex justify-center gap-4'>


                    <IconButton
                        twClasses='bg-sky-500 hover:bg-sky-400 transition'
                        icon={<HiPhotograph color="white" size={"16px"} />}
                        fn={() => console.log('Image Upload')}
                        title='1-) Foto Yukle' />

                    <IconButton
                        twClasses='bg-indigo-500 hover:bg-indigo-400 transition'
                        icon={<HiUpload color="white" size={"16px"} />}
                        fn={() => console.log('MD Upload')}
                        title='2-) MD Yukle' />

                </div>
            }


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
                                            {/*  <span className="text-gray-400 mr-3 inline-flex items-center lg:ml-auto md:ml-0 ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200">
                                                <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>1.2K
                                            </span>
                                            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                                                <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                                                </svg>6
                                            </span> */}
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
                                            {/*  <span className="text-gray-400 mr-3 inline-flex items-center lg:ml-auto md:ml-0 ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200">
                                                <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>1.2K
                                            </span>
                                            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                                                <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                                                </svg>6
                                            </span> */}
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
                                            {/*  <span className="text-gray-400 mr-3 inline-flex items-center lg:ml-auto md:ml-0 ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200">
                                                <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>1.2K
                                            </span>
                                            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                                                <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                                                </svg>6
                                            </span> */}
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
                                            {/*  <span className="text-gray-400 mr-3 inline-flex items-center lg:ml-auto md:ml-0 ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200">
                                                <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>1.2K
                                            </span>
                                            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                                                <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                                                </svg>6
                                            </span> */}
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
                                            {/*  <span className="text-gray-400 mr-3 inline-flex items-center lg:ml-auto md:ml-0 ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200">
                                                <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>1.2K
                                            </span>
                                            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                                                <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                                                </svg>6
                                            </span> */}
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


/*
 return (
        <div>
            //
                Admin icin gorunur component olacak. Sidebarda oldugu gibi visibility admin ise
                Her bir blog item uzerinde admin icin delete btn
            //
            <Head>
                <title>Affitime Blog</title>
            </Head>

            {session?.role === "ADMIN" &&
                <div className='fixed bottom-0 left-0 right-0 bg-slate-900 px-8 py-4 flex justify-center gap-4'>


                    <IconButton
                        twClasses='bg-sky-500 hover:bg-sky-400 transition'
                        icon={<HiPhotograph color="white" size={"16px"} />}
                        fn={() => console.log('Image Upload')}
                        title='1-) Foto Yukle' />

                    <IconButton
                        twClasses='bg-indigo-500 hover:bg-indigo-400 transition'
                        icon={<HiUpload color="white" size={"16px"} />}
                        fn={() => console.log('MD Upload')}
                        title='2-) MD Yukle' />

                </div>
            }


            <h1 className='text-xl text-center mt-24'>Blog</h1>
        </div>
    )
*/
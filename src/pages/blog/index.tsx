import fs from 'fs'
import path from 'path'
import type { GetServerSideProps, GetStaticProps, InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import IconButton from '../../components/buttons/IconButton'
import { HiPlus, HiUpload, HiPhotograph } from 'react-icons/hi'

interface IServerSideProps {
    blogs: string[]
}

export const getStaticProps: GetStaticProps<IServerSideProps> = async (context) => {


    console.log(process.cwd());
    // md files should not be in src
    // const mds = fs.readdirSync(path.join('..', 'examples-codes'))
    const photos = fs.readdirSync(path.join('public', 'images', 'blog'))
    console.log(photos);

    const blogs = photos.map((fn) => {
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


    return (
        <div>
            {/* 
                Admin icin gorunur component olacak. Sidebarda oldugu gibi visibility admin ise
                Her bir blog item uzerinde admin icin delete btn
            */}

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
}

export default BlogIndex
import fs from 'fs'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import matter from 'gray-matter'
import path from 'path'
import { HiPhotograph, HiUpload } from 'react-icons/hi'
import IconButton from '../../components/buttons/IconButton'
import Image from 'next/image'
import type { IBlogFrontmatter } from '../../interface/zod.schema'


interface IServerSideProps {
    posts: {
        pid: string;
        frontmatter: IBlogFrontmatter
    }[]
}

export const getStaticProps: GetStaticProps<IServerSideProps> = async (context) => {

    const mds = fs.readdirSync('blogs')
    // const photos = fs.readdirSync(path.join('public', 'images', 'blog'))
    // console.log(photos);
    const posts = mds.map((filename) => {
        console.log(filename);
        const pid = filename.replace('.md', '')
        const read = fs.readFileSync(`blogs/${filename}`, 'utf-8')
        const { data: frontmatter } = matter(read)

        return {
            pid,
            frontmatter: frontmatter as IBlogFrontmatter
        }

    })

    // console.log(posts);



    return {
        props: {
            posts
        }
    }

}


const BlogIndex = ({ posts }: InferGetStaticPropsType<typeof getStaticProps>) => {

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
                        <div className="flex flex-wrap -m-4 " >
                            {

                                posts.map(x => (

                                    <div key={x.pid} className="p-4 md:w-1/3" >
                                        <div key={x.pid} className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden bg-white shadow-lg" >
                                            <Image width={144} height="250" className="lg:h-48 md:h-36 w-full object-cover object-center" alt='ad' src={x.frontmatter.cover_img} />
                                            <div className="p-6" >
                                                <Link href={`/blog/${x.pid}`} >
                                                    <h1 className="title-font text-lg font-medium text-gray-900 mb-3">{x.frontmatter.title}</h1>
                                                </Link>
                                                <p className="leading-relaxed mb-3">
                                                    {x.frontmatter.metaDesc}
                                                </p>
                                                <div className="flex items-center flex-wrap " >
                                                    <Link href={`/blog/${x.pid}`} className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">
                                                        Devamını Oku
                                                        <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" >
                                                            <path d="M5 12h14"></path>
                                                            <path d="M12 5l7 7-7 7"></path>
                                                        </svg>
                                                    </Link>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))

                            }
                    </div>
                </div>
            </section>


        </main>


        </div >
    )
}

export default BlogIndex


/*
{false &&
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
*/
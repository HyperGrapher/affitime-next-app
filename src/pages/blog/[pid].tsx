import fs from 'fs'
// import type { GetStaticProps, InferGetStaticPropsType, GetStaticPaths, InferGetServerSidePropsType } from 'next'
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import matter from 'gray-matter'
import path from 'path'
import { HiPhotograph, HiUpload } from 'react-icons/hi'
import IconButton from '../../components/buttons/IconButton'
import Image from 'next/image'
import type { IBlogFrontmatter } from '../../interface/zod.schema'
import styled from '@emotion/styled';
import md from 'markdown-it'

interface IServerSideProps {
    post: {
        pid: string;
        content: string;
        frontmatter: IBlogFrontmatter
    }
}

export const getStaticPaths: GetStaticPaths = async () => {


    const mds = fs.readdirSync('blogs')
    const paths = mds.map((filename) => ({
        params: {
            pid: filename.replace('.md', ''),
        }
    }))

    return {
        paths,
        fallback: false,
    }

}

export const getStaticProps: GetStaticProps<IServerSideProps> = async (context) => {

    const pid = context.params?.pid as string;

    const read = fs.readFileSync(`blogs/${pid}.md`, 'utf-8')
    const { data: frontmatter, content } = matter(read)

    return {
        props: {
            post: {
                pid,
                content,
                frontmatter: frontmatter as IBlogFrontmatter

            }
        }
    }

}

const BlogDetail: NextPage<IServerSideProps> = ({ post }) => {


    return (
        <div className='blog-detail mt-[68px] prose mx-auto'>
            <Head>
                <title>Affitime | {post.frontmatter.title}</title>
            </Head>
            <img
                className="lg:h-64 md:h-48 w-full object-cover object-center"
                alt='blog-img'
                src={post.frontmatter.cover_img} />


            <div className="max-w-2xl mx-auto">
                <StyledBlogContent>
                    <h1 className='font-bold text-3xl italic'>{post.frontmatter.title}</h1>

                    <div className='max-w-4xl' dangerouslySetInnerHTML={{ __html: md().render(post.content) }} />

                </StyledBlogContent>

            </div>

        </div>
    )
}

export default BlogDetail



const StyledBlogContent = styled.div`

max-width: 700px;
margin: 0 auto;
margin-top: 2rem;
font-size: 1.1rem;


  h1 {
    text-align: left;
    font-weight: 700;
    color: #222;
    font-size: 1.75rem;
  }

  h2 {
    text-align: left;
    font-weight: 700;
    color: #222;
    font-size: 1.25rem;
  }

  blockquote {
    font-style: italic;
    font-size: 1.4rem;
  }

  img {
    width: 100%;
  }


  ul {
    /* list-style: disc outside none; */
    /* list-style-type: "→"; */
  }

  li {
    margin-left: 1rem;
  }
  li::before {
  content: "•";
  font-size: 150%;
  line-height: 0;
  margin: 0 0.3rem 0 -0.25rem;
  position: relative;
  top: 0.08rem;
  color: #a56dff;
}

  a {
    display: block;
    text-align: left;
    color: #7a28ff;
    margin-bottom: 10px;
  }

  p {
    margin: 1rem auto;
    & > a {
      display: inline;
    }
  }

  `
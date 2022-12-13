import React from 'react'

const Ex = () => {
    return (
        <div className='bg-gradient-to-b from-[#2e026d] to-[#15162c]'>

            <div className="flex flex-row justify-center items-center"></div>

            <div className="max-lg:p-8" /> {/* <!-- Will apply `p-8` until the `lg` breakpoint kicks in --> */}
            <div className="min-[712px]:max-[877px]:right-16 ..." />

            <nav className='fixed top-0 left-0'></nav>

            <main className="sm:w-3/6 lg:w-2/6 "></main>

            <h1 className="sm:text-[2rem] text-2xl font-extrabold tracking-tight"></h1>
            <span className="max-w-[60px]"></span>
            <button className="rounded py-2 text-sm px-6 bg-red-500 text-slate-50"></button>

        </div>
    )
}

export default Ex
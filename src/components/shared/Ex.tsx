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

            {/* Gradient text/title */}
            <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500"></h1>
            <button className="text-sm rounded-md bg-gradient-to-r from-teal-500 to-blue-500 text-white px-2 py-1">Onayla</button>

            <button className="relative overflow-hidden rounded-lg bg-black px-20 py-6 ring-red-500/50 ring-offset-black will-change-transform focus:outline-none focus:ring-1 focus:ring-offset-2">
                <span className="absolute inset-px z-10 grid place-items-center rounded-lg bg-black bg-gradient-to-t from-neutral-800 text-neutral-400">Button</span>
                <span aria-hidden className="absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-disco before:bg-gradient-conic before:from-purple-700 before:via-red-500 before:to-amber-400" />
            </button>
        </div>
    )
}

export default Ex
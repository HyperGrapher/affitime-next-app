/* eslint-disable @next/next/no-img-element */
import React, { ReactNode, useState } from 'react'


type Props = {
    children: ReactNode
}

const Navigation: React.FC<Props> = ({children}) => {


    const [open, setOpen] = useState(false)

    return (
        <div className={`main-container st-effect-4 ${open ? "side-menu-open" : ""}`}>

            <nav className="side-menu st-effect-4" id="menu-4">
                <h2 className="">Sidebar</h2>
                <ul>
                    <li><a href="#">Data Management</a></li>
                    <li><a href="#">Location</a></li>
                    <li><a href="#">Study</a></li>
                    <li><a href="#">Collections</a></li>
                    <li><a href="#">Credits</a></li>
                </ul>
            </nav>

            <div className="push-content">
                <div className="content-wrap">{/* <!-- this is the wrapper for the content --> */}

                    {/*  <!-- top bar over sticky navbar --> */}
                    <div className="most-top">
                        <p>Affitime</p>
                    </div>
                    <div className="content-inner">
                        {/* <!-- extra div for emulating position:fixed of the menu -->
 */}
                        {/* <!-- Top Sticky Navigation --> */}
                        <div className="topbar clearfix">

                            {/* <!-- ID sidebar-trigger required in JS --> */}
                            <button onClick={() => setOpen(prev => !prev)} id="sidebar-trigger" data-effect="st-effect-4" className="toggle-btn" >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>

                        <main className="grid clearfix">
                            {children}
                        </main>

                   
                    </div>{/* <!-- /content-inner --> */}
                </div>{/* <!-- /content-wrap --> */}
            </div>

        </div>
    )
}

export default Navigation


/*

                        <main className="grid clearfix">

                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>
                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>
                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>
                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>
                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>
                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>
                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>
                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>
                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>
                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>
                            <article className="grid-item" ><div className="pic"><img src="http://placehold.it/350x298" alt="adaad" /></div></article>


                        <button onClick={() => {
                            console.log('CLICK');
                            
                            setOpen(prev => !prev)}
                        } 
                            className="bg-blue-600 p-6 text-white cursor-pointer" >
                                AC/KAPA
                            </button>


                        </main>

*/
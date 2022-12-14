import type { ReactNode } from 'react';
import React from 'react'
import Link from 'next/link';
import classNames from '../../utils/classnames';


type Props = {
    title: string;
    href: string;
    twClasses?: string; // tailwind class
    icon?: ReactNode;
}

// Icon Example
// <HiPlus color="white" size={"16px"} />


const LinkButton: React.FC<Props> = ({ title, href, twClasses, icon }) => {
    return (
        <Link
            className={classNames(
                "bg-violet-600 hover:bg-violet-700 transition",
                "flex items-center justify-center flex-nowrap space-x-2",
                "shadow-sm hover:shadow-lg rounded-md ",
                "py-2 px-8",
                `${twClasses}`
            )}
            href={href}>

            {icon ? icon : null}

            <span className="text-slate-50 text-xs font-medium tracking-wide text-center">
                {title}
            </span>
        </Link>
    )
}

export default LinkButton
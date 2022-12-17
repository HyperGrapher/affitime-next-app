import type { ReactNode } from 'react';
import React from 'react'
import classNames from '../../utils/classnames';


type Props = {
    title: string;
    twColorCode?: string;
    twClasses?: string;
    icon?: ReactNode;
    disabled?: boolean;
    fn: () => void
}

// ? Icon Example
// ? <HiPlus color="white" size={"16px"} />
const IconButton: React.FC<Props> = ({ title, twColorCode = "violet", twClasses, icon, disabled = false, fn }) => {
    return (
        <button
            onClick={() => fn()}
            aria-disabled={disabled}
            className={
                classNames(
                    `bg-${twColorCode}-600 hover:bg-${twColorCode}-700 transition`,
                    `flex items-center justify-center flex-nowrap space-x-2`,
                    `shadow-sm hover:shadow-lg rounded-md `,
                    `py-2 px-8`,
                    `disabled:bg-${twColorCode}-400 disabled:shadow-none`,
                    `aria-disabled:bg-${twColorCode}-400 aria-disabled:shadow-none`,
                    `${twClasses}`
                )}>

            {icon ? icon : null}

            <span className="text-slate-50 text-xs font-medium tracking-wide text-center">
                {title}
            </span>
        </button>
    )
}

export default IconButton
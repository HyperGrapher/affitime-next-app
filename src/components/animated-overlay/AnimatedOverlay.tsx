/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction } from 'react';

type Props = {
    children: React.ReactNode;
    setModal?: Dispatch<SetStateAction<boolean>>,
}
/* 
    Fade-in / Fade-out full page blurred backdrop that accepts a child.
    Can be used for modals or loader animations.

*/
const AnimatedOverlay: React.FC<Props> = ({ children, setModal }) => {

    return ReactDOM.createPortal(

        <motion.div
            onClick={() => setModal?.(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
                position: 'absolute',
                inset: '0',
                height: '100%',
                padding: '0',
                margin: '0',
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                display: 'grid',
                placeItems: 'center',
                backdropFilter: 'blur(2px)',
                zIndex: '99'
            }}
        >
            <motion.div
                onClick={e => e.stopPropagation()}
                className="innercontent"
                // variants={animStyle}
                initial='hidden'
                animate='visible'
                exit='exit'
                style={{
                    position: 'relative',
                    zIndex: '99'
                }}
            >
                {children}
            </motion.div>
        </motion.div>,
        document.body
    )
}

export default AnimatedOverlay;


const animStyle = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.25,
        }
    },
    exit: {
        opacity: 0,

    }
}
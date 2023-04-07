import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import type { Dispatch, SetStateAction } from 'react';

type Props = {
    children: React.ReactNode;
    setModal?: Dispatch<SetStateAction<boolean>>,
}

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

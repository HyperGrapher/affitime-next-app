/* eslint-disable react-hooks/exhaustive-deps */
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { useLayoutEffect } from "react";
import useScrollPosition from "../../hooks/useScrollPosition";

type Props = {
    children: React.ReactNode;
    setModal?: (val: boolean) => void,
    state: boolean,
}

const ModalContainer: React.FC<Props> = ({ children, setModal, state }) => {

    const scr = useScrollPosition()

    useLayoutEffect(() => {
        state && document.body.classList.add('modal')
        return () => {
            document.body.classList.remove('modal')
        };
    }, [state])

    return state ? ReactDOM.createPortal(
        //Backdrop 
        <motion.div
            onClick={() => setModal?.(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
                position: 'absolute',
                inset: '0',
                height: '100vh',
                padding: '0',
                width: '100%',
                transform: `translateY(${scr}px)`,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'grid',
                placeItems: 'center',
                backdropFilter: 'blur(2px)',
                zIndex: '98'
            }} >


            {/* If modal content is clicked prevent closing by stopPropagation()  */}
            <motion.div
                className="grid place-items-center px-3"
                onClick={e => e.stopPropagation()}
                variants={animStyle}
                initial='hidden'
                animate='visible'
                exit='exit'>
                {children}
            </motion.div>
        </motion.div>,
        document.body
    ) : null
}

export default ModalContainer


const animStyle = {
    hidden: {
        opacity: 0,
        scale: 0
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            delay: 0.1,
            duration: 0.35,
        }
    },
    exit: {
        opacity: 0,

    }
}

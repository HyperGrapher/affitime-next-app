import Loader from './Loader';
import { AnimatePresence } from 'framer-motion';
import AnimatedOverlay from '../animated-overlay/AnimatedOverlay';

interface Props {
    show: boolean
}
const FadingLoader: React.FC<Props> = ({ show = true }) => (

    <AnimatePresence initial={false} mode="wait">
        {show &&
            <AnimatedOverlay>
                <Loader scale={1.15} />
            </AnimatedOverlay>
        }
    </AnimatePresence >

)


export default FadingLoader
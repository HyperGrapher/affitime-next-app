import type { PaperProps as MuiPaperProps } from '@mui/material/Paper';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { DRAWER_WIDTH } from '../../config/constants';
import useNavbarMenuStore from '../../store/menu.store';

interface PaperProps extends MuiPaperProps {
    open?: boolean;
}

type Props = {
    children: React.ReactNode;
};

const MainSlideContainer = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'open',
})<PaperProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: "transparent", // "rgb(241 245 249 / var(--tw-bg-opacity))", // theme.palette.primary.dark,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: DRAWER_WIDTH,
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));


const SlideContainer: React.FC<Props> = ({ children }) => {

    const sideOpen = useNavbarMenuStore(store => store.sideOpen)

    return (
        <MainSlideContainer sx={{ border: 'none', bgcolor: 'transparent' }} elevation={0} variant="elevation" open={sideOpen}>
            <main className={`mx-auto sm:w-5/6 lg:w-4/6 ${sideOpen ? "" : "translate-x-8 transition-alla duration-300a"}`}>
                {children}
            </main>
        </MainSlideContainer>
    )
}

export default SlideContainer
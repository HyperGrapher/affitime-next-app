import MuiAppBar from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import type { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';


import Toolbar from '@mui/material/Toolbar';

import { DRAWER_WIDTH } from '../../../../config/constants';
import AppBarLogo from './AppBarLogo';

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBarComp = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.primary.dark,
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


type Props = {
    open: boolean;
    handleDrawerOpen: ()=> void;
}

const AppBar: React.FC<Props> = ({open, handleDrawerOpen}) => {
  return (
    <AppBarComp position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: 'none' }),
                        }}>
                        <MenuIcon />
                    </IconButton>
                    <AppBarLogo open={open} />
                </Toolbar>
            </AppBarComp>
  )
}

export default AppBar
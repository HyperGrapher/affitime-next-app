import { styled } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';
import { closedOpacityMixin, openedOpacityMixin } from './MenuMixins';


interface TypoProp extends TypographyProps {
    open?: boolean;
}

const AppLogo = styled(Typography, { shouldForwardProp: (prop) => prop !== 'open' })<TypoProp>(({ theme, open }) => ({
    whiteSpace: 'nowrap',
    ...(open && {
        ...openedOpacityMixin(theme),
    }),
    ...(!open && {
        ...closedOpacityMixin(theme),
    }),
}),
);

type Props = {
    open: boolean
}

const AppBarLogo: React.FC<Props> = ({ open }) => {

    return (
        <AppLogo open={open} className="text-fuchsia-200" variant="h6" noWrap >
            Affitime
        </AppLogo>
    )
}

export default AppBarLogo
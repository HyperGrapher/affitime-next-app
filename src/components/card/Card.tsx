/* eslint-disable @typescript-eslint/no-unused-vars */
import { Stack } from '@mui/material'
import { useMediaQuery as useMQ } from 'react-responsive';


type Props = {
    children: React.ReactNode;
}

const PageCard: React.FC<Props> = ({ children }) => {
    const isTabletMobileAndPortrait = useMQ({
        maxWidth: 640,
        orientation: 'portrait'
    })

    return (
        <Stack
            style={{
                backgroundColor: '#fff',
                boxShadow: isTabletMobileAndPortrait ? 'none' : 'var(--shadow-menu)',
                padding: isTabletMobileAndPortrait ? '0.5rem' : '1.5rem',
                borderRadius: isTabletMobileAndPortrait ? '0' : '1rem',
                border: isTabletMobileAndPortrait ? 'initial' : 'var(--border-card)',
                position: 'relative',
                zIndex: "0",
                maxWidth: '1280px',
                margin: '0 auto',
                marginBottom: '4rem',
            }}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
        >
            {children}
        </Stack>
    )
}

export default PageCard
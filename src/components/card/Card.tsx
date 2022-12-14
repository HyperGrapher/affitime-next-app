/* eslint-disable @typescript-eslint/no-unused-vars */
import { Stack } from '@mui/material'
import { useMediaQuery as useMQ } from 'react-responsive';


type Props = {
    children: React.ReactNode;
}

const PageCard: React.FC<Props> = ({ children }) => {
    const isMobile = useMQ({
        maxWidth: 450,
        orientation: 'portrait'
    })

    return (
        <Stack
            className='lg:shadow-lg bg-white p-4 rounded-lg lg:border 
            lg:w-full border-slate-200 maxos-w-[700px] my-16 mx-auto' >

            {children}

        </Stack>
    )
}

export default PageCard
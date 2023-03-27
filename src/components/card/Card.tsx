import { Stack } from '@mui/material'


type Props = {
    children: React.ReactNode;
}

const PageCard: React.FC<Props> = ({ children }) => {


    return (
        <Stack
            className='lg:shadow-lg bg-white px-1 md:px-4 py-4 md:p-4 rounded-lg lg:border 
            lg:w-full border-slate-200 maxos-w-[700px] my-6 mx-auto min-h-full' >

            {children}

        </Stack>
    )
}

export default PageCard
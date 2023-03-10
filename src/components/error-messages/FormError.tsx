import { Typography, Paper } from '@mui/material';
import type { ReactNode } from 'react';

interface FormErrorProps {
    state: boolean;
    message: string;
}

const FormError: React.FC<FormErrorProps> = ({ state, message }) => state ? (

    <Paper
        elevation={0}
        sx={{
            background: '#fdf5e2',
            padding: "0.5rem 1rem",
            marginBottom: '2rem'
        }}>
        <Typography
            textAlign={'center'}
            fontSize={'0.85rem'}
            color={'#ff3149'}>
            {message}
        </Typography>
    </Paper>
) : null

export default FormError

type FormFieldErrorProps = {
    state: boolean;
    message?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ state, message }) => state ? (
    <span className="absolute font-medium bottom-[-25px] text-xs pl-2 text-red-500 whitespace-nowrap">
        {message}
    </span>

) : null

type FormFieldWrapperProps = {
    children: ReactNode;

}


export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ children }) => (
    <div className="relative flex flex-col w-full">
        {children}
    </div>

)


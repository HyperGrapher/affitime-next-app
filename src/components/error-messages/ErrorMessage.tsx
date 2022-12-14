import { Typography, Paper } from '@mui/material';

interface Props {
    state: boolean;
    message: string;
}

const ErrorMessage: React.FC<Props> = ({ state, message }) => state ? (
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

export default ErrorMessage
/* eslint-disable @typescript-eslint/no-unused-vars */
import styled from '@emotion/styled'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import type { AccordionProps } from '@mui/material/Accordion';
import MuiAccordion from '@mui/material/Accordion';
import type {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';

export const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    border: `1px solid rgba(0,0,0,.1)`,
    padding: '0.75rem 0',
    borderRadius: '8px',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
  }));
  
  export const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
      expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
      {...props}
    />
  ))(() => ({
    backgroundColor: 'var(--content-area-card-bg)',
    flexDirection: 'row',
    '& .MuiAccordionSummary-expandIconWrapper': {
        backgroundColor: '#fff',
        padding: '0.25rem',
        borderRadius: '500px',
        border: '1px solid rgba(0,0,0,.125)'
      },
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
      margin: '0',
    },
  }));
  
  export const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: '1rem',
    borderTop: '1px solid rgba(0, 0, 0, .125)',
    backgroundColor: 'bg-slate-100',
  }));
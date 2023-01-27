import { Accordion, AccordionSummary, AccordionDetails } from './AccordionStyled'
import { useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Typography } from "@mui/material";


type AccordProps = {
    id: string,
    title: string,
    desc: string
  }
  
  const AccordItem: React.FC<AccordProps> = ({ id, title, desc }) => {
  
    const [expanded, setExpanded] = useState<string | false>(false);
  
  
    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  
  
    return (<Accordion
      expanded={expanded === String(id)}
      onChange={handleChange(String(id))}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${id}-content`}
        id={`${id}-header`}>
  
  
        <Typography fontSize={'1rem'} id="project-title" variant="h6">
          {title}
        </Typography>
  
  
      </AccordionSummary>
      <AccordionDetails>
  
        <p>{desc}</p>
      </AccordionDetails>
    </Accordion>)
  
  }
  
  export default AccordItem
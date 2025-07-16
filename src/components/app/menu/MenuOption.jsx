import { Box, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import { styled } from '@mui/material';

//import { getStyle } from './getStyle';
import { useJob } from '../JobContext';

const getStyle = (backgroundColor, resultsDisable = false) => ({
    //width: 110,
    //height: 40,
    textAlign: 'center',
    display:'flex', justifyContent: 'center',
    backgroundColor: backgroundColor,
    cursor: resultsDisable ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    margin: "0px 15px"
})

const StyledCard = styled(Card)(({ theme }) => ({
    transition: "transform 0.15s ease-in-out, background 0.15s",
    "&:hover": { transform: "scale3d(1.05, 1.05, 1)", backgroundColor: 'rgba(204, 229, 255, 0.8)' },
}));

export default function MenuOption({ children, text, id, setPage, page, myWidth }) {

    const jobID = useJob().jobID;

    const resultsDisable = id == 'results' && jobID == null;

    let backgroundColor;

    if (resultsDisable) {
        backgroundColor = 'rgba(210,210,210,0.8)';
    } else {
        backgroundColor = page == id ? 'rgba(204, 229, 255, 0.8)' : 'rgba(255,255,255,1)';
    }

    const style = getStyle(backgroundColor, resultsDisable);

    return (
        <>
            {resultsDisable ?
                <Card
                    sx={{...style, width: myWidth}}>
                    <Box sx={{ py: 1, px: 1, display: 'flex' }}>
                        <Box>
                            {children}
                        </Box>
                        <Box sx={{ pt: 0.3, pl: 1 }}>
                            <Typography variant="h7" component="div">{text}</Typography>
                        </Box>
                    </Box>
                </Card>
                :
                <StyledCard
                    sx={{...style, width: myWidth}}
                    onClick={() => setPage(id)}
                >
                    <Box sx={{ py: 1, px: 1, display: 'flex' }}>
                        <Box>
                            {children}
                        </Box>
                        <Box sx={{ pt: 0.3, pl: 1 }}>
                            <Typography variant="h7" component="div">{text}</Typography>
                        </Box>
                    </Box>
                </StyledCard>
            }
        </>
    )
}
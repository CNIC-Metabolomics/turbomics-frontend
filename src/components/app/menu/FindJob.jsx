import React, { useState } from 'react'

import TextField from '@mui/material/TextField';
import { Backdrop, Box, CircularProgress, IconButton, Link } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { useVars } from '../../VarsContext';
import { useDispatchJob } from '../JobContext';
import { json2Danfo } from '@/utils/jobDanfoJsonConverter';
import { useDispatchResults } from '../ResultsContext';


export default function FindJob({ setPage, setAnnotating }) {

    const [searchedJobID, setSearchedJobID] = useState('');
    const [exist, setExist] = useState(true);
    const [loading, setLoading] = useState(false);

    const dispatchJob = useDispatchJob();
    const dispatchResults = useDispatchResults();
    const API_URL = useVars().API_URL;

    async function handleSearch(searchedJobID) {
        if (searchedJobID == '') return;
        setLoading(prev => true);

        console.log(`Search Job ID: ${searchedJobID}`);
        const res = await fetch(`${API_URL}/search/${searchedJobID}`);
        const resJson = await res.json();

        if (resJson.exist) {
            console.log(resJson);
            setAnnotating(false);

            dispatchJob({
                type: 'set-job-context',
                jobContext: json2Danfo(resJson.jobContext)
            });

            dispatchResults({ type: 'reset-results' });

            if (resJson.jobContext.annParams != null) {
                // Provide time to render disappearance
                setTimeout(() => setAnnotating(true), 1000); 
            }
            setPage('results');
            setSearchedJobID(''); // clean jobId (text-box)

        } else {
            setExist(false);
        }
        setLoading(prev => false);
    }

    const SearchButton = () => (
        <IconButton onClick={() => handleSearch(searchedJobID)}>
            <SearchIcon />
        </IconButton>
    )

    return (
        <>
        <Box sx={{ width: 260 }} className="d-flex align-items-center ms-auto">
                <TextField
                    id="outlined-basic"
                    // label="Search Job"
                    placeholder="Search Job"
                    variant="outlined"
                    size='small'
                    onChange={e => { setSearchedJobID(e.target.value); setExist(true); }}
                    onKeyDown={e => { if (e.key === 'Enter') {
                        e.preventDefault();      // avoid form submit / reload
                        handleSearch(searchedJobID);
                        }
                    }}
                    value={searchedJobID}
                    sx={{
                        width: '100%',
                        // Label color
                        '& .MuiInputLabel-root': {
                        color: 'black',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                        color: 'black',
                        },

                        // Input root
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',

                            // Text color
                            '& input': {
                                color: 'black',
                            },

                            // Border colors
                            '& fieldset': {
                                borderColor: 'rgba(0,0,0,0.4)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'black',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'black',
                            },
                        },
                    }}
                    InputProps={{
                        endAdornment: <SearchButton />,
                        sx: { color: 'white' }
                    }}
                    //autoFocus
                    error={!exist}
                    helperText={!exist && 'Job not found'}
                />
        </Box>
        <Backdrop open={loading} sx={{ zIndex: 2000 }}>
            <CircularProgress color="inherit" />
        </Backdrop>
        </>
    )
}

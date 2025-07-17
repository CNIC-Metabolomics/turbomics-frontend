import React, { useState } from 'react'

import TextField from '@mui/material/TextField';
import { Backdrop, Box, CircularProgress, IconButton, Link } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { useVars } from '../../VarsContext';
import { useDispatchJob } from '../JobContext';
import { json2Danfo } from '@/utils/jobDanfoJsonConverter';
import { useDispatchResults } from '../ResultsContext';

const EXAMPLE_JOB = 'dtkgbe8mId'

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

        } else {
            setExist(false);
        }
        setLoading(prev => false);
    }

    console.log(loading);

    const SearchButton = () => (
        <IconButton onClick={() => handleSearch(searchedJobID)}>
            <SearchIcon />
        </IconButton>
    )

    return (
        <Box sx={{ position: 'relative', top: 13, left: 0 }}>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress color="inherit" />
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        Loading Job...
                    </Box>
                </Box>
            </Backdrop>
            <Box sx={{ width: '60%', margin: 'auto' }}>
                <TextField
                    id="outlined-basic"
                    label="Search Job"
                    variant="outlined"
                    size='small'
                    onChange={e => { setSearchedJobID(e.target.value); setExist(true); }}
                    value={searchedJobID}
                    InputProps={{ endAdornment: <SearchButton /> }}
                    sx={{ width: "100%" }}
                    //autoFocus
                    error={!exist}
                    helperText={!exist && 'Job not found'}
                />
                <Box sx={{ textAlign: 'end' }}>
                    <Link
                        component="button"
                        underline='hover'
                        sx={{ fontSize: '1rem' }}
                        onClick={() => { setSearchedJobID(EXAMPLE_JOB); handleSearch(EXAMPLE_JOB) }}
                    >
                        Load example
                    </Link>
                </Box>
            </Box>
        </Box>
    )
}

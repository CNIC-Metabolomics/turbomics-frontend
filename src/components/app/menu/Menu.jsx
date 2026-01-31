import React, { useState } from 'react';
import ScienceIcon from '@mui/icons-material/Science';
import HomeIcon from '@mui/icons-material/Home';
import Typography from '@mui/material/Typography';

import { useJob } from '../JobContext';
import MenuOption from './MenuOption';
import CreateJobBtn from './CreateJobBtn';
import LoadSampleBtn from './LoadSampleBtn';
import { Box } from '@mui/material';
import MyAutocomplete from './MyAutocomplete';

export default function Menu({ page, setPage, setCreatingJob, setAnnotating }) {

    const { user, OS, omics, jobID } = useJob();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: 1 }}>
            {
                page == 'new-job' &&
                <>
                    {/* First line */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: 20,
                    }}>
                        {jobID != null &&
                            <Typography variant='body2' sx={{ flex: 1, pr: 4, textAlign: 'right' }} >Job ID: {jobID}</Typography>
                        }
                    </Box>
                    {/* Second line */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: 60,
                        border: '0px solid red'
                    }}>
                        <Box sx={{ flex: 1, pl: 2 }}> {/* First column */}
                            <LoadSampleBtn />
                        </Box>
                        <Box sx={{ flex: 1 }}> {/* Second column */}
                            <MyAutocomplete />
                        </Box>
                        <Box sx={{ flex: 1, pr: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}> {/* Third column */}
                            <Box>
                                {jobID != null &&
                                    <MenuOption
                                        text='Back to results'
                                        id='results'
                                        setPage={setPage}
                                        page={page}
                                        myWidth={170}
                                    >
                                        <ScienceIcon />
                                    </MenuOption>
                                }
                            </Box>
                            <Box>
                                <CreateJobBtn
                                    setCreatingJob={setCreatingJob}
                                    setPage={setPage}
                                    setAnnotating={setAnnotating}
                                />
                            </Box>
                        </Box>
                    </Box>
                </>
            }
            {
                page == 'results' &&
                <>
                    {/* First line */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: 10,
                    }}>
                        {jobID != null &&
                            <Typography variant='body2' sx={{ flex: 1, pr: 4, textAlign: 'right' }} >Job ID: {jobID}</Typography>
                        }
                    </Box>
                    {/* Second line */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: 60,
                        border: '0px solid red'
                    }}>
                        <MenuOption
                            text='Main page'
                            id='new-job'
                            setPage={setPage}
                            page={page}
                            myWidth={180}
                        >
                            <HomeIcon />
                        </MenuOption>
                    </Box>
                </>
            }
        </Box>
    );
}
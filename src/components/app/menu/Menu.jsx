import React, { useState } from 'react';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import HomeIcon from '@mui/icons-material/Home';

import { useJob } from '../JobContext';
import MyMotion from '../../MyMotion';
import MenuOption from './MenuOption';
import CreateJobBtn from './CreateJobBtn';
import LoadSampleBtn from './LoadSampleBtn';
import { Box, Card, Typography } from '@mui/material';
import { getStyle } from './getStyle';
import MultiAssayExperiment from './MultiAssayExperiment';
import { useVars } from '@/components/VarsContext';
import FindJob from './FindJob';

export default function Menu({ page, setPage, setCreatingJob, setAnnotating }) {


    const { user, OS, omics, jobID } = useJob();

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            {
                page == 'new-job' &&
                <>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'space-evenly',
                        border: '0px solid red', height: 50
                    }}>
                        <Box sx={{ width: '25%' }}>
                            <LoadSampleBtn />
                        </Box>
                        <Box sx={{ width: '15%' }}>
                            <MultiAssayExperiment />
                        </Box>
                        <Box sx={{ width: 180, display: 'flex', justifyContent: 'center' }}>
                            <CreateJobBtn
                                setCreatingJob={setCreatingJob}
                                setPage={setPage}
                                setAnnotating={setAnnotating}
                            />
                        </Box>
                        <Box sx={{ width: '15%' }}>
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
                        <Box sx={{ width: '25%' }}>
                            <FindJob setPage={setPage} setAnnotating={setAnnotating} />
                        </Box>
                    </Box>
                </>
            }
            {
                page == 'results' &&
                <>
                    <Box>
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
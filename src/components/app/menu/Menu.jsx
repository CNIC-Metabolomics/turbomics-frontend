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

export default function Menu({ page, setPage, setCreatingJob, setAnnotating }) {


    const { user, OS, omics, jobID } = useJob();

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2, border: '0px solid red' }}>
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
                        <Box sx={{ width: '25%', border: '0px solid blue' }}>
                            <LoadSampleBtn />
                        </Box>
                        <Box sx={{ width: '15%', border: '0px solid blue' }}>
                            <MultiAssayExperiment />
                        </Box>
                        <Box sx={{ width: '10%', display: 'flex', justifyContent: 'center', border: '0px solid blue' }}>
                            <CreateJobBtn
                                setCreatingJob={setCreatingJob}
                                setPage={setPage}
                                setAnnotating={setAnnotating}
                            />
                        </Box>
                        <Box sx={{ width: '15%', border: '0px solid blue' }}>
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
                        <Box sx={{ width: '25%', border: '1px solid blue' }}>
                            Find Job
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
            {
                page == 'new-job' && false && <>
                    <LoadSampleBtn />
                    <MultiAssayExperiment />
                </>}
            {false &&
                <>
                    <MenuOption text='New Job' id='new-job' setPage={setPage} page={page}>
                        <CreateIcon />
                    </MenuOption>
                    <MenuOption text='Find Job' id='find-job' setPage={setPage} page={page}>
                        <SearchIcon />
                    </MenuOption>
                    <MenuOption text='Results' id='results' setPage={setPage} page={page}>
                        <ScienceIcon />
                    </MenuOption>
                </>
            }
            {
                page == 'new-job' && false && // user.mdata && omics.length > 0 && OS != null && // ((user.xm && user.m2i) && (user.xq && user.q2i)) && 
                <MyMotion>
                    <CreateJobBtn
                        setCreatingJob={setCreatingJob}
                        setPage={setPage}
                        setAnnotating={setAnnotating}
                    />
                </MyMotion>
            }
        </Box>
    );
}
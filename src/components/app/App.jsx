import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { JobProvider } from './JobContext';
import MyNavBar from "./NavBar";
import MyMotion from '../MyMotion'
import Menu from './menu/Menu';

import NewJob from './newJob/NewJob';
import { ResultsProvider } from './ResultsContext';
import AskAnnotationsDialog from './newJob/createJob/AskAnnotationsDialog';
import CreateJobWaiting from './newJob/createJob/CreateJobWaiting';
import Annotating from './newJob/createJob/Annotating';

import dynamic from 'next/dynamic'
const Results = dynamic(
    () => import('./results/Results')
);
const AnnotationsParamsDialog = dynamic(
    () => import('./newJob/createJob/AnnotationsParamsContent/AnnotationsParamsDialog')
);

export default function App() {

    const [loading, setLoading] = useState(true);
    const styles = {
        loaderContainer: {
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
        }
    };

    const [page, setPage] = useState('new-job'); // "new-job", "find-job", "results"
    const [creatingJob, setCreatingJob] = useState(''); // "", "waiting", "ask-annotations", "annotations-params"
    const [annotating, setAnnotating] = useState(false);

    useEffect(() => {
        console.log('TurbOmics loaded!');
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <CircularProgress size={80} />
            </Box>
        );
    }
    return (
        <div>
            <JobProvider>
                <ResultsProvider>
                    <MyNavBar
                        setPage={setPage}
                        setAnnotating={setAnnotating}
                    />
                    <Menu
                        page={page}
                        setPage={setPage}
                        setCreatingJob={setCreatingJob}
                        setAnnotating={setAnnotating}
                    />

                    {/* {annotating &&
                        <Annotating page={page} />
                    } */}

                    {
                        page == 'new-job' &&
                        <MyMotion>
                            <NewJob />
                            {creatingJob == 'waiting' &&
                                <CreateJobWaiting creatingJob={creatingJob} />
                            }
                            {creatingJob == 'ask-annotations' &&
                                <AskAnnotationsDialog
                                    creatingJob={creatingJob}
                                    setCreatingJob={setCreatingJob}
                                    setPage={setPage}
                                />
                            }
                            {creatingJob == 'annotations-params' &&
                                <AnnotationsParamsDialog
                                    creatingJob={creatingJob}
                                    setCreatingJob={setCreatingJob}
                                    setAnnotating={setAnnotating}
                                    setPage={setPage}
                                />
                            }
                        </MyMotion>
                    }

                    {
                        page == 'results' &&
                        <MyMotion>
                            <Results annotating={annotating} />
                        </MyMotion>
                    }
                </ResultsProvider>
            </JobProvider>
        </div>
    )
}



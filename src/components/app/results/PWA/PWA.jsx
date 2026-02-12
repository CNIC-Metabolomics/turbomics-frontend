import { Backdrop, Box, CircularProgress, Divider, LinearProgress, Typography } from '@mui/material'
import React, { useEffect, useCallback, useRef, useState } from 'react'
import ViewSelector from './ViewSelector';
import { useJob } from '../../JobContext';
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useVars } from '../../../VarsContext';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import dynamic from 'next/dynamic'
import HelpSectionParams from './HelpSection/HelpSectionParams';


const ParamSelector = dynamic(
    () => import('./ParamSelector')
);

const Results = dynamic(
    () => import('./Results')
);

// Main
function PWA({ pwaJob, setPwaJob }) {

    // Get results variables
    const dispatchResults = useDispatchResults();
    const savedResultsPWA = useResults().PWA;

    // Local states
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(savedResultsPWA.view); // Single-View, Multi-View

    // Get general variables
    const { API_URL } = useVars();

    // Get job variables
    const { omics, jobID, OS } = useJob();

    
    const [hasRun, setHasRun] = useState(false);


    // From Reactome identifiers to info
    const [rId2info, setRId2info] = useState(
        savedResultsPWA.rId2info ? savedResultsPWA.rId2info :
        omics.reduce((prev, curr) => ({ ...prev, [curr]: {} }), {})
    );

    // Job status and results
    const getResIntervalRef = useRef();

    // Which omics are being used in the analysis
    const [workingOmics, setWorkingOmics] = useState(savedResultsPWA.workingOmics);

    // Capture mdataCategorical (it comes from ParamSelector)
    const [mdataCategorical, setMdataCategorical] = useState(savedResultsPWA.mdataCategoricalRes);

    // Get job results from back-end
    const fetchResults = useCallback(async (runId) => {
        const res = await fetch(`${API_URL}/get_pathway_analysis/${jobID}/${view}/${runId}`);
        const resJson = await res.json();
        setPwaJob(resJson);

        if (resJson.status != 'waiting') {
            console.log('Pathway Analysis finished: ', resJson);
            dispatchResults({type: 'set-pwa-attr', attr:'jobStatus', value:resJson});
            clearInterval(getResIntervalRef.current)
        }

    }, [getResIntervalRef, view, API_URL, jobID, dispatchResults, setPwaJob]);

    // Single polling starter
    const startPolling = useCallback((runId) => {
        if (!runId) return;

        clearInterval(getResIntervalRef.current);

        getResIntervalRef.current = setInterval(() => {
            fetchResults(runId);
        }, 5000);
    }, [fetchResults]);

    // Resume polling ONCE on mount
    // useEffect(() => {

    //     if ((pwaJob?.status === 'waiting' || pwaJob?.status === '') && pwaJob.runId !== null  ) {
    //         startPolling(pwaJob.runId);
    //     }

    //     return () => {
    //         clearInterval(getResIntervalRef.current);
    //     };
    // }, [pwaJob, startPolling]);
    useEffect(() => {
        if (
            hasRun &&
            pwaJob?.status === 'waiting' &&
            pwaJob?.runId
        ) {
            startPolling(pwaJob.runId);
        }

        return () => {
            clearInterval(getResIntervalRef.current);
        };
    }, [pwaJob, startPolling, hasRun]);

    // Send job to back-end
    const fetchJobRun = useCallback(async (mdataCol, mdataCategorical, omicIdR, runId, selectedPathways = []) => {
        console.log(`PWA runId: ${runId}`);

        const res = await fetch(
            `${API_URL}/run_pathway_analysis/${jobID}/${runId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    col: mdataCol.id,
                    type: mdataCategorical.isCategorical ? 'categorical' : 'numeric',
                    val1: mdataCategorical.g1.id,
                    val2: mdataCategorical.g2.id,
                    f2id: omicIdR,
                    view: view,
                    OS: OS.scientific_name.replace(' ', '_'),
                    cpwFiles: selectedPathways
                })
            }
        );

        const resJson = await res.json();
        
        // Start asking for results
        setPwaJob({ status: 'waiting', pwa_res: null, runId: resJson.runId });

        // Start polling here
        startPolling(pwaJob?.runId);

        // Set working omics
        const _workingOmics = Object.keys(omicIdR).filter(e => omicIdR[e]);
        setWorkingOmics(_workingOmics);
        dispatchResults({ type: 'set-pwa-attr', attr: 'workingOmics', value: _workingOmics });

        const _mdataCategorical = { ...mdataCategorical, mdataCol: mdataCol.id }
        dispatchResults({ type: 'set-pwa-attr', attr: 'mdataCategoricalRes', value: _mdataCategorical });
        setMdataCategorical(_mdataCategorical);

        dispatchResults({type: 'set-pwa-attr', attr: 'rId2info', value: rId2info});

    }, [view, setWorkingOmics, setPwaJob, setMdataCategorical, 
        API_URL, OS, jobID, rId2info, dispatchResults, startPolling, pwaJob]);

    return (
        <Box>
            <Box sx={{height:0}}><HelpSectionParams/></Box>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress color="inherit" />
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        Loading modules for Pathway Analysis...
                    </Box>
                </Box>
            </Backdrop>
            <Box sx={{ pt: 3 }}>
                {/* <ViewSelector
                    view={view}
                    setView={setView}
                    resetJobStatus={() => setPwaJob(prev => ({ ...prev, status: '' }))}
                    disabled={pwaJob?.status === 'waiting'}
                /> */}
                <ViewSelector
                    view={view}
                    setView={(v) => {
                        setView(v);
                        setHasRun(false);
                    }}
                    resetJobStatus={() =>
                        setPwaJob(prev => ({ ...prev, status: '' }))
                    }
                    disabled={pwaJob?.status === 'waiting'}
                />

            </Box>
            <ParamSelector
                setRId2info={setRId2info}
                fetchJobRun={fetchJobRun}
                setLoading={setLoading}
                setHasRun={setHasRun}
                disabled={pwaJob?.status === 'waiting'}
            />
            <Divider sx={{ py: 3, color: 'black' }}> </Divider>
            {/* {jobStatus.status == 'waiting' && */}
            {pwaJob?.status == 'waiting' &&
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: '50%', pb: 10 }}>
                        <LinearProgress sx={{ height: 2 }} />
                    </Box>
                </Box>
            }
            {pwaJob?.status == 'ok' &&
            <>
                <Results
                    pwa_res={pwaJob.pwa_res}
                    runId={pwaJob.runId}
                    rId2info={rId2info}
                    view={view}
                    workingOmics={workingOmics}
                    mdataCategorical={mdataCategorical}
                />
            </>
            }
            {pwaJob?.status == 'error' &&
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 10 }}>
                        <ReportProblemIcon sx={{ fontSize: 25 }} />
                        <Typography variant='h6' sx={{ px: 2 }}>
                            An error occurred when executing Pathway Analysis
                        </Typography>
                    </Box>
                </Box>
            }
        </Box>
    )
}


export default PWA
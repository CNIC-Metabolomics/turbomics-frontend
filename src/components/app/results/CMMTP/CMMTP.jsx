import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatchJob, useJob } from '../../JobContext'
import { useVars } from '@/components/VarsContext';
import { useDispatchResults, useResults } from '../../ResultsContext';
import {
  Box,
  Link,
  Typography,
  Paper,
  Stack,
  Chip
} from '@mui/material';
import { Grid, Divider, Alert } from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';


const BATCH_SIZE = 3;
const TIME_SLEEP = 6000; //in milliseconds
const PROXY = "https://corsproxy.io";
const CMM_URI = "https://ceumass.eps.uspceu.es/mediator/api/v3/batch";


function CMMTP() {

    const { DEV_MODE, SERVER_URL, API_URL } = useVars();

    const CMM_URL = DEV_MODE ? `${PROXY}/?${encodeURIComponent(CMM_URI)}` : CMM_URI;

    const getTPRef = useRef();

    const dispatchJob = useDispatchJob();

    const dispatchResults = useDispatchResults();

    const { CMM, TP } = useResults();


    // Get data from jobContext
    const { jobID } = useJob();
    const m2i_idCol = useJob().idCol.m2i;
    const xm_mid = useJob().norm.xm.columns;
    const m2i_fileName = useJob().userFileNames.m2i;
    const { m2i } = useJob().user;
    const [fixed_m2i, setFixed_m2i] = useState(m2i);
    
    const { annParams, annStatus } = useJob();
    const status = annStatus ?? null;

    // Component state
    const loadText = useMemo(() => {
        if (status === 'waiting') return 'Waiting CMM & TP...';
        if (status === 'running') return 'Running CMM & TP...';
        if (status === 'finished') return 'CMM & TP Finished';
        if (status === 'ok') return 'CMM & TP Finished';
        if (status === 'error') return 'Putative Annotation Error';
        return 'Waiting CMM & TP...';
    }, [status]);
    const loadCMMText = useMemo(() => {
        if (CMM.status === 'idle') return 'Idle';
        if (CMM.status === 'waiting') return 'Waiting...';
        if (CMM.status === 'running') return 'Running CMM...';
        if (CMM.status === 'ok') return 'CMM Finished';
        if (CMM.status === 'error') return 'CMM Error';
        return '';
    }, [CMM.status]);
    const loadTPText = useMemo(() => {
        if (TP.status === 'idle') return 'Idle';
        if (TP.status === 'waiting') return 'Waiting...';
        if (TP.status === 'running') return 'Running TurboPutative...';
        if (TP.status === 'ok') return 'TurboPutative Finished';
        if (TP.status === 'error') return 'TurboPutative Error';
        return '';
    }, [TP.status]);

    // Batches of mz to be sent to CMM
    const mzBatches = useMemo(() => {

        const mzSerie = fixed_m2i.column(annParams.mzCol.id);
        const ionSerie = fixed_m2i.column(annParams.ionCol.id);

        const mzList = { pos: [], neg: [] };
        if (annParams.ionValPos !== null) {
            xm_mid.map((mid, i) => {
                fixed_m2i.index.includes(mid) &&
                    ionSerie.values[fixed_m2i.index.indexOf(mid)] == annParams.ionValPos.id &&
                    mzList['pos'].push(parseFloat(mzSerie.values[fixed_m2i.index.indexOf(mid)]));
            });
        }
        if (annParams.ionValNeg !== null) {
            xm_mid.map((mid, i) => {
                fixed_m2i.index.includes(mid) &&
                    ionSerie.values[fixed_m2i.index.indexOf(mid)] == annParams.ionValNeg.id &&
                    mzList['neg'].push(parseFloat(mzSerie.values[fixed_m2i.index.indexOf(mid)]));
            });
        }

        // make batches
        const mzBatches = { 'pos': [], 'neg': [] };
        for (let i = 0; i < mzList.pos.length; i += BATCH_SIZE) {
            mzBatches.pos.push(mzList.pos.slice(i, i + BATCH_SIZE));
        }

        for (let i = 0; i < mzList.neg.length; i += BATCH_SIZE) {
            mzBatches.neg.push(mzList.neg.slice(i, i + BATCH_SIZE));
        }

        return mzBatches;
    }, [annParams, fixed_m2i, xm_mid]);

    // Get results from TP
    const getTurboPutative = useCallback(async () => {

        let ion_mode = [];
        annParams.ionValPos !== null && ion_mode.push('pos');
        annParams.ionValNeg !== null && ion_mode.push('neg');

        const res = await fetch(`${API_URL}/get_turboputative/${jobID}/${ion_mode.join('_')}`);
        const resJson = await res.json();

        if (resJson.status == 'ok') {
            clearInterval(getTPRef.current);
            dispatchJob({
                type: 'user-upload',
                dfJson: resJson.m2i,
                fileType: 'm2i',
                userFileName: m2i_fileName,
                idCol: m2i_idCol
            });
            dispatchJob({ type: 'set-ann-status', status: 'ok' });
            dispatchResults({ type: 'finish-tp-mode', mode: 'pos' });
            dispatchResults({ type: 'finish-tp-mode', mode: 'neg' });
            dispatchResults({ type: 'finish-tp' });
        }
        else if (resJson.status == 'error') {
            dispatchJob({ type: 'set-ann-status', status: 'error' });
            dispatchResults({ type: 'update-tp-progress', status: 'error' });
            clearInterval(getTPRef.current);
            console.log(resJson);
        }

    }, [annParams, jobID, API_URL, m2i_fileName, getTPRef, dispatchJob, dispatchResults, m2i_idCol])

    // Fetch putative annotations from CMM
    const fetchCMM = useCallback((ion_mode, adducts, masses, i) => {
        return new Promise(async (resolve, reject) => {
            const body = {
                "metabolites_type": "all-except-peptides",
                "databases": ["all-except-mine"],
                "masses_mode": "mz",
                "ion_mode": ion_mode,
                "adducts": adducts,
                "tolerance": annParams.mzError,
                "tolerance_mode": "ppm",
                "masses": masses
            };

            try {
                const res = await fetch(
                    `${CMM_URL}`,
                    {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    });

                if (res.ok) {
                    const resJson = await res.json();
                    resolve(resJson.results);
                } else {
                    console.error('Error on POST request:', res.statusText);
                    resolve([]);
                }
            } catch (error) {
                console.error('Error al realizar la solicitud POST:', error);
                resolve([]);
            }
        })
    }, [annParams, CMM_URL])

    // Loop all mz batches
    const requestCMM = useCallback(async () => {
        console.log('Starting request to CMM');

        const fullResCMM = { 'pos': [], 'neg': [] };

        // POSITIVE
        if (annParams.ionValPos !== null) {
            try {
                for (let i = 0; i < mzBatches.pos.length; i++) {
                    const resCMM = await fetchCMM('positive', annParams.posAdd, mzBatches.pos[i], i);
                    fullResCMM.pos = [...fullResCMM.pos, ...resCMM];
                    dispatchResults({
                        type: 'update-cmm-progress',
                        mode: 'pos',
                        done: i + 1,
                        status: 'running'
                    });
                    await new Promise(r => setTimeout(r, TIME_SLEEP));
                }
            } catch (error) {
                console.error("CMM failed. Stopping process.", error);
                dispatchJob({ type: 'set-ann-status', status: 'error' });
                dispatchResults({ type: 'set-cmm-error', mode: 'pos', msg: 'CMM failed in the Positive Mode' });
                clearInterval(getTPRef.current);
            }
            finally {
                dispatchResults({ type: 'finish-cmm-mode', mode: 'pos' });
            }

            try {
                dispatchResults({ type: 'update-tp-progress', mode: 'pos', status: 'running' });
                const resTP = fetch(
                    `${API_URL}/run_turboputative/pos/${jobID}`,
                    {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(fullResCMM.pos),
                    }
                );
            } catch (error) {
                console.error("CMM failed. Stopping process.", error);
                dispatchJob({ type: 'set-ann-status', status: 'error' });
                dispatchResults({ type: 'set-cmm-error', mode: 'pos', msg: 'TP failed in the Positive Mode' });
                clearInterval(getTPRef.current);
            }
        }

        // NEGATIVE
        if (annParams.ionValNeg !== null) {
            try {
                for (let i = 0; i < mzBatches.neg.length; i++) {
                    // setProgress(100 * (i + 1) / mzBatches.neg.length);
                    const resCMM = await fetchCMM('negative', annParams.negAdd, mzBatches.neg[i], i);
                    fullResCMM.neg = [...fullResCMM.neg, ...resCMM];
                    dispatchResults({
                        type: 'update-cmm-progress',
                        mode: 'neg',
                        done: i + 1,
                        status: 'running'
                    });
                    await new Promise(r => setTimeout(r, TIME_SLEEP));
                }

            } catch (error) {
                console.error("CMM failed. Stopping process.", error);
                dispatchJob({ type: 'set-ann-status', status: 'error' });
                dispatchResults({ type: 'set-cmm-error', mode: 'neg', msg: 'CMM failed in the Negative Mode' });
                clearInterval(getTPRef.current);
            }
            finally {
                dispatchResults({ type: 'finish-cmm-mode', mode: 'neg' });
            }

            try {
                dispatchResults({ type: 'update-tp-progress', mode: 'neg', status: 'running' });
                const resTP = fetch(
                    `${API_URL}/run_turboputative/neg/${jobID}`,
                    {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(fullResCMM.neg),
                    }
                );
            } catch (error) {
                console.error("CMM failed. Stopping process.", error);
                dispatchJob({ type: 'set-ann-status', status: 'error' });
                dispatchResults({ type: 'set-tp-error', mode: 'neg', msg: 'TP failed in the Negative Mode' });
                clearInterval(getTPRef.current);
            }
        }
        
        try {
            // Run interval to ask if positive and negative finished
            if (!getTPRef.current) {
                getTPRef.current = setInterval(getTurboPutative, 20000);
            }
        } catch (error) {
            console.error("CMM failed. Stopping process.", error);
            dispatchJob({ type: 'set-ann-status', status: 'error' });
            dispatchResults({ type: 'update-tp-progress', status: 'error' });
            clearInterval(getTPRef.current);
        }
        finally {
            dispatchJob({ type: 'set-ann-status', status: 'ok' });
        }

    }, [annParams, mzBatches, getTPRef, getTurboPutative, API_URL, fetchCMM, jobID, dispatchJob, dispatchResults ]);

    // Start trigger
    useEffect(() => {

        if (!annParams) return;        // do nothing if not configured

        // get and set the CMM && TP results
        if (status === 'ok') {

            dispatchJob({ type: 'set-ann-status', status: 'ok' });

            // get the POSitive results
            if ( annParams?.CMM_pos ) {
                dispatchResults({
                    type: 'set-cmm-totals',
                    pos: {
                        total: mzBatches.pos.length,
                        done: mzBatches.pos.length
                    },
                });
                dispatchResults({ type: 'finish-cmm-mode', mode: 'pos' });
            }
            if ( annParams?.TP_pos ) { dispatchResults({ type: 'finish-tp-mode', mode: 'pos' }) }

            // get the NEG results
            if ( annParams?.CMM_neg ) {
                dispatchResults({
                    type: 'set-cmm-totals',
                    neg: {
                        total: mzBatches.neg.length,
                        done: mzBatches.neg.length
                    },
                });
                dispatchResults({ type: 'finish-cmm-mode', mode: 'neg' });
            }
            if ( annParams?.TP_neg ) { dispatchResults({ type: 'finish-tp-mode', mode: 'neg' }) }


        } else if (status === 'error') {
            dispatchJob({ type: 'set-ann-status', status: 'error' });

        } else if (status === 'idle' ) {

            console.log('CMM triggered from Annotate button');

            // Initialize the status of job
            // Initialize totals when mzBatches changes
            dispatchJob({ type: 'set-ann-status', status: 'waiting' });
            dispatchResults({
                type: 'set-cmm-totals',
                pos: {
                    total: mzBatches.pos.length,
                    done: 0,
                    finished: false
                },
                neg: {
                    total: mzBatches.neg.length,
                    done: 0,
                    finished: false
                }
            });
            dispatchResults({ type: 'init-tp-totals' });

            // Do the work
            requestCMM();

        }
        else { // status => waiting || running
            return;
        }
    }, [annParams, status, mzBatches, requestCMM, dispatchJob, dispatchResults]);



    if (!annParams || status === null) {
        return (
            <Box
                sx={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2
                }}
            >
                <Paper elevation={2} sx={{ p: 3, maxWidth: 420, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Putative Annotation Not Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {"You haven't added Putative Annotation parameters yet."}  
                        Go back to the annotation step and configure the settings to start CMM & TurboPutative.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box
            sx={{
            display: 'flex',
            alignItems: 'center',        // vertical center
            justifyContent: 'center',    // horizontal center
            px: 2                        // small side padding on mobile
            }}
        >
            <Paper
            elevation={3}
            sx={{
                mt: 3,
                p: 2.5,
                maxWidth: 700,
                width: '100%',
                borderRadius: 3,
            }}
            >
            <Stack spacing={2}>

                {status === 'error' && (
                    <Alert severity="error">
                        {loadText}
                    </Alert>
                )}

                {/* ===== HEADER ===== */}
                <Grid container spacing={2}>
                    <Grid item xs={4} textAlign="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                        CMM
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        {loadCMMText}
                        </Typography>
                    </Grid>

                    <Grid item xs={4} textAlign="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                        TurboPutative
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        {loadTPText}
                        </Typography>
                    </Grid>

                    <Grid item xs={4} textAlign="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                        Results
                        </Typography>
                    </Grid>
                </Grid>

                <Divider />

                <Stack spacing={1}>

                    {/* POSITIVE */}
                    {annParams.ionValPos && (
                    <Grid container spacing={2} alignItems="center">

                        {/* CMM POS */}
                        <Grid item xs={4}>
                        <ModeRow
                            label="Positive Mode"
                            done={CMM.pos.done}
                            total={CMM.pos.total}
                            finished={CMM.pos.finished}
                        />
                        </Grid>

                        {/* TP POS */}
                        <Grid item xs={4}>
                        <TPRow status={TP.pos.status} />
                        </Grid>

                        {/* POS LINK */}
                        <Grid item xs={4} textAlign="center">
                        {TP.pos.status === 'ok' ? (
                            <Link
                            target="_blank"
                            underline="hover"
                            href={`${SERVER_URL}/webserver/${jobID}_pos`}
                            >
                            View POS Results
                            </Link>
                        ) : (
                            <Typography variant="caption" color="text.secondary">
                            —
                            </Typography>
                        )}
                        </Grid>
                    </Grid>
                    )}

                    {/* NEGATIVE */}
                    {annParams.ionValNeg && (
                    <Grid container spacing={2} alignItems="center">

                        {/* CMM NEG */}
                        <Grid item xs={4}>
                        <ModeRow
                            label="Negative Mode"
                            done={CMM.neg.done}
                            total={CMM.neg.total}
                            finished={CMM.neg.finished}
                        />
                        </Grid>

                        {/* TP NEG */}
                        <Grid item xs={4}>
                        <TPRow status={TP.neg.status} />
                        </Grid>

                        {/* NEG LINK */}
                        <Grid item xs={4} textAlign="center">
                        {TP.neg.status === 'ok' ? (
                            <Link
                            target="_blank"
                            underline="hover"
                            href={`${SERVER_URL}/webserver/${jobID}_neg`}
                            >
                            View NEG Results
                            </Link>
                        ) : (
                            <Typography variant="caption" color="text.secondary">
                            —
                            </Typography>
                        )}
                        </Grid>

                    </Grid>
                    )}

                </Stack>

                <Divider />

            </Stack>
            </Paper>

        </Box>
    );
}

function ModeRow({ label, done, total, finished }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {done} / {total} batches
        </Typography>
      </Box>

      {finished ? (
        <Chip
          icon={<CheckCircleIcon />}
          label="Done"
          size="small"
          color="success"
          variant="outlined"
        />
      ) : (
        <Chip
          icon={<HourglassTopIcon />}
          label="Processing"
          size="small"
          color="warning"
          variant="outlined"
        />
      )}
    </Paper>
  );
}

function TPRow({ status }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography variant="body2" fontWeight={500}>
        TurboPutative
      </Typography>

      {status === 'ok' ? (
        <Chip
          icon={<CheckCircleIcon />}
          label="Done"
          size="small"
          color="success"
          variant="outlined"
        />
      ) : status === 'running' ? (
        <Chip
          icon={<HourglassTopIcon />}
          label="Processing"
          size="small"
          color="warning"
          variant="outlined"
        />
      ) : status === 'error' ? (
        <Chip
          label="Error"
          size="small"
          color="error"
          variant="outlined"
        />
      ) : (
        <Chip
          label="Waiting"
          size="small"
          variant="outlined"
        />
      )}
    </Paper>
  );
}


export default CMMTP

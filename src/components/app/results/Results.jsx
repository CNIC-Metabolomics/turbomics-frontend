import { useCallback, useEffect, useRef, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useJob } from '../JobContext';
import DataDistribution from './EDA/DataDistribution/DataDistribution';
import { useDispatchResults, useResults } from '../ResultsContext';
import { CircularProgress, Grid } from '@mui/material';
import { useVars } from '@/components/VarsContext';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

import dynamic from 'next/dynamic'

const CMMTP = dynamic(
    () => import('./CMMTP/CMMTP')
);
const PCA = dynamic(
    () => import('./EDA/PCA/PCA')
);
const MOFA = dynamic(
    () => import('./MOFA/MOFA')
);
const GSEA = dynamic(
    () => import('./GSEA/GSEA')
);
const PWA = dynamic(
    () => import('./PWA/PWA')
);

export default function Results() {

    const dispatchResults = useDispatchResults();

    const { API_URL } = useVars();

    const fetchRef = useRef();

    const savedStatus = useResults().status;
    const [status, setStatus] = useState(savedStatus);

    const savedValue = useResults().value; // TabValue
    const [value, setValue] = useState(savedValue);

    const { jobID, omics, annParams, annStatus } = useJob();

    const [ pwaJob, setPwaJob ] = useState(null); // contains the ID/Status of Pathway Integrative Analysis Job

    const handleChange = (event, newValue) => {
        setValue(newValue);
        dispatchResults({ type: 'set-tab-value', value: newValue });
    };

    const fetchStatus = useCallback(async () => {
        const res = await fetch(`${API_URL}/get_status/${jobID}/${omics.join('')}`);
        const resJson = await res.json();

        // If there is any change set it
        if (
            Object.keys(status).some(e => status[e].status != resJson[e].status)
        ) {
            setStatus(resJson);
            dispatchResults({ type: 'set-status', status: resJson });
        }

        // If there is no waiting status, clear interval
        if (
            Object.keys(resJson).every(e => resJson[e].status != 'waiting')
        ) {
            clearInterval(fetchRef.current);
        }
    }, [API_URL, jobID, fetchRef, dispatchResults, status, omics]);

    // Initialize fetchStatus
    useEffect(() => {
        if (
            Object.keys(savedStatus).some(e => savedStatus[e].status == 'waiting')
        ) {
            fetchRef.current = setInterval(fetchStatus, 2500);
            return () => clearInterval(fetchRef.current);
        }
    }, [fetchRef, fetchStatus, savedStatus]);

    // Start importing of MetaboID
    // Load MetaboID and load
    useEffect(() => {
        import('@/utils/MetaboID.json').then(data => {
            dispatchResults({ type: 'set-pwa-attr', attr: 'MetaboID', value: data });
        });
    }, [dispatchResults]);

    // Add Putative annotations or not
    useEffect(() => {
        if (annStatus ) {
            setValue(0.1); // switch to CMMTP tab
            dispatchResults({ type: 'set-tab-value', value: 0.1 });
        }
    }, [annParams, dispatchResults]);


    return (
        <Box
            sx={{ display: 'flex', flexGrow: 1, bgcolor: 'background.paper' }}
        >
            <Box sx={{ width: '15%', borderRight: 1, borderColor: 'divider' }}>
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Results Sections Tabs"
                    sx={{ width: '15%', position: 'fixed' }}
                >
                    { annParams &&
                        <Tab
                            label={<TabComponent text='PUTATIVE ANNOTATION' status={annStatus} />}
                            value={0.1}
                            sx={{ fontSize: 12, mt: 2, p: 0 }}
                        />
                    }

                    <Tab
                        label={<TabComponent text='DATA DISTRIBUTION' status='' />}
                        value={0.2}
                        sx={{ fontSize: 12, m: 0, p: 0 }}
                    />

                    <Tab
                        label={<TabComponent text='PCA' status={status.EDA_PCA.status} />}
                        value={0.3}
                        sx={{ fontSize: 12, m: 0, p: 0 }}
                        disabled={status.EDA_PCA.status != 'ok'}
                    />

                    <Tab
                        label={<TabComponent text='MULTIOMICS FACTOR ANALYSIS' status={status.MOFA.status} />}
                        value={1.1}
                        sx={{ fontSize: 12, mt: 0, p: 0 }}
                        disabled={status.MOFA.status != 'ok'}
                    />

                    <Tab
                        label={<TabComponent text='ENRICHMENT ANALYSIS' status='' />}
                        value={2.1}
                        sx={{ fontSize: 12, m: 0, p: 0 }}
                        disabled={false}
                    />

                    <Tab
                        label={<TabComponent text='PATHWAY INTEGRATIVE ANALYSIS' status={pwaJob?.status} />}
                        value={3.1}
                        sx={{ fontSize: 12, m: 0, p: 0 }}
                        disabled={false}
                    />

                </Tabs>
            </Box>

            <Box sx={{ width: '85%', borderTop: '1px solid #cccccc' }}>
                {value == 0.1 && annParams && <Box sx={{ p: 1 }}><CMMTP /></Box>}
                {value == 0.2 && <Box sx={{ p: 1 }}><DataDistribution /></Box>}
                {value == 0.3 && <Box sx={{ p: 1 }}><PCA /></Box>}
                {value == 1.1 && <Box sx={{ p: 1 }}><MOFA /></Box>}
                {value == 2.1 && <Box sx={{ p: 1 }}><GSEA /></Box>}
                {value == 3.1 && <Box sx={{ p: 1 }}><PWA pwaJob={pwaJob} setPwaJob={setPwaJob} /></Box>}
            </Box>
        </Box>
    );
}

const TabComponent = ({ text, status }) => {
    return (
        <Grid container sx={{ m: 'auto', height: 55 }}>
            {(status == 'waiting' || status == 'error') &&
                <Box sx={{ position: 'absolute', height: '100%' }}>
                    <Box sx={{ height: 20, position: 'relative', top: '35%', left: 20 }}>
                        {status == 'waiting' &&
                            <CircularProgress
                                sx={{ verticalAlign: 'middle' }}
                                size={15}
                                thickness={5}
                            />
                        }
                        {
                            status == 'error' &&
                            <ErrorOutlineOutlinedIcon />
                        }
                    </Box>
                </Box>
            }
            <Typography sx={{ m: 'auto', width: "85%", fontSize: 13, position: 'relative', right: -12 }}>
                {text}
            </Typography>
        </Grid>
    )
}
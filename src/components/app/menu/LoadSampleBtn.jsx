import { useVars } from '@/components/VarsContext'
import React, { useState } from 'react'
import { Box, Link, IconButton, Tooltip } from '@mui/material'
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline'
import { useDispatchJob } from '../JobContext'
import MultiAssayExperiment from '../newJob/MultiAssayExperiment'
import { tsvToDanfo } from "../../../utils/tsvToDanfo.js";
import LoadingOverlay from '../LoadingOverlay'

export default function LoadSampleBtn() {

    const { API_URL } = useVars();
    const dispatchJob = useDispatchJob();

    const [loading, setLoading] = useState(false);
    const [logMsg, setLogMsg] = useState('');

    /**
     * Load sample data
     */
    const handleLoadSample = async (e, sample) => {
        e.preventDefault()
        console.log(`Loading sample data: ${sample}`)

        setLoading(true)
        setLogMsg(`Requesting sample ${sample} data...`)

        try {
            // get the files to load the sample data
            const res = await fetch(
                `${API_URL}/load_sample_data?sample=${sample}`
            )
            if (!res.ok) {
                throw new Error('Failed to load sample data')
            }
            const resJson = await res.json()

            // clean all inputs
            setLogMsg('Cleaning existing inputs...')
            dispatchJob({ type: 'delete-all-files' })

            // Set organism if present
            if (resJson.organism) {
                dispatchJob({
                    type: 'set-os',
                    OS: resJson.organism
                });
            }

            // load the files
            setLogMsg('Loading files into the app...');
            for (const key of Object.keys(resJson)) {
                if (key === "organism") continue; // ignore this key. it is already used for "set-os"
                const item = resJson[key];
                const name = item.name;
                const data = item.data;
                const transpose = item.transpose;
                // convert the TSV to Json and transpose if apply
                const [dfJson, idCol] = await tsvToDanfo(data, '\t', transpose);
                // dispache the job
                dispatchJob({
                    type: 'user-upload',
                    fileType: key,
                    userFileName: name,
                    dfJson: dfJson,
                    idCol: idCol
                });
            }

            setLogMsg('Sample data loaded successfully.')
        } catch (err) {
            console.error('Error loading sample data:', err)
            setLogMsg('Error loading sample data.')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Download sample data
     */
    const handleDownloadSample = async (sample, fileName) => {
        console.log(`Downloading sample data: ${sample}`)

        try {
            const res = await fetch(
                `${API_URL}/download_sample_data?sample=${sample}`
            )

            if (!res.ok) {
                throw new Error('Failed to download sample data')
            }

            const blob = await res.blob()
            const href = window.URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = href
            link.setAttribute('download', fileName)

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            window.URL.revokeObjectURL(href)

        } catch (err) {
            console.error('Error downloading sample data:', err)
        }
    }

    return (
        <Box sx={{ position: 'relative', top: 60 }}>

        {/* Loading overlay */}
        <LoadingOverlay
            open={loading}
            logMessage={logMsg}
        />

            {/* Untarget Data (sample = 1) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Tooltip title="Download the Untarget Metabolomic sample data">
                    <IconButton
                        onClick={() =>
                            handleDownloadSample(1, 'SampleData_Untarget.zip')
                        }
                        size="small"
                        color="primary"
                        disabled={loading}
                    >
                        <DownloadForOfflineIcon />
                    </IconButton>
                </Tooltip>

                <Link
                    href="#"
                    onClick={(e) => handleLoadSample(e, 1)}
                    underline="hover"
                    sx={{ pointerEvents: loading ? 'none' : 'auto' }}
                >
                    Load the Untarget Metabolomic sample data
                </Link>
            </Box>

            {/* Target Data (sample = 2) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Tooltip title="Download the Target Metabolomic sample data">
                    <IconButton
                        onClick={() =>
                            handleDownloadSample(2, 'SampleData_Target.zip')
                        }
                        size="small"
                        color="primary"
                        disabled={loading}
                    >
                        <DownloadForOfflineIcon />
                    </IconButton>
                </Tooltip>

                <Link
                    href="#"
                    onClick={(e) => handleLoadSample(e, 2)}
                    underline="hover"
                    sx={{ pointerEvents: loading ? 'none' : 'auto' }}
                >
                    Load the Target Metabolomic sample data
                </Link>
            </Box>

            {/* Upload Data from R */}
            <Box sx={{ display: 'flex', alignItems: 'right', gap: 1 }}>
                <MultiAssayExperiment />
            </Box>
        </Box>
    )
}

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  CircularProgress
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function CustomPathwaysSelector({
    disabled = false,
    value = [],
    onChange,

    apiUrl,
    jobID
}) {

    const [pathways, setPathways] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);


  // GET: fetch pathways
  const fetchPathways = async () => {

    if (!apiUrl || !jobID) return;

        try {
            setLoading(true);
            setError(null);
            const res = await fetch(
                `${apiUrl}/get_custom_pathway/${jobID}`
            );
            if (!res.ok) {
                throw new Error("Fetch failed");
            }
            const data = await res.json();
            // Expect: { status:'ok', pathways:[...] }
            setPathways(data.pathways || []);

        } catch (err) {
            console.error(err);
            setError("Could not load pathways");

        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchPathways();
    }, [apiUrl, jobID]);


    // POST: upload file
    const handleUpload = async (e) => {

        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];

        setUploadedFile(file);

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(
                `${apiUrl}/upload_custom_pathway/${jobID}`,
                {
                method: "POST",
                body: formData
                }
            );

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            // Refresh after upload
            await fetchPathways();

        } catch (err) {
            console.error(err);
            setError("Upload failed");

        } finally {
            setUploading(false);
        }
    };

    const handleChange = (event) => {
        onChange?.(event.target.value);
    };


    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2
            }}
        >
            <Typography variant="h6" textAlign="center">
                Complement the analysis with your Pathways (Optional)
            </Typography>

            {/* Loading */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress size={24} />
                </Box>
            )}

            {/* Error */}
            {error && (
                <Typography color="error" variant="body2">
                {error}
                </Typography>
            )}

            {/* Upload */}
            <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                disabled={disabled || uploading}
                fullWidth
            >
                {uploading ? "Uploading..." : "Upload New Pathway"}
                <input
                    hidden
                    type="file"
                    accept=".tsv,.gmt"
                    onChange={handleUpload}
                />
            </Button>

            {/* Uploaded file */}
            {uploadedFile && (
                <Typography
                    variant="body2"
                    sx={{ wordBreak: "break-all", textAlign: "center" }}
                >
                    Uploaded: {uploadedFile.name}
                </Typography>
            )}

            {/* Selector */}
            <FormControl fullWidth disabled={disabled || loading}>
                <InputLabel id="custom-pathways-label">Select Pathways</InputLabel>
                <Select
                    labelId="custom-pathways-label"
                    multiple
                    value={value}
                    label="Select Pathways"
                    onChange={handleChange}
                    renderValue={(selected) =>
                        selected
                            .map(file =>
                                pathways.find(p => p.file === file)?.name || file
                            )
                            .join(", ")
                    }
                >
                    {pathways.map(p => (
                        <MenuItem key={p.file} value={p.file} >
                            {p.name}
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText>Choose your custom pathways</FormHelperText>
            </FormControl>

        </Paper>
    );
}

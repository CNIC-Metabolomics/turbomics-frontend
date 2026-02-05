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

/*
  CustomPathwaysSelector
  ----------------------
  - Fetches pathway files from REST API
  - Allows multi-select
  - Allows upload
  - Refreshes list after upload

  Required backend endpoints:
  GET  /api/get_custom_pathways
  POST /api/upload_custom_pathway

  Response format (example):
  [
    { id: 1, name: "pathway1.txt" },
    { id: 2, name: "custom.csv" }
  ]
*/

export default function CustomPathwaysSelector({
  disabled = false,
  value = [],
  onChange
}) {
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  /* ---------------------------------- */
  /* Fetch pathways from backend        */
  /* ---------------------------------- */
  const fetchPathways = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/get_custom_pathways");

      if (!res.ok) {
        throw new Error("Failed to fetch pathways");
      }

      const data = await res.json();

      setPathways(data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load pathways");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------- */
  /* Initial load                       */
  /* ---------------------------------- */
  useEffect(() => {
    fetchPathways();
  }, []);

  /* ---------------------------------- */
  /* Handle upload                      */
  /* ---------------------------------- */
  const handleUpload = async (e) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    setUploadedFile(file);

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload_custom_pathway", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      // Reload list
      await fetchPathways();
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------------------------- */
  /* Handle select change               */
  /* ---------------------------------- */
  const handleChange = (event) => {
    const newValue = event.target.value;

    if (onChange) {
      onChange(newValue);
    }
  };

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */
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
        Upload Pathway Data (Optional)
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

      {/* Multi Select */}
      <FormControl fullWidth disabled={disabled || loading}>
        <InputLabel id="custom-pathways-label">
          Select Pathways
        </InputLabel>

        <Select
          labelId="custom-pathways-label"
          multiple
          value={value}
          label="Select Pathways"
          onChange={handleChange}
          renderValue={(selected) =>
            selected
              .map((id) => pathways.find((p) => p.id === id)?.name)
              .filter(Boolean)
              .join(", ")
          }
        >
          {pathways.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>

        <FormHelperText>
          Choose one or more custom pathway files
        </FormHelperText>
      </FormControl>

      {/* Upload Button */}
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadFileIcon />}
        disabled={disabled || uploading}
        fullWidth
      >
        {uploading ? "Uploading..." : "Upload New File"}

        <input
          hidden
          type="file"
          onChange={handleUpload}
        />
      </Button>

      {/* Uploaded file name */}
      {uploadedFile && (
        <Typography
          variant="body2"
          sx={{ wordBreak: "break-all", textAlign: "center" }}
        >
          Uploaded: {uploadedFile.name}
        </Typography>
      )}
    </Paper>
  );
}

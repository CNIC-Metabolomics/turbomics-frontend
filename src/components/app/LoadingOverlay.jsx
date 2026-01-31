// LoadingOverlay.jsx
import React from 'react'
import { Backdrop, Box, CircularProgress } from '@mui/material'

export default function LoadingOverlay({ open, message, logMessage }) {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <Box>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          {message}
        </Box>
        {logMessage && (
          <Box sx={{ mt: 0, textAlign: 'center' }}>
            {logMessage}
          </Box>
        )}
      </Box>
    </Backdrop>
  )
}

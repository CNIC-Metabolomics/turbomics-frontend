import { Autocomplete, Box, TextField } from "@mui/material";
import { useDispatchJob, useJob } from "../JobContext";

const { os } = require('@/utils/os');
const { useState } = require("react");

function MyAutocomplete() {

    let initOS = useJob().OS;

    const [expOS, setExpOS] = useState(initOS);
    const dispatchJob = useDispatchJob();

    const handleInput = (e, newValue) => {
        setExpOS(newValue);
        dispatchJob({ type: 'set-os', OS: newValue });
    }

    return (
        <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%' }}>
            <Box sx={{ width: 300 }}>
                <Autocomplete
                    id="virtualize-demo"
                    sx={{ width: 300 }}
                    disableListWrap
                    value={expOS}
                    onChange={(e, newValue) => handleInput(e, newValue)}
                    options={os}
                    renderInput={(params) => <TextField {...params} label="Organism" />}
                    renderOption={(props, option) => {
                        return (
                            <li {...props} key={option.id}>
                                {option.label}
                            </li>
                        );
                    }}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                />
            </Box>
        </Box>
    )
}

export default MyAutocomplete
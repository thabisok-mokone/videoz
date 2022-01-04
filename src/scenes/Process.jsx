import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';


const Process = ()=> {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [output , setOutput] = React.useState("");
    const [processing , setProcessing] = React.useState(true);

    const [dataLog , setDataLog] = React.useState("");
    const [progress , setProgress] = React.useState(0);

    const [header , setHeader] = React.useState("Processing...");

    const outputLog = React.useRef(null);

    React.useEffect(()=>{
        window.api.callEvent('process', state.data);

        window.api.addListener('processing', (data)=>{
            if (data.log) {
                setDataLog(data.log);
            }
            if (data.progress && (state.data.container=="mp4"||state.data.container=="webm")) {
                setProgress(parseInt(data.progress));
            }
        });

        window.api.addListener('processed', (data)=>{
            window.api.removeListener('processed');
            window.api.removeListener('processing');
            if (data) {
                setProcessing(false);
                setProgress(100);
                setHeader("Processing is complete");
            } else {
                navigate("/", { replace: true});
            }
        });

    }, []);
    
    React.useEffect(()=>{
        setOutput(output + dataLog);
        outputLog.current.scrollTop = outputLog.current.scrollHeight;
    }, [dataLog]);

    return (
        <div className="Process" style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
        }}>
            <Stack spacing={6}>
                <Typography variant="h4" align="center" color="primary">{header}</Typography>
                <TextField
                    inputRef={outputLog}
                    fullWidth
                    variant="outlined"
                    label="Output"
                    multiline
                    rows={5}
                    value={output}
                    inputProps={{readOnly: true, disabled: true}}
                />
                <Stack spacing={2}>
                    <Typography variant="h4" align="center" color="primary">{progress+ "%"}</Typography>
                    <LinearProgress variant="determinate" value={progress} />
                </Stack>
                <Stack spacing={2}>
                {processing?
                    <Button fullWidth variant="contained" color="error" onClick={()=>{
                        window.api.callEvent('cancel');
                    }}>Cancel</Button>
                :
                    <Button fullWidth variant="contained" onClick={()=>{
                        navigate("/", { replace: true});
                    }}>Finish</Button>
                }
                {!processing?
                    <Button fullWidth variant="contained" onClick={()=>{
                        navigate("/editor", { replace: true, state: state.editorState});
                    }}>Back</Button>
                :
                    null
                }
                </Stack>
                
            </Stack> 
            
        </div>
    );
  }

  export default Process;




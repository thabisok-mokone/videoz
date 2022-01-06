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

    const [output , setOutput] = React.useState([]);
    const [processing , setProcessing] = React.useState(true);

    const [dataLog , setDataLog] = React.useState("");
    const [progress , setProgress] = React.useState(0);

    const [header , setHeader] = React.useState("Processing...");

    const [elapsedTime , setElapsedTime] = React.useState(0);
    const [currentTime , setCurrentTime] = React.useState(Math.round(Date.now() / 1000));
    const [remainingTime , setRemainingTime] = React.useState(0);

    const outputLog = React.useRef(null);

    const updateTime = (progress)=>{
        let current = Math.round(Date.now() / 1000);
        let elapsed = current - currentTime;
        setCurrentTime(current);
        setElapsedTime(elapsed);

        let timePerPercent = elapsed/progress;
        if (isFinite(timePerPercent) && !isNaN(timePerPercent)) {
            let remaining = (100 - progress) * timePerPercent;
            setRemainingTime(remaining);
        }
    }

    const toHMS = (value)=> {  
        return new Date(value * 1000).toISOString().substr(11, 8);
    }

    React.useEffect(()=>{
        window.api.callEvent('process', state.data);

        window.api.addListener('processing', (data)=>{
            if (data.log) {
                setDataLog(data.log);
            }
            if (data.progress && (state.data.container=="mp4"||state.data.container=="webm")) {
                setProgress(parseInt(data.progress));
            }
            updateTime(data.progress);
        });

        window.api.addListener('processed', (data)=>{
            window.api.removeListener('processed');
            window.api.removeListener('processing');
            if (data) {
                setProcessing(false);
                setProgress(100);
                setRemainingTime(0);
                setHeader("Processing is complete");
            } else {
                navigate("/", { replace: true});
            }
        });

    }, []);
    
    React.useEffect(()=>{
        if (output.length<4) {
            let newOutput = output;
            newOutput.push(dataLog);
            setOutput(newOutput);
        } else {
            let newOutput = output;
            newOutput.push(dataLog);
            newOutput = newOutput.slice(1, newOutput.length)
            setOutput(newOutput);
        }
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
                    value={output.join('')}
                    inputProps={{readOnly: true, disabled: true}}
                />
                <Stack spacing={2}>
                    <Typography variant="h4" align="center" color="primary">{progress+ "%"}</Typography>
                    <LinearProgress variant="determinate" value={progress} />
                </Stack>
                <Stack spacing={6} direction="row">
                    <TextField fullWidth label="Elapsed time" variant="outlined" value={toHMS(elapsedTime)}  inputProps={{ readOnly: true, disabled: true }} />
                    <TextField fullWidth label="Remaining time" variant="outlined" value={toHMS(remainingTime)}  inputProps={{ readOnly: true, disabled: true }} />
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




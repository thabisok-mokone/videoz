import * as React from "react";
import { useNavigate } from "react-router-dom";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
 
const Initial = ()=> {
    const navigate = useNavigate();

    React.useEffect(()=>{

        window.api.addListener('selected-files', (data)=>{
            if (data.length>0) {
                window.api.removeListener('selected-files');
                navigate("/editor", { replace: true, state: {selectedVideos:data}});
            }
        });

    }, []);

    return (
        <div className="Initial" style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
        }}>
        <Card>
            <CardContent sx={{
                margin: "2rem"
            }}>
            <Stack 
                spacing={2} 
                divider={<Divider orientation="horizontal" flexItem />}
            >
            <Typography 
                variant="h1"
                align="center"
                color="primary"
            >
                Videoz
            </Typography>
            <Button 
                style={{
                    padding:"1em"
                }}
                variant="contained"
                color="primary"
                onClick={()=>{
                    window.api.callEvent("select-files");
                }}
            >
                SELECT FILE OR FILES
            </Button>
            </Stack>
            </CardContent>
        </Card>
        </div>
    );
  }

  export default Initial;




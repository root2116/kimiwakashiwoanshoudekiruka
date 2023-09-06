import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import { Container, FormControl, InputLabel, MenuItem, Select, Grid, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';


function normalizeLyrics(lyrics) {
    // 空白、改行、記号などを除去して、日本語と英数字のみを残す
    return lyrics.replace(/\s+|[\-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '');
}


async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
}


function App() {
    
    return (
        <Container maxWidth="sm">
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <h1>君は歌詞を暗唱できるか？</h1>
                </Grid>
                <Grid item>
                    <Screen />
                </Grid>
            </Grid>
        </Container>
    )
}

function Screen() {
    const [items, setItems] = useState([]);
    const [title, setTitle] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [isSelected, setIsSelected] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/titles');
                const data = await response.json();
                setItems(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, []);

    async function handleButtonClick() {

        const normalized = normalizeLyrics(lyrics);
        console.log(normalized);
        // 正規化した歌詞からハッシュ値を計算
        const hashValue = await sha256(normalized);
        

        try {
            
            const response = await fetch('/submit', {   // Adjust the endpoint URL accordingly
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hash: hashValue, title: title })   // Send both title and lyrics
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(result);
            if (result.success) {
                if (result.message === "yes") {
                    setDialogMessage("正解！");
                } else {
                    setDialogMessage("違います");
                }
                setOpenDialog(true);
            }
            

        } catch (error) {
            console.error('Error submitting lyrics:', error);
        }
    }

    function handleStartOver() {
        setOpenDialog(false);
        setLyrics('');  // オプション：ポップアップを閉じるときに歌詞をクリアする
    }

    function handleContinue() {
        setOpenDialog(false);
       
    }

    return (

        <Grid container direction="column" spacing={2} alignItems="flex-end">
            <Dialog open={openDialog} onClose={handleContinue}>
                <DialogTitle>{dialogMessage}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogMessage === "正解！" ? "君は『"+title+"』の歌詞を暗唱できた。" : "もう一度暗唱してみてください。"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleStartOver} color="primary">
                        もう一度最初から暗唱する
                    </Button>
                    <Button onClick={handleContinue} color="primary">
                        続けて暗唱する
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid item style={{ width: '100%', height: '100%' }}>
                <FormControl fullWidth>
                    <InputLabel >曲名</InputLabel>
                    <Select
                        value={title}
                        label="Title"
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setIsSelected(true);
                        }}
                    >
                        {items.map((item) => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item style={{ width: '100%', height: '100%' }}>
                <TextField 
                    variant="outlined" 
                    fullWidth 
                    label="歌詞" 
                    multiline 
                    rows={16} 
                    value={lyrics}  
                    onChange={(e) => setLyrics(e.target.value)}  
                />
            </Grid>

            <Grid item>
                <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    disabled={!isSelected}
                    onClick={handleButtonClick}
                     >
                    判定
                </Button>
            </Grid>
        </Grid>
    )
}





export default App;


import React, { useState, useEffect } from 'react';
import { Container, FormControl, InputLabel, MenuItem, Select, Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { normalizeLyrics, sha256 } from './utils';

function ReciteFullLyrics(props) {
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

        <Grid container direction="column" spacing={2} >
            <Dialog open={openDialog} onClose={handleContinue}>
                <DialogTitle>{dialogMessage}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogMessage === "正解！" ? "君は『" + title + "』の歌詞を暗唱できた。" : "まだまだだね。"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.resetMode} color="primary">
                        ホームへ
                    </Button>
                    <Button onClick={handleStartOver} color="primary">
                        最初から
                    </Button>
                    <Button onClick={handleContinue} color="primary">
                        続ける
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

                <Grid container direction="row" spacing={2} justifyContent="space-between">


                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={props.resetMode}
                        >
                            戻る
                        </Button>
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
                
            </Grid>
        </Grid>
    )
}




export default ReciteFullLyrics;
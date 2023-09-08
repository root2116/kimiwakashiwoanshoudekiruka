import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';

import { Container,  Grid, } from '@mui/material';
import ReciteFullLyrics from './ReciteFullLyrics';
import FillinLyrics from './FillinLyrics';
import AnswerTitle from './AnswerTitle';

import Button from '@mui/material/Button';

function App() {
    
    const [selectedMode, setSelectedMode] = useState(null);

    const renderModeComponent = () => {
        switch (selectedMode) {
            case 'recite':
                return <ReciteFullLyrics resetMode={() => setSelectedMode(null)} />;
            case 'fillin':
                return <FillinLyrics resetMode={() => setSelectedMode(null)} />;
            case 'answer':
                return <AnswerTitle resetMode={() => setSelectedMode(null)} />;
            default:
                return null;
        }
    }
    

    return (
        <Container maxWidth="sm">
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <h1>君は歌詞を暗唱できるか？</h1>
                </Grid>
                <Grid item>
                    {!selectedMode ? (
                        <Grid container direction="column" spacing={2}>
                            <Grid item xs={12}>
                                <Button variant="contained" fullWidth onClick={() => setSelectedMode('recite')}>歌詞全文暗唱</Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" fullWidth onClick={() => setSelectedMode('fillin')}>歌詞穴埋め</Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" fullWidth onClick={() => setSelectedMode('answer')}>曲名当て</Button>

                            </Grid>
                        </Grid>
                    ) : (
                        renderModeComponent()
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}




export default App;

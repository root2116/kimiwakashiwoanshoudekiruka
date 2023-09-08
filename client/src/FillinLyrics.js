import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Grid, Divider } from '@mui/material';
import { Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InputAdornment from '@mui/material/InputAdornment';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';


import CloseIcon from '@mui/icons-material/Close';
function FillinLyrics(props) {
    const [lyrics, setLyrics] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [answerHistory, setAnswerHistory] = useState([]);

    useEffect(() => {
        // サーバーから歌詞を取得
        fetch('/fillin')
            .then(response => response.json())
            .then(data => {

                setLyrics(data);
                console.log(data);

            })
            .catch(error => console.error('Error fetching lyrics:', error));
    }, []);

    const handleConfirm = () => {
        // ここで確定ボタンを押したときの処理を書く
        // 例: userAnswerとlyrics[currentIndex].titleが一致しているか確認
        if (userAnswer === lyrics[currentIndex].parts[1]) {
            setFeedback(true);
            setCorrectCount(prevCount => prevCount + 1);
        } else {
            setFeedback(false);
        }

    }

    const handleNext = () => {
        const history = {
            questionNumber: currentIndex + 1,
            title: lyrics[currentIndex].title,
            lyric: lyrics[currentIndex].parts[0] + "【 】" + lyrics[currentIndex].parts[2],
            userAnswer: userAnswer,
            correctAnswer: lyrics[currentIndex].parts[1],
            isCorrect: feedback
        };

        setAnswerHistory(prevHistory => [...prevHistory, history]);

        if (currentIndex === 2) { // 0-indexedなので、2は3問目
            setOpenDialog(true);
        }
        else {
            setFeedback(null);
            setCurrentIndex(prevIndex => prevIndex + 1);
            setUserAnswer('');
        }


    }

    const handleRestart = () => {

        fetch('/fillin')
            .then(response => response.json())
            .then(data => {
                setLyrics(data);
                console.log(data);
            })
            .catch(error => console.error('Error fetching lyrics:', error));


        setCorrectCount(0);
        setAnswerHistory([]);
        setCurrentIndex(0);
        setUserAnswer('');
        setFeedback(null);
        setOpenDialog(false);
    };




    return (
        <Grid container direction="column" spacing={2}>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>3問中{correctCount}問正解！</DialogTitle>
                <DialogContent>
                    {answerHistory.map((item, index) => (
                        <Grid container key={index} direction="column" spacing={1} style={{ marginBottom: '16px' }}>
                            <Grid item>
                                <Typography variant="body1"><strong>問題{item.questionNumber}</strong></Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1"><strong>曲名:</strong> {item.title}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1"><strong>歌詞:</strong> {item.lyric}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1"><strong>入力:</strong> {item.userAnswer}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1"><strong>正答:</strong> {item.correctAnswer}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1">
                                    <strong>正誤:</strong>
                                    {/* ここに正誤を示すロジックが必要。例えば: */}
                                    {item.isCorrect === true && <CheckCircleIcon color="success" style={{ verticalAlign: 'middle' }} />}
                                    {item.isCorrect === false && <CloseIcon color="error" style={{ verticalAlign: 'middle' }} />}
                                </Typography>
                            </Grid>
                            <Divider />
                        </Grid>
                    ))}
                </DialogContent>
                <DialogActions style={{ justifyContent: 'space-between', padding: '16px 24px' }}>
                    <Button onClick={handleRestart} color="primary">
                        もう一度
                    </Button>
                    <Button onClick={props.resetMode} color="primary">
                        ホームへ
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid item>
                {lyrics[currentIndex]  && <Typography variant="h6">{currentIndex + 1}問目: {lyrics[currentIndex].title}</Typography>}
            </Grid>
            <Divider />
            <Grid item>
                {lyrics[currentIndex] && <Typography variant="h5">{lyrics[currentIndex].parts[0] + "【 】" + lyrics[currentIndex].parts[2]}</Typography>}
            </Grid>
            <Grid item>
                <Grid container direction="row" spacing={1} >
                    <Grid item xs={10}>
                        <TextField
                            fullWidth
                            label="歌詞を入力"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {feedback === true && <CheckCircleIcon color="success" />}
                                        {feedback === false && <CloseIcon color="error" />}
                                    </InputAdornment>
                                ),
                            }}

                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleConfirm}
                            style={{ height: '56px' }}

                        >
                            解答
                        </Button>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item>
                <Typography variant="h6">
                    {feedback != null && "正解: " + lyrics[currentIndex].parts[1]}
                    　
                </Typography>
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
                            ホーム
                        </Button>
                    </Grid>

                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleNext}
                            disabled={feedback === null}
                        >
                            次へ
                        </Button>
                    </Grid>

                </Grid>
            </Grid>
        </Grid>

    );
}

export default FillinLyrics;
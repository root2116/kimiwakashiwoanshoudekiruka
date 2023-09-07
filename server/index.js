const express = require('express');
const app = express();
const PORT = process.env.PORT || 4600;
const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

// ミドルウェア
app.use(express.json()); // リクエストのボディをJSONとして解析
app.use(express.static(path.join(__dirname, '../client/build')));



app.get('/titles', (req, res) => {
    fs.readFile(path.join(__dirname, 'lyrics.csv'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the CSV file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // CSVを解析
        const parsedData = Papa.parse(data, { header: true, skipEmptyLines: true });

        // titleのみの配列を抽出
        const titles = parsedData.data.map(row => row.title);

        // JSON形式でレスポンスを返す
        res.json(titles);
    });
});

app.post('/submit', (req, res) => {
    const { hash, title } = req.body;


    // CSVファイルを読み込む
    const csvData = fs.readFileSync(path.join(__dirname, 'lyrics.csv'), 'utf8');

    // CSVデータをパースする
    const results = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
    });

    // titleが一致するレコードを探す
    const matchingRecord = results.data.find(record => record.title === title);

    // titleが一致するレコードが見つかった場合、hashを比較
    if (matchingRecord) {
        if (matchingRecord.hash === hash) {
            return res.json({ success: true, message: 'yes' });
        } else {
            return res.json({ success: true, message: 'no' });
        }
    } else {
        return res.status(404).json({ success: false, message: 'Title not found' });
    }
});



app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// 404エラーハンドラ
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

// 一般的なエラーハンドラ
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

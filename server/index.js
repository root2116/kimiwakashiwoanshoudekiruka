const express = require('express');
const app = express();
const PORT = process.env.PORT || 4600;
const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');
const levenshtein = require('fast-levenshtein');

// ミドルウェア
app.use(express.json()); // リクエストのボディをJSONとして解析
app.use(express.static(path.join(__dirname, '../client/build')));



app.get('/api/titles', (req, res) => {
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

app.post('/api/submit', (req, res) => {
    const { lyrics, title } = req.body;


    // CSVファイルを読み込む
    const csvData = fs.readFileSync(path.join(__dirname, 'lyrics_.csv'), 'utf8');

    // CSVデータをパースする
    const results = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
    });

    // titleが一致するレコードを探す
    const matchingRecord = results.data.find(record => record.title === title);

    // titleが一致するレコードが見つかった場合、レーベンシュタイン距離を計算
    if (matchingRecord) {
        const normalizedLyrics = matchingRecord.lyrics.replace(/\s+|[\-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '')
        const distance = levenshtein.get(normalizedLyrics, lyrics);

        // フィードバックをレスポンスとして返す
        
        res.json({ distance: distance });
        
    } else {
        res.status(404).json({ error: 'Title not found in the database.' });
    }
});


app.get('/api/sublyrics', (req, res) => {
    fs.readFile(path.join(__dirname, 'lyrics_.csv'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read the CSV file.' });
        }

        const results = Papa.parse(data, { header: true }).data;

        const chosenRecords = [];
        const indices = new Set();

        // ランダムに5つのレコードを選択する
        while (indices.size < 3) {
            const randomIndex = Math.floor(Math.random() * results.length);
            if (!indices.has(randomIndex)) {
                const record = results[randomIndex];
                const lyricsParts = record.lyrics.split('　')
                    .filter(part => part.trim() !== '' && Array.from(part).length >= 6);

                if (lyricsParts.length > 0) {
                    const randomPart = lyricsParts[Math.floor(Math.random() * lyricsParts.length)];
                    chosenRecords.push({ title: record.title, part: randomPart });
                    indices.add(randomIndex);
                }
            }
        }

        res.json(chosenRecords);
    });
});



app.get('/api/fillin', (req, res) => {
    fs.readFile(path.join(__dirname, 'lyrics_.csv'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read the CSV file.' });
        }

        const parsedData = Papa.parse(data, {
            header: true,
            skipEmptyLines: true
        }).data;

        // レコードをシャッフル
        const shuffledData = parsedData.sort(() => 0.5 - Math.random());

        // ランダムに5つ選ぶ
        const selectedData = shuffledData.slice(0, 3);

        // 選ばれたデータからタイトルと歌詞を抽出し、歌詞を分割して3つの要素を取得
        const responseArray = selectedData.map(record => {
            
            const lyricsList = record.lyrics.split('　').filter(part => part.trim() !== ''); // 全角空白で分割
            const startIndex = Math.floor(Math.random() * (lyricsList.length - 2)); // 連続する3つの要素を取得する開始インデックス
            const extractedLyrics = lyricsList.slice(startIndex, startIndex + 3);
            return {
                title: record.title,
                parts: extractedLyrics
            };
        });

        res.json(responseArray);
    });
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

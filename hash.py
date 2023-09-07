import pandas as pd
import hashlib
import re

def compute_hash(text):
    # 正規化
    normalized_text = re.sub(r'\s+|[\-!$%^&*()_+|~=`{}\[\]:";\'<>?,.\/]', '', text)
    # SHA-256 ハッシュを計算
    return hashlib.sha256(normalized_text.encode()).hexdigest()

# CSVファイルを読み込む
df = pd.read_csv('lyrics_.csv')

# 各lyricsに対して正規化とハッシュ化を適用
df['hash'] = df['lyrics'].apply(compute_hash)


# 結果を新しいCSVファイルに保存
df.to_csv('lyrics.csv', index=False)

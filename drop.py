import pandas as pd



# CSVファイルを読み込む
df = pd.read_csv('lyrics.csv')

# lyricsを削除
df = df.drop('lyrics', axis=1)


# 結果を新しいCSVファイルに保存
df.to_csv('lyrics.csv', index=False)

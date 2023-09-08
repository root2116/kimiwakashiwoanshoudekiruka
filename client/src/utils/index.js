
export function normalizeLyrics(lyrics) {
    // 空白、改行、記号などを除去して、日本語と英数字のみを残す
    return lyrics.replace(/\s+|[\-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '');
}


export async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
}


import * as FileSystem from 'expo-file-system'; // استيراد مكتبة معالجة الملفات

const API_URL = "https://api-inference.huggingface.co/models/tarteel-ai/whisper-base-ar-quran";
const headers = {"Authorization": "Bearer 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"};
async function query(uri: string): Promise<any> {
    try {
        // Read file
        let data = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

        // Make HTTP request
        let response = await fetch(API_URL, {
            method: 'POST',
            headers: headers,
            body: data
        });

        // Parse response
        let json = await response.json();
        return json;
    } catch (error) {
        console.error('Error querying:', error);
        throw error;
    }
}

async  function STT(filename: string): Promise<any> {
    return await query(filename);
}


export default STT;

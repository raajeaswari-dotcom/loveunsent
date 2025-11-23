import { NextRequest, NextResponse } from 'next/server';

// Simple transliteration mapping for common Indian language phonetics
// This is a basic implementation - for production, use a proper transliteration library
const transliterationMaps: { [key: string]: { [key: string]: string } } = {
    'hi': { // Hindi
        'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ii': 'ई', 'u': 'उ', 'uu': 'ऊ',
        'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ',
        'ka': 'क', 'kha': 'ख', 'ga': 'ग', 'gha': 'घ', 'nga': 'ङ',
        'cha': 'च', 'chha': 'छ', 'ja': 'ज', 'jha': 'झ', 'nya': 'ञ',
        'ta': 'ट', 'tha': 'ठ', 'da': 'ड', 'dha': 'ढ', 'na': 'ण',
        'pa': 'प', 'pha': 'फ', 'ba': 'ब', 'bha': 'भ', 'ma': 'म',
        'ya': 'य', 'ra': 'र', 'la': 'ल', 'va': 'व',
        'sha': 'श', 'shha': 'ष', 'sa': 'स', 'ha': 'ह',
        'namaste': 'नमस्ते', 'dhanyavaad': 'धन्यवाद', 'kaise': 'कैसे',
        'hello': 'हैलो', 'love': 'प्यार', 'letter': 'पत्र'
    },
    'ta': { // Tamil
        'a': 'அ', 'aa': 'ஆ', 'i': 'இ', 'ii': 'ஈ', 'u': 'உ', 'uu': 'ஊ',
        'e': 'எ', 'ee': 'ஏ', 'ai': 'ஐ', 'o': 'ஒ', 'oo': 'ஓ', 'au': 'ஔ',
        'ka': 'க', 'nga': 'ங', 'cha': 'ச', 'ja': 'ஜ', 'nya': 'ஞ',
        'ta': 'ட', 'na': 'ண', 'tha': 'த', 'nna': 'ந', 'pa': 'ப',
        'ma': 'ம', 'ya': 'ய', 'ra': 'ர', 'la': 'ல', 'va': 'வ',
        'zha': 'ழ', 'la': 'ள', 'ra': 'ற', 'na': 'ன',
        'vanakkam': 'வணக்கம்', 'nandri': 'நன்றி', 'eppadi': 'எப்படி',
        'hello': 'ஹலோ', 'love': 'காதல்', 'letter': 'கடிதம்'
    },
    'te': { // Telugu
        'a': 'అ', 'aa': 'ఆ', 'i': 'ఇ', 'ii': 'ఈ', 'u': 'ఉ', 'uu': 'ఊ',
        'ka': 'క', 'kha': 'ఖ', 'ga': 'గ', 'gha': 'ఘ',
        'cha': 'చ', 'ja': 'జ', 'ta': 'ట', 'da': 'డ',
        'pa': 'ప', 'ba': 'బ', 'ma': 'మ', 'ya': 'య',
        'ra': 'ర', 'la': 'ల', 'va': 'వ', 'sa': 'స',
        'namaskaram': 'నమస్కారం', 'dhanyavadalu': 'ధన్యవాదాలు',
        'hello': 'హలో', 'love': 'ప్రేమ', 'letter': 'ఉత్తరం'
    },
    'kn': { // Kannada
        'a': 'ಅ', 'aa': 'ಆ', 'i': 'ಇ', 'ii': 'ಈ', 'u': 'ಉ', 'uu': 'ಊ',
        'ka': 'ಕ', 'kha': 'ಖ', 'ga': 'ಗ', 'gha': 'ಘ',
        'cha': 'ಚ', 'ja': 'ಜ', 'ta': 'ಟ', 'da': 'ಡ',
        'pa': 'ಪ', 'ba': 'ಬ', 'ma': 'ಮ', 'ya': 'ಯ',
        'ra': 'ರ', 'la': 'ಲ', 'va': 'ವ', 'sa': 'ಸ',
        'namaskara': 'ನಮಸ್ಕಾರ', 'dhanyavada': 'ಧನ್ಯವಾದ',
        'hello': 'ಹಲೋ', 'love': 'ಪ್ರೀತಿ', 'letter': 'ಪತ್ರ'
    },
    'ml': { // Malayalam
        'a': 'അ', 'aa': 'ആ', 'i': 'ഇ', 'ii': 'ഈ', 'u': 'ഉ', 'uu': 'ഊ',
        'ka': 'ക', 'kha': 'ഖ', 'ga': 'ഗ', 'gha': 'ഘ',
        'cha': 'ച', 'ja': 'ജ', 'ta': 'ട', 'da': 'ഡ',
        'pa': 'പ', 'ba': 'ബ', 'ma': 'മ', 'ya': 'യ',
        'ra': 'ര', 'la': 'ല', 'va': 'വ', 'sa': 'സ',
        'namaskaram': 'നമസ്കാരം', 'nanni': 'നന്ദി',
        'hello': 'ഹലോ', 'love': 'സ്നേഹം', 'letter': 'കത്ത്'
    }
};

function simpleTransliterate(text: string, langCode: string): string {
    const map = transliterationMaps[langCode];
    if (!map) return text;

    let result = text.toLowerCase();

    // Sort keys by length (longest first) to match longer patterns first
    const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        const regex = new RegExp(key, 'gi');
        result = result.replace(regex, map[key]);
    }

    return result;
}

export async function POST(request: NextRequest) {
    try {
        const { text, language } = await request.json();

        if (!text || !language) {
            return NextResponse.json(
                { success: false, message: 'Text and language are required' },
                { status: 400 }
            );
        }

        const transliterated = simpleTransliterate(text, language);

        return NextResponse.json({
            success: true,
            data: {
                original: text,
                transliterated,
                language
            }
        });
    } catch (error) {
        console.error('Transliteration error:', error);
        return NextResponse.json(
            { success: false, message: 'Transliteration failed' },
            { status: 500 }
        );
    }
}

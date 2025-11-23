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

    'ta': { // Tamil (FIXED duplicates)
        'a': 'அ', 'aa': 'ஆ', 'i': 'இ', 'ii': 'ஈ', 'u': 'உ', 'uu': 'ஊ',
        'e': 'எ', 'ee': 'ஏ', 'ai': 'ஐ', 'o': 'ஒ', 'oo': 'ஓ', 'au': 'ஔ',

        'ka': 'க', 'nga': 'ங', 'cha': 'ச', 'ja': 'ஜ', 'nya': 'ஞ',

        'ta': 'ட',
        'na': 'ண',     // retroflex NA
        'tha': 'த',
        'nna': 'ந',    // dental NA

        'pa': 'ப',

        'ma': 'ம',
        'ya': 'ய',
        'ra': 'ர',     // RA
        'la': 'ல',     // LA
        'va': 'வ',

        'zha': 'ழ',    // ழ unique

        // FIXED DUPLICATES (renamed properly)
        'lla': 'ள',    // ள (retroflex LA)
        'rra': 'ற',    // ற (hard RA)
        'nnna': 'ன',   // ன (soft NA)

        // Words
        'v

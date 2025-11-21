"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Image as ImageIcon, Type, Upload, X, Loader2, Globe } from 'lucide-react';
import { useCustomization } from '@/context/CustomizationContext';

interface MessageEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function MessageEditor({ value, onChange }: MessageEditorProps) {
    const { state, updateState } = useCustomization();
    const [isRecording, setIsRecording] = useState(false);
    const [uploading, setUploading] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    onChange(value + ' ' + finalTranscript);
                }
            };
        }
    }, [value, onChange]);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Get Upload URL
            const res = await fetch('/api/upload/public', { method: 'POST' });
            const { data } = await res.json();

            if (!data?.uploadUrl) throw new Error('Failed to get upload URL');

            // 2. Upload File
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch(data.uploadUrl, {
                method: 'POST',
                body: formData
            });

            const uploadData = await uploadRes.json();

            if (uploadData.success) {
                // Save image URL to state (we'll need to update context to support this)
                // For now, we'll assume updateState handles arbitrary keys or we update context type later
                // But strictly, we should update the context type. 
                // Assuming updateState accepts partial state.
                updateState({ handwritingImageUrl: uploadData.result.variants[0] } as any);
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Tabs defaultValue="text" className="w-full" onValueChange={(val) => updateState({ inputMethod: val } as any)}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                        <Type className="w-4 h-4" /> Type
                    </TabsTrigger>
                    <TabsTrigger value="voice" className="flex items-center gap-2">
                        <Mic className="w-4 h-4" /> Voice
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Upload
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-muted-foreground">
                            Type your message in any language
                        </label>
                        <Button variant="ghost" size="sm" className="text-xs gap-1">
                            <Globe className="w-3 h-3" /> Multi-language Support
                        </Button>
                    </div>
                    <Textarea
                        placeholder="Dearest..."
                        className="min-h-[300px] font-serif text-lg leading-relaxed p-6 resize-none bg-white/50 focus:bg-white transition-colors"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <div className="flex justify-end text-xs text-muted-foreground">
                        {value?.length || 0} characters
                    </div>
                </TabsContent>

                <TabsContent value="voice" className="min-h-[300px] flex flex-col items-center justify-center space-y-6 border-2 border-dashed rounded-xl bg-muted/10">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-primary/10'}`}>
                        <Mic className={`w-10 h-10 ${isRecording ? 'text-red-500' : 'text-primary'}`} />
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="font-bold text-lg">
                            {isRecording ? 'Listening...' : 'Tap to Speak'}
                        </h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                            {isRecording
                                ? 'Speak naturally. We will transcribe your words properly.'
                                : 'We support multiple languages. Just start speaking.'}
                        </p>
                    </div>

                    <Button
                        size="lg"
                        variant={isRecording ? "destructive" : "default"}
                        onClick={toggleRecording}
                        className="rounded-full px-8"
                    >
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>

                    {value && (
                        <div className="w-full max-w-md mt-6 p-4 bg-white rounded-lg border text-left">
                            <p className="font-serif text-sm text-muted-foreground mb-2">Transcript:</p>
                            <p className="font-serif">{value}</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="image" className="min-h-[300px] flex flex-col items-center justify-center space-y-6 border-2 border-dashed rounded-xl bg-muted/10 relative">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="handwriting-upload"
                        onChange={handleFileUpload}
                    />

                    {(state as any).handwritingImageUrl ? (
                        <div className="relative w-full h-full min-h-[300px] p-4">
                            <img
                                src={(state as any).handwritingImageUrl}
                                alt="Uploaded Handwriting"
                                className="w-full h-full object-contain rounded-lg"
                            />
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2 rounded-full"
                                onClick={() => updateState({ handwritingImageUrl: null } as any)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-bold text-lg">Upload Handwriting</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">
                                    Take a photo of your handwritten note and we'll copy it exactly.
                                </p>
                            </div>
                            <label htmlFor="handwriting-upload">
                                <Button size="lg" className="rounded-full px-8 cursor-pointer" asChild disabled={uploading}>
                                    <span>
                                        {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {uploading ? 'Uploading...' : 'Select Image'}
                                    </span>
                                </Button>
                            </label>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

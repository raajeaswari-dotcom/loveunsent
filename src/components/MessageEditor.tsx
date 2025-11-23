"use client";

import React, { useState, useRef, useEffect } from 'react';
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const valueRef = useRef(value);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [value]);

    // Speech Recognition (Improved)
    useEffect(() => {
        // Prefer the standard SpeechRecognition API, fallback to webkitSpeechRecognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (typeof window !== 'undefined' && SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            // Request microphone permission before starting
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    // Permission granted, ready to start recording when user clicks
                })
                .catch((err) => {
                    console.error('Microphone permission denied', err);
                });

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    onChange(valueRef.current + ' ' + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };
        } else {
            console.warn('SpeechRecognition API not supported in this browser');
        }
    }, []);

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
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/public', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                updateState({ handwritingImageUrl: data.data.url });
            } else {
                throw new Error(data.message || 'Upload failed');
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
            <Tabs value={state.inputMethod} className="w-full" onValueChange={(val) => updateState({ inputMethod: val as any })}>
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
                    <textarea
                        ref={textareaRef}
                        placeholder="Dearest..."
                        className="w-full min-h-[120px] max-h-[500px] font-serif text-lg leading-relaxed p-6 resize-none bg-white/50 focus:bg-white transition-colors rounded-md border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <div className="flex justify-end text-xs text-muted-foreground">
                        {value?.length || 0} characters
                    </div>
                </TabsContent>

                <TabsContent value="voice" className="flex flex-col items-center justify-center space-y-6">
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

                <TabsContent value="image" className="flex flex-col items-center justify-center space-y-6 relative">
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        id="handwriting-upload"
                        onChange={handleFileUpload}
                    />

                    {state.handwritingImageUrl ? (
                        <div className="relative w-full h-full min-h-[300px] p-4">
                            <img
                                src={state.handwritingImageUrl}
                                alt="Uploaded Handwriting"
                                className="w-full h-full object-contain rounded-lg"
                            />
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2 rounded-full"
                                onClick={() => updateState({ handwritingImageUrl: null })}
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

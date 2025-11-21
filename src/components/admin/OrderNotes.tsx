"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Trash2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Note {
    _id: string;
    note: string;
    noteType: 'info' | 'warning' | 'important';
    adminId: { name: string; email: string };
    createdAt: string;
}

interface OrderNotesProps {
    orderId: string;
}

export default function OrderNotes({ orderId }: OrderNotesProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState<'info' | 'warning' | 'important'>('info');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        fetchNotes();
    }, [orderId]);

    const fetchNotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setNotes(data.data.notes);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note: newNote, noteType })
            });

            const data = await response.json();
            if (data.success) {
                setNotes([data.data.note, ...notes]);
                setNewNote('');
                setNoteType('info');
            }
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Failed to add note');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/orders/${orderId}/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setNotes(notes.filter(n => n._id !== noteId));
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note');
        }
    };

    const getNoteIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'important':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const getNoteVariant = (type: string) => {
        switch (type) {
            case 'warning':
                return 'secondary';
            case 'important':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Internal Notes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Note Form */}
                <div className="space-y-3">
                    <Textarea
                        placeholder="Add internal note (admin-only)..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <Select
                            value={noteType}
                            onValueChange={(value: any) => setNoteType(value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="important">Important</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAddNote} disabled={loading || !newNote.trim()}>
                            Add Note
                        </Button>
                    </div>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                    {notes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No internal notes yet
                        </p>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note._id}
                                className="border rounded-lg p-4 space-y-2"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {getNoteIcon(note.noteType)}
                                        <Badge variant={getNoteVariant(note.noteType) as any}>
                                            {note.noteType}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteNote(note._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm">{note.note}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>By: {note.adminId?.name || 'Unknown'}</span>
                                    <span>•</span>
                                    <span>{new Date(note.createdAt).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

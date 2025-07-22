'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCaptionStore } from "@/stores/caption-store";
import { usePlaybackStore } from "@/stores/playback-store";
import { CaptionImportPanel } from "./caption-import-panel";
import { CaptionStylePanel } from "./caption-style-panel";
import { Trash2, Edit, Plus, Download, Palette, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type ViewMode = 'list' | 'style';

export function CaptionPanel() {
  const {
    captions,
    selectedCaptionId,
    addCaption,
    updateCaption,
    deleteCaption,
    setSelectedCaptionId,
    clearAllCaptions,
    undoClearAllCaptions,
    canUndoClearAll,
  } = useCaptionStore();

  const { currentTime, seek } = usePlaybackStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [newCaptionText, setNewCaptionText] = useState('');
  const [newCaptionStart, setNewCaptionStart] = useState(currentTime.toString());
  const [newCaptionEnd, setNewCaptionEnd] = useState((currentTime + 3).toString());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAddCaption = () => {
    if (!newCaptionText.trim()) {
      toast.error("Caption text cannot be empty");
      return;
    }

    const startTime = parseFloat(newCaptionStart);
    const endTime = parseFloat(newCaptionEnd);

    if (isNaN(startTime) || isNaN(endTime)) {
      toast.error("Invalid time values");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be greater than start time");
      return;
    }

    addCaption({
      text: newCaptionText.trim(),
      startTime,
      endTime,
    });

    setNewCaptionText('');
    setNewCaptionStart(currentTime.toString());
    setNewCaptionEnd((currentTime + 3).toString());
    toast.success("Caption added successfully");
  };

  const handleEditCaption = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleSaveEdit = () => {
    if (!editingText.trim()) {
      toast.error("Caption text cannot be empty");
      return;
    }

    if (editingId) {
      updateCaption(editingId, { text: editingText.trim() });
      setEditingId(null);
      setEditingText('');
      toast.success("Caption updated successfully");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleDeleteCaption = (id: string) => {
    deleteCaption(id);
    if (selectedCaptionId === id) {
      setSelectedCaptionId(null);
    }
    toast.success("Caption deleted successfully");
  };

  const handleSeekToCaption = (startTime: number) => {
    seek(startTime);
  };

  const handleStyleCaption = (id: string) => {
    setSelectedCaptionId(id);
    setViewMode('style');
  };

  const handleClearAll = () => {
    if (captions.length === 0) {
      toast.error("No captions to clear");
      return;
    }

    clearAllCaptions();
    toast.success("All captions cleared");
  };

  const handleUndoClearAll = () => {
    if (canUndoClearAll()) {
      undoClearAllCaptions();
      toast.success("Captions restored");
    } else {
      toast.error("Nothing to undo");
    }
  };

  const exportCaptions = () => {
    if (captions.length === 0) {
      toast.error("No captions to export");
      return;
    }

    // Create SRT format
    const srtContent = captions
      .map((caption, index) => {
        const formatTime = (seconds: number) => {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const secs = Math.floor(seconds % 60);
          const ms = Math.floor((seconds % 1) * 1000);
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
        };

        return `${index + 1}\n${formatTime(caption.startTime)} --> ${formatTime(caption.endTime)}\n${caption.text}\n`;
      })
      .join('\n');

    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captions.srt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Captions exported as SRT file");
  };

  if (viewMode === 'style') {
    return <CaptionStylePanel onBack={() => setViewMode('list')} />;
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Captions</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCaptions} disabled={captions.length === 0}>
              <Download className="h-4 w-4" />
            </Button>
            <CaptionImportPanel />
          </div>
        </div>

        {/* Add New Caption */}
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="captionText">Caption Text</Label>
            <Input
              id="captionText"
              value={newCaptionText}
              onChange={(e) => setNewCaptionText(e.target.value)}
              placeholder="Enter caption text..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCaption();
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="startTime">Start (s)</Label>
              <Input
                id="startTime"
                type="number"
                step="0.1"
                value={newCaptionStart}
                onChange={(e) => setNewCaptionStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End (s)</Label>
              <Input
                id="endTime"
                type="number"
                step="0.1"
                value={newCaptionEnd}
                onChange={(e) => setNewCaptionEnd(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleAddCaption} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Caption
          </Button>
        </div>
      </div>

      {/* Caption List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-4 space-y-2">
            {captions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No captions added yet.</p>
                <p className="text-sm">Add a caption above or import from a file.</p>
              </div>
            ) : (
              captions.map((caption) => (
                <div
                  key={caption.id}
                  className={`border rounded-lg p-3 space-y-2 ${
                    selectedCaptionId === caption.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingId === caption.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEdit();
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium break-words">{caption.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {caption.startTime.toFixed(1)}s - {caption.endTime.toFixed(1)}s
                          </p>
                        </div>
                      )}
                    </div>

                    {editingId !== caption.id && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSeekToCaption(caption.startTime)}
                          title="Seek to caption"
                          className="h-8 w-8 p-0"
                        >
                          ▶
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCaption(caption.id, caption.text)}
                          title="Edit caption"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStyleCaption(caption.id)}
                          title="Style caption"
                          className="h-8 w-8 p-0"
                        >
                          <Palette className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCaption(caption.id)}
                          title="Delete caption"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer Actions */}
      {captions.length > 0 && (
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
            {canUndoClearAll() && (
              <Button variant="outline" size="sm" onClick={handleUndoClearAll}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Undo Clear
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

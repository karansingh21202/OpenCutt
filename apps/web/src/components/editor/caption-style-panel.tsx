'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCaptionStore } from "@/stores/caption-store";
import { Caption } from "@/types/editor";
import { safeParseInt, safeParseFloat, rgbaToHex, hexToRgba } from "@/lib/utils";

interface CaptionStylePanelProps {
  onBack: () => void;
}

export function CaptionStylePanel({ onBack }: CaptionStylePanelProps) {
  const { captions, selectedCaptionId, updateCaption } = useCaptionStore();

  const selectedCaption = captions.find(c => c.id === selectedCaptionId);

  if (!selectedCaption) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No caption selected for styling.</p>
        <Button onClick={onBack} className="mt-4">
          Back to Caption List
        </Button>
      </div>
    );
  }

  const updateStyle = (styleUpdates: Partial<Caption['style']> = {}) => {
    const newStyle = {
      ...(selectedCaption.style || {}),
      ...styleUpdates,
      position: {
        ...(selectedCaption.style?.position || { x: 0, y: 0 }),
        ...(styleUpdates.position || {}),
      },
    };

    updateCaption(selectedCaption.id, {
      style: newStyle,
    });
  };

  const style = selectedCaption.style || { position: { x: 0, y: 0 } };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Style Caption</h3>
          <Button variant="outline" size="sm" onClick={onBack}>
            Back to List
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-black/90 min-h-[100px] flex items-center justify-center">
            <div
              className={`text-center ${style.animation || ""}`}
              style={{
                fontFamily: style.fontFamily || "Arial",
                fontSize: style.fontSize || "24px",
                color: style.color || "white",
                backgroundColor: style.backgroundColor === "transparent" ? "transparent" : (style.backgroundColor || "rgba(0,0,0,0.7)"),
                padding: style.padding || "8px 12px",
                borderRadius: style.borderRadius || "4px",
                border: style.backgroundColor !== "transparent" && style.borderColor && style.borderWidth
                  ? `${style.borderWidth} solid ${style.borderColor}`
                  : undefined,
                textShadow: style.backgroundColor === "transparent" && style.borderWidth
                  ? `1px 1px 0 ${style.borderColor || "black"}, -1px -1px 0 ${style.borderColor || "black"}, 1px -1px 0 ${style.borderColor || "black"}, -1px 1px 0 ${style.borderColor || "black"}`
                  : style.textShadow,
                textAlign: style.textAlign as any || "center",
                lineHeight: style.lineHeight || "1.2",
                letterSpacing: style.letterSpacing || "normal",
                whiteSpace: style.whiteSpace as any || "nowrap",
                maxWidth: style.maxWidth || "80vw",
                overflow: style.overflow as any || "visible",
                textOverflow: style.overflow === "ellipsis" ? "ellipsis" : undefined,
              }}
            >
              {selectedCaption.text}
            </div>
          </div>

          {/* Font Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Font</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select value={style.fontFamily || "Arial"} onValueChange={(value) => updateStyle({ fontFamily: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Impact">Impact</SelectItem>
                    <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  value={style.fontSize || "24px"}
                  onChange={(e) => updateStyle({ fontSize: e.target.value })}
                  placeholder="24px"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="textAlign">Text Alignment</Label>
              <Select value={style.textAlign || "center"} onValueChange={(value) => updateStyle({ textAlign: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <h4 className="font-medium">Colors</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <Input
                  id="textColor"
                  type="color"
                  value={style.color || "#ffffff"}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="backgroundColor">Background</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={style.backgroundColor === "transparent" ? "#000000" : rgbaToHex(style.backgroundColor || "rgba(0,0,0,0.7)")}
                    onChange={(e) => updateStyle({ backgroundColor: hexToRgba(e.target.value, 0.7) })}
                    disabled={style.backgroundColor === "transparent"}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStyle({ backgroundColor: style.backgroundColor === "transparent" ? "rgba(0,0,0,0.7)" : "transparent" })}
                  >
                    {style.backgroundColor === "transparent" ? "Add BG" : "Transparent"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Border & Stroke */}
          <div className="space-y-4">
            <h4 className="font-medium">Border & Stroke</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="borderColor">Border Color</Label>
                <Input
                  id="borderColor"
                  type="color"
                  value={style.borderColor || "#ffffff"}
                  onChange={(e) => updateStyle({ borderColor: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="borderWidth">Border Width</Label>
                <Input
                  id="borderWidth"
                  value={style.borderWidth || "0px"}
                  onChange={(e) => updateStyle({ borderWidth: e.target.value })}
                  placeholder="2px"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="borderRadius">Border Radius</Label>
              <Input
                id="borderRadius"
                value={style.borderRadius || "4px"}
                onChange={(e) => updateStyle({ borderRadius: e.target.value })}
                placeholder="4px"
              />
            </div>
          </div>

          {/* Animation */}
          <div className="space-y-4">
            <h4 className="font-medium">Animation</h4>

            <div>
              <Label htmlFor="animation">Animation Type</Label>
              <Select value={style.animation || "none"} onValueChange={(value) => updateStyle({ animation: value === "none" ? undefined : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="No animation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Animation</SelectItem>
                  <SelectItem value="fadeIn">Fade In</SelectItem>
                  <SelectItem value="bounceIn">Bounce In</SelectItem>
                  <SelectItem value="typewriter">Typewriter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Position */}
          <div className="space-y-4">
            <h4 className="font-medium">Position</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="positionX">X Position (px)</Label>
                <Input
                  id="positionX"
                  type="number"
                  value={style.position?.x || 0}
                  onChange={(e) => {
                    const currentX = safeParseInt(e.target.value);
                    const currentY = style.position?.y || 0;
                    updateStyle({
                      position: {
                        x: currentX,
                        y: currentY
                      }
                    });
                  }}
                />
              </div>

              <div>
                <Label htmlFor="positionY">Y Position (px)</Label>
                <Input
                  id="positionY"
                  type="number"
                  value={style.position?.y || 0}
                  onChange={(e) => {
                    const currentX = style.position?.x || 0;
                    const currentY = safeParseInt(e.target.value);
                    updateStyle({
                      position: {
                        x: currentX,
                        y: currentY
                      }
                    });
                  }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => updateStyle({ position: { x: 0, y: 0 } })}
              className="w-full"
            >
              Reset to Center
            </Button>
          </div>

          {/* Advanced */}
          <div className="space-y-4">
            <h4 className="font-medium">Advanced</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lineHeight">Line Height</Label>
                <Input
                  id="lineHeight"
                  value={style.lineHeight || "1.2"}
                  onChange={(e) => updateStyle({ lineHeight: e.target.value })}
                  placeholder="1.2"
                />
              </div>

              <div>
                <Label htmlFor="letterSpacing">Letter Spacing</Label>
                <Input
                  id="letterSpacing"
                  value={style.letterSpacing || "normal"}
                  onChange={(e) => updateStyle({ letterSpacing: e.target.value })}
                  placeholder="normal"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="whiteSpace">Text Wrapping</Label>
              <Select value={style.whiteSpace || "nowrap"} onValueChange={(value) => updateStyle({ whiteSpace: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nowrap">No Wrap</SelectItem>
                  <SelectItem value="normal">Normal Wrap</SelectItem>
                  <SelectItem value="pre-wrap">Preserve Wrap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxWidth">Max Width</Label>
              <Input
                id="maxWidth"
                value={style.maxWidth || "80vw"}
                onChange={(e) => updateStyle({ maxWidth: e.target.value })}
                placeholder="80vw"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface BeforeAfterPageProps {
  /** The original user prompt */
  inputPrompt: string;
  /** The improved or AI-generated result */
  outputResult: string;
  /** Optional callback to re-edit the prompt */
  onEditPrompt?: () => void;
  /** Optional callback to copy the improved output */
  onCopyOutput?: () => void;
}

export function BeforeAfterPage({
  inputPrompt,
  outputResult,
  onEditPrompt,
  onCopyOutput,
}: BeforeAfterPageProps) {
  return (
    <div className="p-6 bg-background">
      <h1 className="text-3xl font-bold mb-8">
        Prompt Improvement: Before vs After
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before Card */}
        <Card>
          <CardHeader>
            <CardTitle>Before</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={inputPrompt}
              className="h-[40vh] resize-none bg-secondary text-foreground"
            />
            {onEditPrompt && (
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={onEditPrompt}
              >
                Edit Prompt
              </Button>
            )}
          </CardContent>
        </Card>

        {/* After Card with hover-triggered copy */}
        <Card className="group">
          <CardHeader>
            <CardTitle>After</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <Textarea
              readOnly
              value={outputResult}
              className="h-[40vh] resize-none bg-secondary text-foreground"
            />
            {onCopyOutput && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={onCopyOutput}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface BeforeAfterPageProps {
  /** The original user prompt */
  inputPrompt: string;
  /** The improved or AI-generated result */
  outputResult: string;
  onCopyOutput?: () => void;
}

export default function BeforeAfterPage({
  inputPrompt,
  outputResult,
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
              className="h-48 resize-none bg-secondary text-foreground"
            />
          </CardContent>
        </Card>

        {/* After Card */}
        <Card>
          <CardHeader>
            <CardTitle>After</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={outputResult}
              className="h-48 resize-none bg-secondary text-foreground"
            />
            {onCopyOutput && (
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={onCopyOutput}
              >
                Copy Output
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

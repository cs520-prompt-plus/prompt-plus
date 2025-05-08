"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Edit,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

export interface PromptPair {
  id: string;
  inputPrompt: string;
  outputResult: string;
  timestamp: string;
  tags?: string[];
}

export function PromptCard({
  pair,
  index,
  isExpanded,
  onToggleExpansion,
  onEditPrompt,
  onDeletePrompt,
}: {
  pair: PromptPair;
  index: number;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onEditPrompt?: (index: number) => void;
  onDeletePrompt?: (index: number) => void;
}) {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Prompt #{index + 1}
              <span className="text-xs font-normal text-muted-foreground">
                {pair.id.substring(0, 8)}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(pair.timestamp).toLocaleDateString()}</span>
              <Clock className="h-3 w-3 ml-2" />
              <span>{new Date(pair.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpansion}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {pair.tags && (
          <div className="flex flex-wrap gap-2 mt-2">
            {pair.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent
        className={`grid grid-cols-1 ${
          isExpanded ? "md:grid-cols-2" : ""
        } gap-4`}
      >
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">
            Input
          </h3>
          <div className="relative">
            <Textarea
              readOnly
              value={
                isExpanded
                  ? pair.inputPrompt
                  : pair.inputPrompt.substring(0, 150) +
                    (pair.inputPrompt.length > 150 ? "..." : "")
              }
              className={`resize-none bg-secondary text-foreground ${
                isExpanded ? "h-48" : "h-20"
              }`}
            />
            {!isExpanded && pair.inputPrompt.length > 150 && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="outline" className="text-xs bg-background">
                  Show more
                </Badge>
              </div>
            )}
          </div>
        </div>

        {(isExpanded || !isExpanded) && (
          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">
              Output
            </h3>
            <div className="relative group">
              <Textarea
                readOnly
                value={
                  isExpanded
                    ? pair.outputResult
                    : pair.outputResult.substring(0, 150) +
                      (pair.outputResult.length > 150 ? "..." : "")
                }
                className={`resize-none bg-secondary text-foreground ${
                  isExpanded ? "h-48" : "h-20"
                }`}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(pair.outputResult);
                  toast.success("Output copied to clipboard!");
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {isExpanded && (
        <CardFooter className="flex justify-end gap-2 pt-2">
          {onEditPrompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditPrompt(index)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}

          {onDeletePrompt && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeletePrompt(index)}
              className="flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

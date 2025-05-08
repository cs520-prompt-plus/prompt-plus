"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Edit,
  Search,
  ChevronUp,
  ChevronDown,
  Calendar,
  Clock,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface PromptPair {
  id: string;
  inputPrompt: string;
  outputResult: string;
  timestamp: string;
  tags?: string[];
}

interface PromptListPageProps {
  promptPairs: PromptPair[];
  onEditPrompt?: (index: number) => void;
  onCopyOutput?: (index: number) => void;
}

export function PromptListPage({
  promptPairs,
  onEditPrompt,
  onCopyOutput,
}: PromptListPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {}
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const filteredPrompts = promptPairs.filter(
    (pair) =>
      pair.inputPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.outputResult.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pair.tags &&
        pair.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  // Sort prompts by timestamp
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="p-6 bg-background overflow-auto">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Prompt History</h1>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                }
                title={
                  sortOrder === "newest" ? "Sort by oldest" : "Sort by newest"
                }
              >
                {sortOrder === "newest" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>

              <Button variant="outline" size="icon" title="Filter options">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Prompts</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {sortedPrompts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No prompts found. Try a different search term.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedPrompts.map((pair, index) => (
                    <PromptCard
                      key={Date.now() + index} // Use a unique key for each card
                      pair={pair}
                      index={index}
                      isExpanded={!!expandedCards[pair.id]}
                      onToggleExpansion={() => toggleCardExpansion(pair.id)}
                      onEditPrompt={onEditPrompt}
                      onCopyOutput={onCopyOutput}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="recent" className="mt-0">
              <div className="text-center py-12 text-muted-foreground">
                <p>Your recent prompts will appear here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </header>
      </div>
    </div>
  );
}

function PromptCard({
  pair,
  index,
  isExpanded,
  onToggleExpansion,
  onEditPrompt,
  onCopyOutput,
}: {
  pair: PromptPair;
  index: number;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onEditPrompt?: (index: number) => void;
  onCopyOutput?: (index: number) => void;
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
              {onCopyOutput && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCopyOutput(index)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
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
              Edit Prompt
            </Button>
          )}
          {onCopyOutput && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onCopyOutput(index)}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Output
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

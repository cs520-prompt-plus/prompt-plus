"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Filter, Search } from "lucide-react";
import { PromptCard } from "./prompt-card";
import { useState } from "react";

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
  onDeletePrompt?: (index: number) => void;
}

export function PromptListPage({
  promptPairs,
  onEditPrompt,
  onDeletePrompt,
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
                      onDeletePrompt={onDeletePrompt}
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

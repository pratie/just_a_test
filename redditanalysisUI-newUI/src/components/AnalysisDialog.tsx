'use client';

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { RedditPost } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface AnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  posts: RedditPost[];
  projectName: string;
}

export function AnalysisDialog({ isOpen, onClose, posts }: AnalysisDialogProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          {posts
            .sort((a, b) => b.relevance_score - a.relevance_score)
            .map((post, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-blue-600">
                    r/{post.subreddit}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-orange-600">
                      {post.score} points
                    </Badge>
                    <Badge variant="outline" className="text-purple-600">
                      {post.num_comments} comments
                    </Badge>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <span>{formatDate(post.created_utc)}</span>
                  <span className="text-gray-300">•</span>
                  <Badge 
                    variant="secondary"
                    className={`${
                      post.relevance_score >= 0.8
                        ? 'bg-green-100 text-green-800'
                        : post.relevance_score >= 0.6
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    Relevance: {Math.round(post.relevance_score * 100)}%
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold mb-4">
                  {post.title}
                </h3>

                {post.generated_reply && (
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <div className="text-sm text-gray-600 mb-2">Generated Reply:</div>
                    <div className="text-gray-800">{post.generated_reply}</div>
                  </div>
                )}
              </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

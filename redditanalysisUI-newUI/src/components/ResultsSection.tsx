// src/components/ResultsSection.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RedditPost } from '@/types';
import { MessageSquare, ArrowUpRight, ThumbsUp, Clock } from 'lucide-react';

interface ResultsSectionProps {
  posts: RedditPost[];
}

export function ResultsSection({ posts }: ResultsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Matching Posts ({posts.length})
        </h2>
        <div className="flex items-center space-x-2 text-sm text-zinc-500">
          <Clock className="w-4 h-4" />
          <span>Last updated just now</span>
        </div>
      </div>

      <div className="grid gap-4">
        {posts.map((post, index) => (
          <Card 
            key={post.post_id}
            className="overflow-hidden bg-white shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] opacity-0 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      r/{post.subreddit}
                    </Badge>
                    <div className="flex gap-1">
                      {post.matching_keywords.map((keyword) => (
                        <Badge 
                          key={keyword} 
                          variant="secondary"
                          className="bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>

                <div>
                  <h3 className="font-medium text-lg text-zinc-900 mb-2">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </a>
                  </h3>
                  {post.content && (
                    <p className="text-sm text-zinc-600 line-clamp-3">
                      {post.content}
                    </p>
                  )}
                </div>

                {post.generated_reply && (
                  <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center space-x-2 text-blue-800 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      <h4 className="text-sm font-medium">Generated Reply</h4>
                    </div>
                    <p className="text-sm text-zinc-700">
                      {post.generated_reply}
                    </p>
                    <div className="mt-3 flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful</span>
                      </button>
                      <button className="text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
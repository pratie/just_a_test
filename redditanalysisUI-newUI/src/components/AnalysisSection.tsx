// src/components/AnalysisSection.tsx
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Hash, TrendingUp } from 'lucide-react';
import { RedditPost } from '@/types';

interface AnalysisSectionProps {
  keywords: string[];
  subreddits: string[];
  onResults: (posts: RedditPost[]) => void;
}

export function AnalysisSection({ keywords, subreddits, onResults }: AnalysisSectionProps) {
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/analyze/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          subreddits,
          post_limit: 50
        })
      });
      const data = await response.json();
      onResults(data.matching_posts);
    } catch (error) {
      console.error('Error:', error);
    }
    setAnalyzing(false);
  };

  return (
    <Card className="overflow-hidden bg-white shadow-xl border-0 transition-transform duration-300 hover:scale-[1.01]">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6" />
          <span>Analysis Parameters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <h3 className="text-sm font-medium text-purple-800 mb-3 flex items-center">
              <Hash className="w-4 h-4 mr-2" />
              Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <div
                  key={keyword}
                  className="opacity-0 animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Badge 
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-200"
                  >
                    {keyword}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
            <h3 className="text-sm font-medium text-pink-800 mb-3 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Subreddits
            </h3>
            <div className="flex flex-wrap gap-2">
              {subreddits.map((subreddit, index) => (
                <div
                  key={subreddit}
                  className="opacity-0 animate-scale-in"
                  style={{ animationDelay: `${(index + keywords.length) * 100}ms` }}
                >
                  <Badge 
                    variant="outline"
                    className="border-pink-200 text-pink-800 hover:bg-pink-100 transition-colors duration-200"
                  >
                    r/{subreddit}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAnalysis}
            disabled={analyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
          >
            {analyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {analyzing ? 'Analyzing Posts...' : 'Analyze Reddit Posts'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
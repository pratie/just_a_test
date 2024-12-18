'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import type { RedditPost, Project } from '@/lib/api';
import { toast } from 'sonner';
import { HighlightedText } from '@/components/HighlightedText';

export default function ProjectAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [posts, setPosts] = useState<RedditPost[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!params.id || !user?.token) return;
        
        // Fetch project details
        const projectData = await api.getProject(params.id as string);
        setProject(projectData);

        // Try to get cached analysis results
        const cachedResults = localStorage.getItem(`analysis_${params.id}`);
        if (cachedResults) {
          setPosts(JSON.parse(cachedResults));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, user?.token]);

  const runAnalysis = async () => {
    if (!project) return;
    
    setAnalyzing(true);
    try {
      const result = await api.analyzeReddit({
        brand_id: project.id,
        keywords: project.keywords,
        subreddits: project.subreddits,
        time_period: 'week',
        limit: 50
      });
      setPosts(result.posts);
      
      // Cache the results
      localStorage.setItem(`analysis_${project.id}`, JSON.stringify(result.posts));
      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('Error analyzing project:', error);
      toast.error('Failed to analyze project. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <h1 className="text-2xl font-bold">Analysis Results: {project.name}</h1>
        </div>
        <Button 
          onClick={runAnalysis} 
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing...' : posts.length ? 'Refresh Analysis' : 'Run Analysis'}
        </Button>
      </div>

      {!posts.length ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">No Analysis Results Yet</h2>
          <p className="text-gray-600 mb-4">Click the "Run Analysis" button above to analyze Reddit posts for this project.</p>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Tracking</h2>
          <div className="flex flex-wrap gap-2">
            <div>
              <span className="text-sm text-gray-500 mr-2">Keywords:</span>
              {project.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="mr-2">
                  {keyword}
                </Badge>
              ))}
            </div>
            <div>
              <span className="text-sm text-gray-500 mr-2">Subreddits:</span>
              {project.subreddits.map((subreddit) => (
                <Badge key={subreddit} variant="outline" className="mr-2">
                  r/{subreddit}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

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
                    post.relevance_score >= 80
                      ? 'bg-green-100 text-green-800'
                      : post.relevance_score >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Relevance: {post.relevance_score}%
                </Badge>
              </div>

              {post.matched_keywords && post.matched_keywords.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Matched keywords:</span>
                  {post.matched_keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}

              <h3 className="text-lg font-semibold mb-2">
                <HighlightedText 
                  text={post.title} 
                  keywords={post.matched_keywords || []}
                />
              </h3>

              {post.content && post.content.trim() && (
                <div className="mt-4 text-gray-600">
                  <HighlightedText 
                    text={post.content} 
                    keywords={post.matched_keywords || []}
                  />
                </div>
              )}

              {post.suggested_comment && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-sm font-medium text-blue-800 mb-2">Suggested Reply:</div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {post.suggested_comment}
                  </div>
                </div>
              )}
            </Card>
        ))}
      </div>
    </div>
  );
}

// src/components/ProjectCard.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Loader2, Edit, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { api, Project, RedditPost } from '@/lib/api';
import { toast } from 'sonner';
import { EditProjectDialog } from './EditProjectDialog';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleViewMentions = async () => {
    if (!project.keywords.length || !project.subreddits.length) {
      toast.error('Project must have keywords and subreddits to analyze');
      return;
    }

    const CACHE_KEY = `mentions-${project.id}`;
    const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    // Check if we have cached mentions
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { mentions, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      if (!isExpired && mentions.length > 0) {
        // Process cached data to ensure matching_keywords exists
        const processedMentions = mentions.map(mention => ({
          ...mention,
          matching_keywords: Array.isArray(mention.matching_keywords) ? 
            mention.matching_keywords : 
            (mention.keyword ? [mention.keyword] : [])
        }));

        // Update cache with processed data
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          mentions: processedMentions,
          timestamp
        }));

        // Use cached data
        router.push(`/mentions/${project.id}`);
        return;
      }
    }

    setLoading(true);

    try {
      const analysisResult = await api.analyzeReddit({
        brand_id: project.id,
        keywords: project.keywords,
        subreddits: project.subreddits,
        time_period: 'day', // Default to last day
        limit: 20, // Default to 20 posts
      });

      if (analysisResult.status === 'success' && analysisResult.posts.length > 0) {
        // Process posts to ensure consistent data structure
        const processedPosts = analysisResult.posts.map(post => ({
          ...post,
          matching_keywords: Array.isArray(post.matching_keywords) ? 
            post.matching_keywords : 
            (post.keyword ? [post.keyword] : []),
          relevance_score: post.relevance_score || post.score || 0
        }));

        // Store the analysis result with timestamp
        const cacheData = {
          mentions: processedPosts,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        // Navigate to mentions page
        router.push(`/mentions/${project.id}`);
      } else {
        toast.info('No matching Reddit posts found for your keywords');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze Reddit posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setLoading(true);
    try {
      await api.deleteProject(project.id);
      // Only call onDelete if the deletion was successful
      onDelete(project.id);
    } catch (error) {
      // Only show error in ProjectCard if it wasn't already handled by the parent
      if (!error.message.includes('Failed to delete project')) {
        console.error('Delete project error in card:', error);
        toast.error(error.message);
      }
      throw error; // Re-throw to let parent handle it
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (projectId: string, updatedData: Partial<Project>) => {
    try {
      await api.updateProject(projectId, updatedData);
      // Update the local project data
      project.keywords = updatedData.keywords || project.keywords;
      project.subreddits = updatedData.subreddits || project.subreddits;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Keywords */}
          <div>
            <Label className="text-sm text-gray-500 mb-2">Keywords</Label>
            <div className="flex flex-wrap gap-2">
              {project.keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="bg-orange-50 text-orange-700"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Subreddits */}
          <div>
            <Label className="text-sm text-gray-500 mb-2">Subreddits</Label>
            <div className="flex flex-wrap gap-2">
              {project.subreddits.map((subreddit) => (
                <Badge
                  key={subreddit}
                  className="bg-indigo-100 text-indigo-800"
                >
                  r/{subreddit}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewMentions}
          disabled={loading || !project.keywords.length || !project.subreddits.length}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <MessageSquare className="mr-2 h-4 w-4" />
              View Mentions
            </>
          )}
        </Button>
      </CardFooter>

      <EditProjectDialog
        project={project}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEditProject}
      />
    </Card>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

interface Project {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  subreddits: string[];
}

interface EditProjectDialogProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectId: string, updatedData: Partial<Project>) => Promise<void>;
}

export function EditProjectDialog({ project, isOpen, onClose, onSave }: EditProjectDialogProps) {
  const [keywords, setKeywords] = useState<string[]>(project?.keywords ?? []);
  const [subreddits, setSubreddits] = useState<string[]>(project?.subreddits ?? []);
  const [newKeyword, setNewKeyword] = useState('');
  const [newSubreddit, setNewSubreddit] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setKeywords(project.keywords);
      // Ensure subreddits are stored without 'r/' prefix
      setSubreddits(project.subreddits.map(s => s.replace(/^r\//, '')));
      setNewKeyword('');
      setNewSubreddit('');
    }
  }, [project]);

  const handleSave = async () => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      await onSave(project.id, {
        name,
        description,
        keywords,
        subreddits: subreddits.map(s => `r/${s}`),
      });
      
      toast.success('Project updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const handleAddSubreddit = () => {
    const formatted = newSubreddit.trim().replace(/^r\//, '');
    if (formatted && !subreddits.includes(formatted)) {
      setSubreddits([...subreddits, formatted]);
      setNewSubreddit('');
    }
  };

  const handleRemoveSubreddit = (subredditToRemove: string) => {
    setSubreddits(subreddits.filter(s => s !== subredditToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label>Keywords</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywords.map((keyword, index) => (
                <div
                  key={`${keyword}-${index}`}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    disabled={isSaving}
                    className="text-secondary-foreground/50 hover:text-secondary-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword"
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddKeyword}
                disabled={isSaving}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subreddits</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {subreddits.map((subreddit, index) => (
                <div
                  key={`${subreddit}-${index}`}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                >
                  <span>r/{subreddit}</span>
                  <button
                    onClick={() => handleRemoveSubreddit(subreddit)}
                    disabled={isSaving}
                    className="text-secondary-foreground/50 hover:text-secondary-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSubreddit}
                onChange={(e) => setNewSubreddit(e.target.value)}
                placeholder="Add subreddit"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubreddit()}
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddSubreddit}
                disabled={isSaving}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

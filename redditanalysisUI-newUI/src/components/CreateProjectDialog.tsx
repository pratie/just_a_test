// src/components/CreateProjectDialog.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from 'react-hook-form';
import { Project } from '@/lib/api';
import { api } from '@/lib/api';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: Omit<Project, 'id'>) => Promise<void>;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated
}: CreateProjectDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const form = useForm<Omit<Project, 'id'>>({
    defaultValues: {
      name: '',
      description: '',
      keywords: [],
      subreddits: []
    },
    mode: 'onChange'
  });

  const { watch, formState: { isValid }, reset } = form;
  const description = watch('description');
  const name = watch('name');

  const isFormValid = name && description && description.length >= 10;

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      reset();
      setStep(1);
    }
  }, [open, reset]);

  const handleAnalyze = async () => {
    if (!isFormValid) {
      toast.error('Please enter a project name and description (at least 10 characters)');
      return;
    }

    setLoading(true);
    setLoadingMessage('Analyzing your project...');
    try {
      const data = await api.analyzeInitial({
        name: form.getValues('name'),
        description: form.getValues('description'),
      });
      
      form.setValue('keywords', data.keywords);
      form.setValue('subreddits', data.subreddits);
      setStep(2);
    } catch (error) {
      toast.error('Failed to analyze project. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setLoadingMessage('Creating your project...');
    try {
      const projectData = form.getValues();
      // Ensure keywords and subreddits are arrays and properly formatted
      const formattedData = {
        ...projectData,
        keywords: Array.isArray(projectData.keywords) ? projectData.keywords : [],
        subreddits: Array.isArray(projectData.subreddits) ? projectData.subreddits.map(s => s.replace(/^r\//, '')) : []
      };

      await onProjectCreated(formattedData);
      onOpenChange(false);
      toast.success('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            {step === 1 ? 
              "Enter your project details to get started" :
              "Review and customize your project settings"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Project Name</label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  {...form.register('name')}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  placeholder="Describe your project (min. 10 characters)"
                  {...form.register('description')}
                  className="min-h-[100px]"
                  disabled={loading}
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                className="w-full"
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingMessage}
                  </>
                ) : (
                  'Analyze & Continue'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {form.watch('keywords').map((keyword, index) => (
                    <Badge key={`${keyword}-${index}`} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-2">Subreddits</h3>
                <div className="flex flex-wrap gap-2">
                  {form.watch('subreddits').map((subreddit, index) => (
                    <Badge key={`${subreddit}-${index}`} variant="secondary">
                      r/{subreddit}
                    </Badge>
                  ))}
                </div>
              </Card>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {loadingMessage}
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
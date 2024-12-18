'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Toaster, toast } from 'sonner';
import { api, Project } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadProjects();
  }, [user, router]);

  const loadProjects = async () => {
    try {
      const fetchedProjects = await api.getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id'>) => {
    try {
      const newProject = await api.createProject(projectData);
      setProjects(prevProjects => [...prevProjects, newProject]);
      toast.success('Project created successfully!');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project. Please try again.');
      throw error; // Propagate error to dialog
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      // Optimistically update UI
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      
      await api.deleteProject(projectId);
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Delete project error:', error);
      // Revert the optimistic update
      loadProjects();
      toast.error('Failed to delete project. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-medium">Your Projects</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Create your first project to start tracking Reddit mentions</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} />
          ))}
        </div>
      )}

      <CreateProjectDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onProjectCreated={handleCreateProject}
      />
    </div>
  );
}
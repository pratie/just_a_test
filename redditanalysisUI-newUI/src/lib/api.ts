// API configuration and endpoints
import { getAuthToken, getUserEmail } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 600000; // 10 minutes

const getHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            credentials: 'include',
        });
        clearTimeout(id);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
        }
        throw error;
    }
};

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = getHeaders();
    return fetchWithTimeout(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
        mode: 'cors',
        credentials: 'include',
    });
};

const handleApiError = async (response: Response, defaultMessage: string): Promise<never> => {
    let errorMessage = defaultMessage;
    try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.detail || defaultMessage;
        } else {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
        }
    } catch (error) {
        console.error('Error parsing error response:', error);
        if (response.statusText) errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
};

export interface Project {
    id: string;
    name: string;
    description: string;
    keywords: string[];
    subreddits: string[];
}

export interface RedditPost {
    title: string;
    content: string;
    url: string;
    subreddit: string;
    created_utc: number;
    score: number;
    num_comments: number;
    relevance_score: number;
    matched_keywords: string[];
    suggested_comment?: string;
}

export interface AnalysisResponse {
    posts: RedditPost[];
    status: string;
}

export interface RedditMention {
    id: number;
    brand_id: number;
    title: string;
    content: string;
    url: string;
    subreddit: string;
    keyword: string;
    score: number;
    num_comments: number;
    suggested_comment: string;
    created_at: string;
    formatted_date: string;
    relevance_score: number;
    created_utc: number;
    matching_keywords: string[];
}

export const api = {
    // Project Management
    async createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
        const response = await fetchWithAuth(`${API_BASE_URL}/projects/`, {
            method: 'POST',
            body: JSON.stringify(projectData),
        });

        if (!response.ok) {
            await handleApiError(response, 'Failed to create project');
        }

        return response.json();
    },

    async getProjects(): Promise<Project[]> {
        const response = await fetchWithAuth(`${API_BASE_URL}/projects/`, {
            method: 'GET',
        });

        if (!response.ok) {
            await handleApiError(response, 'Failed to fetch projects');
        }

        return response.json();
    },

    async getProject(projectId: string): Promise<Project> {
        const response = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            await handleApiError(response, 'Failed to fetch project');
        }

        return response.json();
    },

    async deleteProject(projectId: string): Promise<void> {
        const response = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            await handleApiError(response, 'Failed to delete project');
        }
    },

    async updateProject(projectId: string, projectData: Partial<Project>, options: { runAnalysis?: boolean } = {}): Promise<Project> {
        const userEmail = getUserEmail();
        if (!userEmail) {
            throw new Error('User email not found. Please log in again.');
        }

        try {
            // Send all project data in a single request
            const response = await fetchWithAuth(
                `${API_BASE_URL}/projects/${projectId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: projectData.name,
                        description: projectData.description,
                        keywords: projectData.keywords || [],
                        subreddits: (projectData.subreddits || []).map(s => s.replace(/^r\//, '')),
                        user_email: userEmail
                    }),
                }
            );

            if (!response.ok) {
                await handleApiError(response, 'Failed to update project');
            }

            // Run analysis if requested
            if (options.runAnalysis && projectData.keywords && projectData.subreddits) {
                await api.analyzeReddit({
                    brand_id: projectId,
                    keywords: projectData.keywords,
                    subreddits: projectData.subreddits,
                });
            }

            // Get updated project
            return await api.getProject(projectId);
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    },

    // Initial Analysis
    async analyzeInitial(data: { name: string; description: string }): Promise<{ keywords: string[]; subreddits: string[] }> {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/analyze/initial`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    name: data.name,
                    description: data.description
                }),
            });

            if (!response.ok) {
                await handleApiError(response, 'Failed to analyze project');
            }

            return response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error while analyzing project');
        }
    },

    // Reddit Analysis
    async analyzeReddit(params: {
        brand_id: string;
        keywords: string[];
        subreddits: string[];
        time_period?: 'day' | 'week' | 'month';
        limit?: number;
    }): Promise<AnalysisResponse> {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/analyze/reddit`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    brand_id: parseInt(params.brand_id, 10), // Convert string ID to number
                    keywords: params.keywords,
                    subreddits: params.subreddits,
                    time_period: params.time_period || 'day',
                    limit: params.limit || 20,
                }),
            });

            if (!response.ok) {
                await handleApiError(response, 'Failed to analyze Reddit posts');
            }

            return response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error while analyzing Reddit posts');
        }
    },

    // Mentions
    async getMentions(brandId: string): Promise<RedditMention[]> {
        const response = await fetchWithAuth(`${API_BASE_URL}/mentions/${parseInt(brandId, 10)}/`, {
            method: 'GET',
        });

        if (!response.ok) {
            await handleApiError(response, 'Failed to fetch mentions');
        }

        const mentions = await response.json();
        return mentions.map((mention: any) => ({
            ...mention,
            matching_keywords: Array.isArray(mention.matching_keywords) 
                ? mention.matching_keywords 
                : JSON.parse(mention.matching_keywords || '[]'),
            created_utc: mention.created_utc || Math.floor(new Date(mention.created_at).getTime() / 1000),
            score: mention.score || 0,
            num_comments: mention.num_comments || 0,
            relevance_score: mention.relevance_score || 0,
            suggested_comment: mention.suggested_comment || ""
        }));
    },

    async refreshMentions(
      brandId: string, 
      keywords: string[], 
      subreddits: string[],
      options: {
        time_period?: 'day' | 'week' | 'month';
        limit?: number;
      } = {}
    ): Promise<RedditMention[]> {
        try {
            // First, analyze Reddit and save new mentions
            await api.analyzeReddit({
                brand_id: brandId,
                keywords: keywords,
                subreddits: subreddits,
                time_period: options.time_period || 'week',
                limit: options.limit || 100 // Default to 100 posts if not specified
            });

            // Then immediately fetch the updated mentions
            return await api.getMentions(brandId);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error while refreshing mentions');
        }
    },
};

'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Target, Brain, Filter } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/projects');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-medium tracking-tight bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-transparent bg-clip-text">
            Find Hidden Opportunities on Reddit with AI
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI analyzes Reddit's vast community, suggests perfect keywords and subreddits, and scores leads based on relevance to your project. Stop manual searching - start smart lead discovery.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button 
              onClick={() => router.push('/login')}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg"
            >
              Start Finding Leads
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-6 text-lg"
              onClick={() => {
                const howItWorksSection = document.getElementById('how-it-works');
                howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See How It Works
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="how-it-works" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* AI-Powered Search */}
            <div className="text-center">
              <div className="flex justify-center">
                <Brain className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="mt-6 text-xl font-medium">AI-Powered Search</h3>
              <p className="mt-4 text-gray-600">
                Smart keyword and subreddit suggestions powered by advanced AI algorithms
              </p>
            </div>

            {/* Relevance Scoring */}
            <div className="text-center">
              <div className="flex justify-center">
                <Target className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-6 text-xl font-medium">Relevance Scoring</h3>
              <p className="mt-4 text-gray-600">
                AI-scored leads based on your criteria for maximum efficiency
              </p>
            </div>

            {/* Smart Filtering */}
            <div className="text-center">
              <div className="flex justify-center">
                <Filter className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="mt-6 text-xl font-medium">Smart Filtering</h3>
              <p className="mt-4 text-gray-600">
                Focus on high-potential opportunities with intelligent filtering
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-medium">Ready to discover opportunities?</h2>
          <p className="mt-4 text-xl">Start finding valuable leads on Reddit today.</p>
          <Button 
            onClick={() => router.push('/login')}
            size="lg"
            variant="secondary"
            className="mt-8 bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg"
          >
            Try SneakyGuy Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

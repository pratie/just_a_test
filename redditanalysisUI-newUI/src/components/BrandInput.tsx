// src/components/BrandInput.tsx
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Rocket } from 'lucide-react';

interface BrandInputProps {
  onAnalyze: (name: string, description: string) => Promise<void>;
}

export function BrandInput({ onAnalyze }: BrandInputProps) {
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onAnalyze(brandName, description);
    setLoading(false);
  };

  return (
    <Card className="overflow-hidden bg-white shadow-xl border-0 transition-transform duration-300 hover:scale-[1.01]">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center space-x-2">
          <Rocket className="w-6 h-6" />
          <span>Start Your Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Brand Name</label>
            <Input
              placeholder="Enter your brand name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Description</label>
            <Textarea
              placeholder="Describe your brand and what you'd like to analyze..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !brandName || !description}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
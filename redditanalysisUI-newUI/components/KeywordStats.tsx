import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KeywordStatsProps {
  keyword: string;
  stats: {
    lastMonth: number;
    last24h: number;
  };
  onDelete?: () => void;
}

interface KeywordCardProps {
  title: string;
  stats: {
    lastMonth: number;
    last24h: number;
  };
  onDelete?: () => void;
}

const KeywordCard = ({ title, stats, onDelete }: KeywordCardProps) => (
  <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      )}
    </div>
    <div className="space-y-1">
      <h4 className="font-medium text-gray-700">Replies</h4>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Last month: <span className="font-semibold text-gray-900">{stats.lastMonth}</span></span>
        <span className="text-gray-600">Last 24h: <span className="font-semibold text-gray-900">{stats.last24h}</span></span>
      </div>
    </div>
  </Card>
);

export const KeywordStats = ({ keywords, mentions }: { 
  keywords: string[];
  mentions: any[];
}) => {
  // Calculate stats for each keyword type
  const getStats = (keyword: string) => {
    const now = Date.now() / 1000; // Convert to Unix timestamp
    const last24h = mentions.filter(m => 
      m.created_utc >= now - 24 * 60 * 60 && 
      m.matching_keywords.includes(keyword)
    ).length;
    
    const lastMonth = mentions.filter(m => 
      m.created_utc >= now - 30 * 24 * 60 * 60 && 
      m.matching_keywords.includes(keyword)
    ).length;

    return { last24h, lastMonth };
  };

  // Calculate stats for different categories
  const instantLeadsStats = mentions.reduce((acc, m) => {
    const isLead = m.relevance_score >= 80;
    const isLast24h = m.created_utc >= (Date.now() / 1000) - 24 * 60 * 60;
    const isLastMonth = m.created_utc >= (Date.now() / 1000) - 30 * 24 * 60 * 60;
    
    return {
      last24h: acc.last24h + (isLead && isLast24h ? 1 : 0),
      lastMonth: acc.lastMonth + (isLead && isLastMonth ? 1 : 0),
    };
  }, { last24h: 0, lastMonth: 0 });

  const relevantPostsStats = mentions.reduce((acc, m) => {
    const isRelevant = m.relevance_score >= 60 && m.relevance_score < 80;
    const isLast24h = m.created_utc >= (Date.now() / 1000) - 24 * 60 * 60;
    const isLastMonth = m.created_utc >= (Date.now() / 1000) - 30 * 24 * 60 * 60;
    
    return {
      last24h: acc.last24h + (isRelevant && isLast24h ? 1 : 0),
      lastMonth: acc.lastMonth + (isRelevant && isLastMonth ? 1 : 0),
    };
  }, { last24h: 0, lastMonth: 0 });

  const discussionsStats = mentions.reduce((acc, m) => {
    const isDiscussion = m.relevance_score >= 40 && m.relevance_score < 60;
    const isLast24h = m.created_utc >= (Date.now() / 1000) - 24 * 60 * 60;
    const isLastMonth = m.created_utc >= (Date.now() / 1000) - 30 * 24 * 60 * 60;
    
    return {
      last24h: acc.last24h + (isDiscussion && isLast24h ? 1 : 0),
      lastMonth: acc.lastMonth + (isDiscussion && isLastMonth ? 1 : 0),
    };
  }, { last24h: 0, lastMonth: 0 });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Keywords</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KeywordCard
          title="Instant Leads"
          stats={instantLeadsStats}
        />
        <KeywordCard
          title="Relevant Posts"
          stats={relevantPostsStats}
        />
        <KeywordCard
          title="Reddit Posts"
          stats={{ lastMonth: mentions.length, last24h: mentions.filter(m => m.created_utc >= (Date.now() / 1000) - 24 * 60 * 60).length }}
        />
        <KeywordCard
          title="Reddit Discussions"
          stats={discussionsStats}
        />
        <KeywordCard
          title="Reddit Leads"
          stats={instantLeadsStats}
        />
      </div>
    </div>
  );
};

export default KeywordStats;

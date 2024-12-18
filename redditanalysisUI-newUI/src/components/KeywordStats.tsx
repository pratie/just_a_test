import { Card } from '@/components/ui/card';

interface KeywordStatsProps {
  keywords: string[];
  mentions: any[];
}

interface KeywordCardProps {
  keyword: string;
  stats: {
    lastMonth: number;
    last24h: number;
  };
}

const KeywordCard = ({ keyword, stats }: KeywordCardProps) => (
  <Card className="p-4 hover:shadow-sm transition-shadow duration-200">
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900 truncate" title={keyword}>
        {keyword}
      </h3>
      <div>
        <h4 className="text-xs font-medium text-gray-500 mb-1">Mentions</h4>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">
            Last month: <span className="font-semibold text-gray-900">{stats.lastMonth}</span>
          </span>
          <span className="text-gray-600">
            Last 24h: <span className="font-semibold text-gray-900">{stats.last24h}</span>
          </span>
        </div>
      </div>
    </div>
  </Card>
);

export const KeywordStats = ({ keywords, mentions }: KeywordStatsProps) => {
  // Calculate stats for each keyword
  const getKeywordStats = (keyword: string) => {
    const now = Date.now() / 1000; // Convert to Unix timestamp
    const last24h = mentions.filter(m => 
      m.created_utc >= now - 24 * 60 * 60 && 
      m.matching_keywords?.includes(keyword)
    ).length;
    
    const lastMonth = mentions.filter(m => 
      m.created_utc >= now - 30 * 24 * 60 * 60 && 
      m.matching_keywords?.includes(keyword)
    ).length;

    return { last24h, lastMonth };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Keywords</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {keywords.map((keyword, index) => (
          <KeywordCard
            key={index}
            keyword={keyword}
            stats={getKeywordStats(keyword)}
          />
        ))}
      </div>
    </div>
  );
};

export default KeywordStats;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, Calendar } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface LotteryNewsItem {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published_at: string;
  is_featured: boolean;
  created_at: string;
}

const LotteryNews = () => {
  const [news, setNews] = useState<LotteryNewsItem[]>([]);
  const [featuredNews, setFeaturedNews] = useState<LotteryNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
    
    // Subscribe to new lottery news
    const channel = supabase
      .channel('public:lottery_news')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'lottery_news'
      }, (payload) => {
        const newItem = payload.new as LotteryNewsItem;
        if (newItem.is_featured) {
          setFeaturedNews(prev => [newItem, ...prev]);
        } else {
          setNews(prev => [newItem, ...prev]);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Get featured news
      const { data: featured, error: featuredError } = await supabase
        .from('lottery_news')
        .select('*')
        .eq('is_featured', true)
        .order('published_at', { ascending: false });
        
      if (featuredError) throw featuredError;
      
      // Get regular news
      const { data: regular, error: regularError } = await supabase
        .from('lottery_news')
        .select('*')
        .eq('is_featured', false)
        .order('published_at', { ascending: false });
        
      if (regularError) throw regularError;
      
      setFeaturedNews(featured || []);
      setNews(regular || []);
    } catch (error) {
      console.error('Error fetching lottery news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-amber-50 rounded-lg mr-3">
            <Newspaper className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-lottery-dark">Lottery News</h2>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-amber-50 rounded-lg mr-3">
          <Newspaper className="w-5 h-5 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-lottery-dark">Lottery News</h2>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {featuredNews.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Featured News</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredNews.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader className={!item.image_url ? "pb-2" : ""}>
                    <CardTitle>{item.title}</CardTitle>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {formatDistance(new Date(item.published_at), new Date(), { addSuffix: true })}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="line-clamp-3">{item.content}</p>
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Read more
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Latest News</h3>
          
          {news.length > 0 ? (
            news.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md">{item.title}</CardTitle>
                    <div className="text-xs text-gray-500">
                      {formatDistance(new Date(item.published_at), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <p className="line-clamp-2 text-sm">{item.content}</p>
                </CardContent>
                
                <CardFooter className="pt-2 flex justify-end">
                  <Button variant="ghost" size="sm" className="text-sm p-0 h-auto">
                    Read more
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-lottery-gray">
              <Newspaper className="w-12 h-12 mx-auto mb-3 text-lottery-gray/30" />
              <p>No news articles available at the moment.</p>
              <p className="text-sm mt-2">Check back later for updates!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LotteryNews;

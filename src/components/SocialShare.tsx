
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Copy, 
  Check,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  title?: string;
  description?: string;
  url?: string;
  hashtags?: string[];
  image?: string;
  prize?: number;
}

const SocialShare = ({ 
  title = "I'm playing LottoWin!", 
  description = "Join me on LottoWin for a chance to win big prizes!",
  url = window.location.href,
  hashtags = ['lottery', 'jackpot', 'lottowin'],
  image = '',
  prize
}: SocialShareProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedUrl = encodeURIComponent(url);
  const encodedHashtags = encodeURIComponent(hashtags.join(','));
  
  const generateMessage = () => {
    if (prize) {
      return encodeURIComponent(`I just won $${prize.toLocaleString()} playing LottoWin! Join me for your chance to win: `);
    }
    return encodedDescription;
  };
  
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?text=${generateMessage()}&url=${encodedUrl}&hashtags=${encodedHashtags}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  };
  
  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'email') => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=450');
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'Share link has been copied to clipboard',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: 'Copy failed',
        description: 'Could not copy the link to clipboard',
        variant: 'destructive',
      });
    }
  };
  
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        toast({
          title: 'Shared successfully',
          description: 'Content was shared successfully',
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      toast({
        title: 'Not supported',
        description: 'Web Share API is not supported in your browser',
        variant: 'destructive',
      });
    }
  };
  
  // Generate a message based on whether there's a prize
  const shareMessage = prize 
    ? `I just won $${prize.toLocaleString()} on LottoWin! Come join me!` 
    : "Join me on LottoWin for a chance to win big prizes!";
  
  return (
    <motion.div 
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-50 rounded-lg mr-3">
          <Share2 className="w-5 h-5 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-lottery-dark">Share Your Experience</h2>
      </div>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-lg font-medium text-lottery-dark">{shareMessage}</p>
          {prize && (
            <div className="mt-2 text-2xl font-bold text-lottery-gold">
              ${prize.toLocaleString()}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            variant="outline" 
            className="flex-1 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-0"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="h-5 w-5 mr-2" />
            <span className="sr-only sm:not-sr-only sm:inline-block">Facebook</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white border-0"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="h-5 w-5 mr-2" />
            <span className="sr-only sm:not-sr-only sm:inline-block">Twitter</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1 bg-[#0077B5] hover:bg-[#0077B5]/90 text-white border-0"
            onClick={() => handleShare('linkedin')}
          >
            <Linkedin className="h-5 w-5 mr-2" />
            <span className="sr-only sm:not-sr-only sm:inline-block">LinkedIn</span>
          </Button>
          
          <Button 
            variant="outline"
            className="flex-1 bg-[#EA4335] hover:bg-[#EA4335]/90 text-white border-0"
            onClick={() => handleShare('email')}
          >
            <Mail className="h-5 w-5 mr-2" />
            <span className="sr-only sm:not-sr-only sm:inline-block">Email</span>
          </Button>
        </div>
        
        <div className="flex gap-3">
          {navigator.share && (
            <Button 
              variant="outline"
              className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={nativeShare}
            >
              <Share2 className="h-5 w-5 mr-2" />
              Native Share
            </Button>
          )}
          
          <Button 
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-50"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SocialShare;

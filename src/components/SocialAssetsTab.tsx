import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SocialAsset {
  id: number;
  type: string;
  status: string;
  payload_json: any;
  created_at: string;
}

interface SocialAssetsTabProps {
  listingId: string;
  listingData: {
    address_line: string;
    suburb: string;
    beds: number;
    baths: number;
    land_size_sqm: number;
  };
}

export function SocialAssetsTab({ listingId, listingData }: SocialAssetsTabProps) {
  const [assets, setAssets] = useState<SocialAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});

  useEffect(() => {
    loadAssets();
  }, [listingId]);

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('social_assets')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async (asset: SocialAsset) => {
    setGenerating(asset.type);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate_social_asset', {
        body: {
          assetType: asset.type,
          listingData,
          caption: asset.payload_json.caption
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('Please add credits to your workspace to continue generating images.');
        } else {
          toast.error('Failed to generate image');
        }
        return;
      }

      if (data.success && data.imageUrl) {
        setGeneratedImages(prev => ({
          ...prev,
          [asset.id]: data.imageUrl
        }));
        toast.success('Image generated successfully!');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setGenerating(null);
    }
  };

  const getAssetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      post: 'Instagram Post',
      reels_short: 'Short Reel (15s)',
      reels_long: 'Long Reel (60s)',
      reels_deep: 'Story Reel (90s)',
      carousel: 'Carousel Post'
    };
    return labels[type] || type;
  };

  const getAssetTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      post: 'Square format (1080x1080) perfect for feed posts',
      reels_short: 'Quick property tour highlight',
      reels_long: 'Complete walkthrough video',
      reels_deep: 'In-depth story with narrative',
      carousel: 'Multi-slide swipeable post'
    };
    return descriptions[type] || '';
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading assets...</div>;
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No social assets created yet</p>
        <p className="text-sm text-muted-foreground">Social assets will appear here once generated</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Social Media Assets</h2>
          <p className="text-muted-foreground">Generate AI-powered visuals for each asset type</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardHeader>
              <CardTitle className="text-lg">{getAssetTypeLabel(asset.type)}</CardTitle>
              <CardDescription>{getAssetTypeDescription(asset.type)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {asset.payload_json.caption && (
                <div className="text-sm text-muted-foreground">
                  <strong>Caption:</strong> {asset.payload_json.caption.substring(0, 100)}
                  {asset.payload_json.caption.length > 100 && '...'}
                </div>
              )}

              {generatedImages[asset.id] && (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={generatedImages[asset.id]}
                    alt={getAssetTypeLabel(asset.type)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleGenerateImage(asset)}
                  disabled={generating === asset.type}
                  className="flex-1"
                >
                  {generating === asset.type ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {generatedImages[asset.id] ? 'Regenerate' : 'Generate Image'}
                    </>
                  )}
                </Button>
                
                {generatedImages[asset.id] && (
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a href={generatedImages[asset.id]} download={`${asset.type}-${listingData.address_line}.png`}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{asset.status}</span>
                {asset.payload_json.platform && (
                  <>
                    <span>•</span>
                    <span>{asset.payload_json.platform}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

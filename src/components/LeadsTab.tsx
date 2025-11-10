import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Eye, Heart, Play, MessageCircle, Users, Mail, Phone } from "lucide-react";

interface LeadsTabProps {
  listingId: string;
}

export function LeadsTab({ listingId }: LeadsTabProps) {
  // Dummy social media metrics
  const socialMetrics = {
    instagram: {
      posts: {
        views: 15234,
        likes: 892,
        comments: 47,
        shares: 23
      },
      reels: {
        views: 45678,
        likes: 2341,
        comments: 156,
        shares: 89
      },
      stories: {
        views: 8923,
        replies: 34
      }
    },
    facebook: {
      reach: 23456,
      engagement: 1234,
      clicks: 567
    }
  };

  // Dummy leads data
  const leads = [
    {
      id: 1,
      name: "Sarah Mitchell",
      email: "sarah.m@email.com",
      phone: "+61 412 345 678",
      source: "Instagram Post",
      date: "2025-11-09",
      status: "Hot"
    },
    {
      id: 2,
      name: "James Chen",
      email: "james.chen@email.com",
      phone: "+61 423 456 789",
      source: "Instagram Reel",
      date: "2025-11-08",
      status: "Warm"
    },
    {
      id: 3,
      name: "Emma Thompson",
      email: "emma.t@email.com",
      phone: "+61 434 567 890",
      source: "Facebook Post",
      date: "2025-11-07",
      status: "Hot"
    },
    {
      id: 4,
      name: "Michael Wong",
      email: "m.wong@email.com",
      phone: "+61 445 678 901",
      source: "Instagram Story",
      date: "2025-11-07",
      status: "Cold"
    },
    {
      id: 5,
      name: "Lisa Anderson",
      email: "lisa.a@email.com",
      phone: "+61 456 789 012",
      source: "Instagram Post",
      date: "2025-11-06",
      status: "Warm"
    }
  ];

  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.status === "Hot").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Leads & Performance</h2>
        <p className="text-muted-foreground">Track social media performance and lead generation</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold text-foreground">{totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hot Leads</p>
                <p className="text-3xl font-bold text-foreground">{hotLeads}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold text-foreground">12.3%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reach</p>
                <p className="text-3xl font-bold text-foreground">69.4K</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Instagram Performance</CardTitle>
          <CardDescription>Engagement metrics across all Instagram content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Posts */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">Posts</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Views</div>
                    <div className="font-semibold">{socialMetrics.instagram.posts.views.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                    <div className="font-semibold">{socialMetrics.instagram.posts.likes.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                    <div className="font-semibold">{socialMetrics.instagram.posts.comments}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Shares</div>
                    <div className="font-semibold">{socialMetrics.instagram.posts.shares}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reels */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">Reels</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Views</div>
                    <div className="font-semibold">{socialMetrics.instagram.reels.views.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                    <div className="font-semibold">{socialMetrics.instagram.reels.likes.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                    <div className="font-semibold">{socialMetrics.instagram.reels.comments}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Shares</div>
                    <div className="font-semibold">{socialMetrics.instagram.reels.shares}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stories */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">Stories</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Views</div>
                    <div className="font-semibold">{socialMetrics.instagram.stories.views.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Replies</div>
                    <div className="font-semibold">{socialMetrics.instagram.stories.replies}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facebook Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Facebook Performance</CardTitle>
          <CardDescription>Reach and engagement on Facebook</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold text-foreground">{socialMetrics.facebook.reach.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Reach</div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold text-foreground">{socialMetrics.facebook.engagement.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">Engagements</div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold text-foreground">{socialMetrics.facebook.clicks.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">Link Clicks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>Captured leads from social media campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{lead.name}</div>
                  <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Source: {lead.source} • {lead.date}
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'Hot'
                        ? 'bg-red-100 text-red-700'
                        : lead.status === 'Warm'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

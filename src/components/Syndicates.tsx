import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Clock, Ticket, Award, X, Check, Info } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { safeCast } from '@/lib/supabaseUtils';

interface Syndicate {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  max_members: number;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

interface SyndicateMember {
  id: string;
  user_id: string;
  contribution_percentage: number;
  joined_at: string;
  email?: string;
  username?: string;
}

const Syndicates = () => {
  const [ownedSyndicates, setOwnedSyndicates] = useState<Syndicate[]>([]);
  const [joinedSyndicates, setJoinedSyndicates] = useState<Syndicate[]>([]);
  const [publicSyndicates, setPublicSyndicates] = useState<Syndicate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentSyndicate, setCurrentSyndicate] = useState<Syndicate | null>(null);
  const [members, setMembers] = useState<SyndicateMember[]>([]);
  const [creatingForm, setCreatingForm] = useState({
    name: '',
    description: '',
    maxMembers: 10
  });
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setCurrentUser({ id: data.session.user.id });
      }
    };
    
    checkAuth();
    
    fetchSyndicates();
  }, []);

  const fetchSyndicates = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        setLoading(false);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const { data: owned, error: ownedError } = await supabase
        .from('syndicates')
        .select(`
          *,
          syndicate_members!syndicate_id(count)
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
        
      if (ownedError) throw ownedError;
      
      const ownedTyped = safeCast<any>(owned).map(s => ({
        ...s,
        member_count: s.syndicate_members?.length || 0
      }));
      
      const { data: joined, error: joinedError } = await supabase
        .from('syndicate_members')
        .select(`
          syndicates!syndicate_id(*),
          syndicate_id
        `)
        .eq('user_id', userId);
        
      if (joinedError) throw joinedError;
      
      const joinedSyndicatesData = safeCast<any>(joined)
        .map(j => j.syndicates)
        .filter(s => s && s.owner_id !== userId);
      
      const { data: public_syndicates, error: publicError } = await supabase
        .from('syndicates')
        .select(`
          *,
          syndicate_members!syndicate_id(count)
        `)
        .neq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (publicError) throw publicError;
      
      const joinedIds = safeCast<any>(joined).map(j => j.syndicate_id);
      const availablePublicSyndicates = safeCast<any>(public_syndicates)
        .filter(s => !joinedIds.includes(s.id))
        .map(s => ({
          ...s,
          member_count: s.syndicate_members?.length || 0
        }))
        .filter(s => s.member_count < s.max_members);
      
      setOwnedSyndicates(ownedTyped);
      setJoinedSyndicates(joinedSyndicatesData);
      setPublicSyndicates(availablePublicSyndicates);
    } catch (error) {
      console.error('Error fetching syndicates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load syndicates.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const viewSyndicateDetails = async (syndicate: Syndicate) => {
    setCurrentSyndicate(syndicate);
    setViewDialogOpen(true);
    
    try {
      const { data: membersData, error } = await supabase
        .from('syndicate_members')
        .select(`
          *,
          profiles:user_id(email, username)
        `)
        .eq('syndicate_id', syndicate.id)
        .order('joined_at', { ascending: false });
        
      if (error) throw error;
      
      const formattedMembers = safeCast<any>(membersData).map(m => ({
        ...m,
        email: m.profiles?.email || '',
        username: m.profiles?.username || '',
      }));
      
      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching syndicate members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load syndicate members.',
        variant: 'destructive',
      });
    }
  };

  const createSyndicate = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to create a syndicate',
          variant: 'destructive',
        });
        return;
      }
      
      if (!creatingForm.name.trim()) {
        toast({
          title: 'Name required',
          description: 'Please enter a name for your syndicate',
          variant: 'destructive',
        });
        return;
      }
      
      const { data: syndicateData, error: syndicateError } = await supabase
        .from('syndicates')
        .insert({
          name: creatingForm.name.trim(),
          description: creatingForm.description.trim() || null,
          owner_id: sessionData.session.user.id,
          max_members: creatingForm.maxMembers,
        } as any)
        .select()
        .single();
        
      if (syndicateError) throw syndicateError;
      
      const { error: memberError } = await supabase
        .from('syndicate_members')
        .insert({
          syndicate_id: syndicateData.id,
          user_id: sessionData.session.user.id,
          contribution_percentage: 1.0,
        } as any);
        
      if (memberError) throw memberError;
      
      toast({
        title: 'Syndicate created',
        description: 'Your lottery syndicate has been created successfully',
      });
      
      setCreatingForm({
        name: '',
        description: '',
        maxMembers: 10
      });
      
      setCreateDialogOpen(false);
      fetchSyndicates();
    } catch (error) {
      console.error('Error creating syndicate:', error);
      toast({
        title: 'Error',
        description: 'Failed to create syndicate.',
        variant: 'destructive',
      });
    }
  };

  const joinSyndicate = async (syndicateId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to join a syndicate',
          variant: 'destructive',
        });
        return;
      }
      
      const { data: existingMember, error: checkError } = await supabase
        .from('syndicate_members')
        .select('id')
        .eq('syndicate_id', syndicateId)
        .eq('user_id', sessionData.session.user.id);
        
      if (checkError) throw checkError;
      
      if (existingMember && existingMember.length > 0) {
        toast({
          title: 'Already a member',
          description: 'You are already a member of this syndicate',
        });
        return;
      }
      
      const { error: joinError } = await supabase
        .from('syndicate_members')
        .insert({
          syndicate_id: syndicateId,
          user_id: sessionData.session.user.id,
          contribution_percentage: 1.0,
        } as any);
        
      if (joinError) throw joinError;
      
      toast({
        title: 'Syndicate joined',
        description: 'You have successfully joined the syndicate',
      });
      
      fetchSyndicates();
    } catch (error) {
      console.error('Error joining syndicate:', error);
      toast({
        title: 'Error',
        description: 'Failed to join syndicate.',
        variant: 'destructive',
      });
    }
  };

  const leaveSyndicate = async (syndicateId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to leave a syndicate',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('syndicate_members')
        .delete()
        .eq('syndicate_id', syndicateId)
        .eq('user_id', sessionData.session.user.id);
        
      if (error) throw error;
      
      toast({
        title: 'Syndicate left',
        description: 'You have left the syndicate',
      });
      
      setViewDialogOpen(false);
      fetchSyndicates();
    } catch (error) {
      console.error('Error leaving syndicate:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave the syndicate.',
        variant: 'destructive',
      });
    }
  };

  const deleteSyndicate = async (syndicateId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) return;
      
      const { data: syndicate, error: checkError } = await supabase
        .from('syndicates')
        .select('owner_id')
        .eq('id', syndicateId)
        .single();
        
      if (checkError) throw checkError;
      
      if (syndicate.owner_id !== sessionData.session.user.id) {
        toast({
          title: 'Permission denied',
          description: 'You can only delete syndicates that you own',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('syndicates')
        .delete()
        .eq('id', syndicateId);
        
      if (error) throw error;
      
      toast({
        title: 'Syndicate deleted',
        description: 'Your syndicate has been deleted',
      });
      
      setViewDialogOpen(false);
      fetchSyndicates();
    } catch (error) {
      console.error('Error deleting syndicate:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete syndicate.',
        variant: 'destructive',
      });
    }
  };

  const getSyndicateTypeLabel = (syndicate: Syndicate) => {
    if (currentUser?.id && syndicate.owner_id === currentUser.id) {
      return (
        <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-1">
          Owner
        </span>
      );
    }
    return (
      <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
        Member
      </span>
    );
  };

  if (loading && ownedSyndicates.length === 0 && joinedSyndicates.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-50 rounded-lg mr-3">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-lottery-dark">Lottery Syndicates</h2>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-50 rounded-lg mr-3">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-lottery-dark">Lottery Syndicates</h2>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Syndicate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Lottery Syndicate</DialogTitle>
              <DialogDescription>
                Form a group to purchase tickets together and share the winnings.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="syndicate-name">Syndicate Name</Label>
                <Input 
                  id="syndicate-name" 
                  value={creatingForm.name}
                  onChange={(e) => setCreatingForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Lucky Winners"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="syndicate-desc">Description</Label>
                <Textarea 
                  id="syndicate-desc"
                  value={creatingForm.description}
                  onChange={(e) => setCreatingForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell potential members about your syndicate..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-members">Maximum Members</Label>
                <Input 
                  id="max-members" 
                  type="number"
                  min={1}
                  max={50}
                  value={creatingForm.maxMembers}
                  onChange={(e) => setCreatingForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 10 }))}
                />
                <p className="text-xs text-gray-500">
                  The more members, the more tickets you can buy, but smaller individual winnings.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createSyndicate}>
                Create Syndicate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="joined">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="joined">My Syndicates</TabsTrigger>
          <TabsTrigger value="owned">Managed by Me</TabsTrigger>
          <TabsTrigger value="available">Available to Join</TabsTrigger>
        </TabsList>
        
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-xl">
            {currentSyndicate && (
              <>
                <DialogHeader>
                  <DialogTitle>{currentSyndicate.name}</DialogTitle>
                  {currentSyndicate.description && (
                    <DialogDescription>
                      {currentSyndicate.description}
                    </DialogDescription>
                  )}
                </DialogHeader>
                
                <div className="py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Members ({members.length}/{currentSyndicate.max_members})</h3>
                    {(() => {
                      const { data: { session } } = supabase.auth.getSession();
                      if (session && currentSyndicate.owner_id !== session.user?.id) {
                        return (
                          <Button 
                            variant="outline" 
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => leaveSyndicate(currentSyndicate.id)}
                          >
                            Leave Syndicate
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {members.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {member.username?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.username || member.email || 'Anonymous'}</div>
                            <div className="text-xs text-gray-500">
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {(() => {
                          const { data: { session } } = supabase.auth.getSession();
                          const isOwner = currentSyndicate.owner_id === member.user_id;
                          
                          return (
                            <div>
                              {isOwner && (
                                <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-1">
                                  Owner
                                </span>
                              )}
                              
                              {session && currentSyndicate.owner_id === session.user?.id && !isOwner && (
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-full"
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Remove member</span>
                                </Button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
                
                <DialogFooter>
                  {(() => {
                    const { data: { session } } = supabase.auth.getSession();
                    if (session && currentSyndicate.owner_id === session.user?.id) {
                      return (
                        <Button 
                          variant="destructive"
                          onClick={() => deleteSyndicate(currentSyndicate.id)}
                        >
                          Delete Syndicate
                        </Button>
                      );
                    }
                    return null;
                  })()}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        <TabsContent value="joined">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedSyndicates.length > 0 || joinedSyndicates.length > 0 ? (
              <>
                {[...ownedSyndicates, ...joinedSyndicates].map((syndicate) => (
                  <Card key={syndicate.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{syndicate.name}</CardTitle>
                        {(() => {
                          const { data: { session } } = supabase.auth.getSession();
                          return session && getSyndicateTypeLabel(syndicate, session.user?.id);
                        })()}
                      </div>
                      {syndicate.description && (
                        <CardDescription className="line-clamp-2">
                          {syndicate.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-blue-500" />
                          <span>
                            {syndicate.member_count || 0}/{syndicate.max_members} members
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-blue-500" />
                          <span>
                            {new Date(syndicate.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => viewSyndicateDetails(syndicate)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </>
            ) : (
              <div className="col-span-full text-center py-8 text-lottery-gray">
                <Users className="w-12 h-12 mx-auto mb-3 text-lottery-gray/30" />
                <p>You're not a member of any syndicates yet.</p>
                <p className="text-sm mt-2">Create a new syndicate or join an existing one.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="owned">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedSyndicates.length > 0 ? (
              ownedSyndicates.map((syndicate) => (
                <Card key={syndicate.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{syndicate.name}</CardTitle>
                      <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-1">
                        Owner
                      </span>
                    </div>
                    {syndicate.description && (
                      <CardDescription className="line-clamp-2">
                        {syndicate.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-blue-500" />
                        <span>
                          {syndicate.member_count || 0}/{syndicate.max_members} members
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                        <span>
                          {new Date(syndicate.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => viewSyndicateDetails(syndicate)}
                    >
                      Manage Syndicate
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-lottery-gray">
                <UserPlus className="w-12 h-12 mx-auto mb-3 text-lottery-gray/30" />
                <p>You haven't created any syndicates yet.</p>
                <p className="text-sm mt-2">Create a syndicate to play with friends and increase your chances of winning.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicSyndicates.length > 0 ? (
              publicSyndicates.map((syndicate) => (
                <Card key={syndicate.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{syndicate.name}</CardTitle>
                    {syndicate.description && (
                      <CardDescription className="line-clamp-2">
                        {syndicate.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-blue-500" />
                        <span>
                          {syndicate.member_count || 0}/{syndicate.max_members} members
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                        <span>
                          {new Date(syndicate.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => viewSyndicateDetails(syndicate)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => joinSyndicate(syndicate.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Join
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-lottery-gray">
                <Award className="w-12 h-12 mx-auto mb-3 text-lottery-gray/30" />
                <p>No public syndicates are available right now.</p>
                <p className="text-sm mt-2">Create your own syndicate and invite others to join!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Syndicates;

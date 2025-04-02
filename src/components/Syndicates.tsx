import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/context/UserContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, User, X, Edit, Trash2, UserPlus } from 'lucide-react';
import { Syndicate, SyndicateMember, Profile } from '@/types/supabase';
import { extractProfileData } from '@/lib/supabaseUtils';

const createSyndicateSchema = z.object({
  name: z.string().min(3, { message: "Syndicate name must be at least 3 characters" }),
  description: z.string().optional(),
  max_members: z.number().int().min(2).max(50),
});

const joinSyndicateSchema = z.object({
  contribution_percentage: z.number().min(1).max(100),
});

const Syndicates = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [mySyndicates, setMySyndicates] = useState<Syndicate[]>([]);
  const [availableSyndicates, setAvailableSyndicates] = useState<Syndicate[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [selectedSyndicateId, setSelectedSyndicateId] = useState<string | null>(null);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const [syndicateMembers, setSyndicateMembers] = useState<SyndicateMember[]>([]);
  const [viewingSyndicateName, setViewingSyndicateName] = useState('');

  const createForm = useForm<z.infer<typeof createSyndicateSchema>>({
    resolver: zodResolver(createSyndicateSchema),
    defaultValues: {
      name: '',
      description: '',
      max_members: 10,
    },
  });

  const joinForm = useForm<z.infer<typeof joinSyndicateSchema>>({
    resolver: zodResolver(joinSyndicateSchema),
    defaultValues: {
      contribution_percentage: 1,
    },
  });

  const loadSyndicates = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('syndicates')
        .select(`
          *,
          syndicate_members!inner(user_id)
        `)
        .eq('syndicate_members.user_id', user.id);

      if (memberError) throw memberError;
      
      const { data: ownerData, error: ownerError } = await supabase
        .from('syndicates')
        .select(`
          *,
          syndicate_members(*)
        `)
        .eq('owner_id', user.id);

      if (ownerError) throw ownerError;

      const combinedSyndicates: Syndicate[] = [];
      const syndicateIds = new Set<string>();

      if (ownerData) {
        for (const syndicate of ownerData) {
          if (!syndicateIds.has(syndicate.id)) {
            syndicateIds.add(syndicate.id);
            
            const typedSyndicate: Syndicate = {
              id: syndicate.id,
              name: syndicate.name,
              description: syndicate.description,
              owner_id: syndicate.owner_id,
              max_members: syndicate.max_members,
              created_at: syndicate.created_at,
              updated_at: syndicate.updated_at,
              syndicate_members: syndicate.syndicate_members || []
            };
            
            combinedSyndicates.push(typedSyndicate);
          }
        }
      }

      if (memberData) {
        for (const syndicate of memberData) {
          if (!syndicateIds.has(syndicate.id)) {
            syndicateIds.add(syndicate.id);
            
            const typedSyndicate: Syndicate = {
              id: syndicate.id,
              name: syndicate.name,
              description: syndicate.description,
              owner_id: syndicate.owner_id,
              max_members: syndicate.max_members,
              created_at: syndicate.created_at,
              updated_at: syndicate.updated_at,
              syndicate_members: syndicate.syndicate_members ? syndicate.syndicate_members : []
            };
            
            combinedSyndicates.push(typedSyndicate);
          }
        }
      }

      setMySyndicates(combinedSyndicates);

      const { data: availableSyndicatesData, error: availableError } = await supabase
        .from('syndicates')
        .select(`
          *,
          syndicate_members(*)
        `)
        .neq('owner_id', user.id);

      if (availableError) throw availableError;

      if (availableSyndicatesData) {
        const filteredAvailableSyndicates = availableSyndicatesData
          .filter(syndicate => {
            const members = syndicate.syndicate_members || [];
            return !members.some(member => member.user_id === user.id);
          })
          .map(syndicate => {
            return {
              id: syndicate.id,
              name: syndicate.name,
              description: syndicate.description,
              owner_id: syndicate.owner_id,
              max_members: syndicate.max_members,
              created_at: syndicate.created_at,
              updated_at: syndicate.updated_at,
              syndicate_members: syndicate.syndicate_members || []
            } as Syndicate;
          });

        setAvailableSyndicates(filteredAvailableSyndicates);
      }
    } catch (error: any) {
      console.error('Error loading syndicates:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load syndicates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadSyndicates();
  }, [loadSyndicates]);

  const viewSyndicateMembers = async (syndicateId: string, syndicateName: string) => {
    setViewingSyndicateName(syndicateName);
    setSelectedSyndicateId(syndicateId);
    setLoading(true);
    
    try {
      const { data: members, error: membersError } = await supabase
        .from('syndicate_members')
        .select(`
          *,
          profiles:user_id(email, username)
        `)
        .eq('syndicate_id', syndicateId);

      if (membersError) throw membersError;
      
      if (members) {
        const formattedMembers: SyndicateMember[] = members.map(member => {
          const profileData = extractProfileData(member);
          return {
            id: member.id,
            syndicate_id: member.syndicate_id,
            user_id: member.user_id,
            joined_at: member.joined_at,
            contribution_percentage: member.contribution_percentage,
            username: profileData.username,
            email: profileData.email,
          };
        });
        
        setSyndicateMembers(formattedMembers);
      }
      
      setOpenMembersDialog(true);
    } catch (error: any) {
      console.error('Error loading syndicate members:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load syndicate members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onCreateSubmit = async (values: z.infer<typeof createSyndicateSchema>) => {
    if (!user) return;
    
    try {
      const { data: syndicateData, error: syndicateError } = await supabase
        .from('syndicates')
        .insert({
          name: values.name,
          description: values.description || '',
          owner_id: user.id,
          max_members: values.max_members,
        })
        .select()
        .single();
      
      if (syndicateError) throw syndicateError;
      
      if (!syndicateData) {
        throw new Error('Failed to create syndicate');
      }
      
      const { error: memberError } = await supabase
        .from('syndicate_members')
        .insert({
          syndicate_id: syndicateData.id,
          user_id: user.id,
          contribution_percentage: 1.0,
        });
      
      if (memberError) throw memberError;
      
      toast({
        title: 'Syndicate Created',
        description: `${values.name} has been created successfully.`,
      });
      
      setOpenCreateDialog(false);
      createForm.reset();
      loadSyndicates();
    } catch (error: any) {
      console.error('Error creating syndicate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create syndicate',
        variant: 'destructive',
      });
    }
  };

  const openJoinSyndicateDialog = (syndicateId: string) => {
    setSelectedSyndicateId(syndicateId);
    setOpenJoinDialog(true);
    joinForm.reset();
  };

  const onJoinSubmit = async (values: z.infer<typeof joinSyndicateSchema>) => {
    if (!user || !selectedSyndicateId) return;
    
    try {
      const { data: syndicate, error: syndicateError } = await supabase
        .from('syndicates')
        .select('*, syndicate_members(*)')
        .eq('id', selectedSyndicateId)
        .single();
      
      if (syndicateError) throw syndicateError;
      
      if (!syndicate) {
        throw new Error('Syndicate not found');
      }
      
      const memberCount = syndicate.syndicate_members ? syndicate.syndicate_members.length : 0;
      
      if (memberCount >= syndicate.max_members) {
        toast({
          title: 'Syndicate Full',
          description: 'This syndicate has reached its maximum member limit.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error: joinError } = await supabase
        .from('syndicate_members')
        .insert({
          syndicate_id: selectedSyndicateId,
          user_id: user.id,
          contribution_percentage: values.contribution_percentage,
        });
      
      if (joinError) throw joinError;
      
      toast({
        title: 'Joined Syndicate',
        description: `You have successfully joined the syndicate.`,
      });
      
      setOpenJoinDialog(false);
      joinForm.reset();
      loadSyndicates();
    } catch (error: any) {
      console.error('Error joining syndicate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join syndicate',
        variant: 'destructive',
      });
    }
  };

  const leaveSyndicate = async (syndicateId: string) => {
    if (!user) return;
    
    try {
      const { data, error: checkError } = await supabase
        .from('syndicates')
        .select('owner_id')
        .eq('id', syndicateId)
        .single();
      
      if (checkError) throw checkError;
      
      if (data.owner_id !== user.id) {
        toast({
          title: 'Unauthorized',
          description: 'Only the owner can delete a syndicate.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error: deleteError } = await supabase
        .from('syndicates')
        .delete()
        .eq('id', syndicateId);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: 'Syndicate Deleted',
        description: 'The syndicate has been successfully deleted.',
      });
      
      loadSyndicates();
    } catch (error: any) {
      console.error('Error leaving syndicate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to leave syndicate',
        variant: 'destructive',
      });
    }
  };

  const deleteSyndicate = async (syndicateId: string) => {
    if (!user) return;
    
    try {
      const { data, error: checkError } = await supabase
        .from('syndicates')
        .select('owner_id')
        .eq('id', syndicateId)
        .single();
      
      if (checkError) throw checkError;
      
      if (data.owner_id !== user.id) {
        toast({
          title: 'Unauthorized',
          description: 'Only the owner can delete a syndicate.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error: deleteError } = await supabase
        .from('syndicates')
        .delete()
        .eq('id', syndicateId);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: 'Syndicate Deleted',
        description: 'The syndicate has been successfully deleted.',
      });
      
      loadSyndicates();
    } catch (error: any) {
      console.error('Error deleting syndicate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete syndicate',
        variant: 'destructive',
      });
    }
  };

  const renderCreateDialog = () => (
    <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Syndicate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Syndicate</DialogTitle>
          <DialogDescription>
            Form a group to buy lottery tickets together and share the winnings.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <FormField
              control={createForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Syndicate Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter syndicate name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={createForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your syndicate" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={createForm.control}
              name="max_members"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Members</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={2} 
                      max={50} 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Create Syndicate</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const renderJoinDialog = () => (
    <Dialog open={openJoinDialog} onOpenChange={setOpenJoinDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Syndicate</DialogTitle>
          <DialogDescription>
            Enter your contribution percentage to join this syndicate.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...joinForm}>
          <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
            <FormField
              control={joinForm.control}
              name="contribution_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution Percentage</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={100} 
                      step={0.1}
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Join Syndicate</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const renderMembersDialog = () => (
    <Dialog open={openMembersDialog} onOpenChange={setOpenMembersDialog}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Members of {viewingSyndicateName}</DialogTitle>
          <DialogDescription>
            {syndicateMembers.length} members in this syndicate
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
          {syndicateMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {member.email?.[0]?.toUpperCase() || member.user_id[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.email || member.user_id.substring(0, 8)}</p>
                  <p className="text-sm text-gray-500">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{member.contribution_percentage}%</Badge>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderSyndicateCards = () => {
    return mySyndicates.map((syndicate) => {
      const memberCount = syndicate.syndicate_members?.length || 0;
      
      return (
        <Card key={syndicate.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{syndicate.name}</CardTitle>
              <Badge className={syndicate.owner_id === user.id ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                {syndicate.owner_id === user.id ? 'Owner' : 'Member'}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {syndicate.description || 'No description provided.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Users className="w-4 h-4" />
              <span>
                {memberCount} / {syndicate.max_members} members
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Created {new Date(syndicate.created_at).toLocaleDateString()}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewMembersClick(syndicate.id, syndicate.name)}
            >
              <Users className="w-4 h-4 mr-1" /> Members
            </Button>
            
            {syndicate.owner_id === user.id ? (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => deleteSyndicate(syndicate.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleLeaveSyndicateClick(syndicate.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" /> Leave
              </Button>
            )}
          </CardFooter>
        </Card>
      );
    });
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lottery Syndicates</CardTitle>
          <CardDescription>Sign in to view and join syndicates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium">Please Sign In</h3>
            <p className="text-gray-500 mt-2">You need to be logged in to view and manage syndicates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCreateSyndicateClick = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a syndicate",
        variant: "destructive"
      });
      return;
    }
    
    setOpenCreateDialog(true);
  };

  const handleJoinSyndicateClick = async (syndicateId: string) => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join a syndicate",
        variant: "destructive"
      });
      return;
    }
    
    openJoinSyndicateDialog(syndicateId);
  };

  const handleViewMembersClick = async (syndicateId: string, name: string) => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view syndicate members",
        variant: "destructive"
      });
      return;
    }
    
    viewSyndicateMembers(syndicateId, name);
  };

  const handleLeaveSyndicateClick = async (syndicateId: string) => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave a syndicate",
        variant: "destructive"
      });
      return;
    }
    
    leaveSyndicate(syndicateId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Lottery Syndicates</h2>
          <p className="text-gray-500">Play together with others to increase your chances of winning</p>
        </div>
        <Button onClick={handleCreateSyndicateClick} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Syndicate
        </Button>
      </div>
      
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lottery-blue"></div>
        </div>
      ) : (
        <>
          {/* My Syndicates Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5" /> 
              My Syndicates
            </h3>
            
            {mySyndicates.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="flex flex-col items-center">
                    <Users className="w-12 h-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium">No Syndicates Yet</h3>
                    <p className="text-gray-500 mt-2 mb-4">You haven't joined any syndicates yet.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderSyndicateCards()}
              </div>
            )}
          </div>
          
          {/* Available Syndicates Section */}
          <div className="space-y-4 mt-8">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> 
              Available Syndicates
            </h3>
            
            {availableSyndicates.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="flex flex-col items-center">
                    <Users className="w-12 h-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium">No Available Syndicates</h3>
                    <p className="text-gray-500 mt-2">Create a new syndicate to get started!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSyndicates.map((syndicate) => {
                  const memberCount = syndicate.syndicate_members?.length || 0;
                  const isFull = memberCount >= syndicate.max_members;
                  
                  return (
                    <Card key={syndicate.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{syndicate.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {syndicate.description || 'No description provided.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Users className="w-4 h-4" />
                          <span className={isFull ? 'text-red-500 font-medium' : 'text-gray-500'}>
                            {memberCount} / {syndicate.max_members} members
                            {isFull && ' (Full)'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Created {new Date(syndicate.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewMembersClick(syndicate.id, syndicate.name)}
                        >
                          <Users className="w-4 h-4 mr-1" /> Members
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleJoinSyndicateClick(syndicate.id)}
                          disabled={isFull}
                        >
                          <UserPlus className="w-4 h-4 mr-1" /> Join
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      
      {renderCreateDialog()}
      {renderJoinDialog()}
      {renderMembersDialog()}
    </div>
  );
};

export default Syndicates;

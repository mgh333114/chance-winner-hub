
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const notificationPreferencesSchema = z.object({
  draw_results: z.boolean(),
  ticket_purchases: z.boolean(),
  account_changes: z.boolean(),
  promotions: z.boolean(),
  syndicate_updates: z.boolean(),
});

type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

const NotificationPreferences = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<NotificationPreferences>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      draw_results: true,
      ticket_purchases: true,
      account_changes: true,
      promotions: true,
      syndicate_updates: true,
    }
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        // Check if the user has preferences saved
        const { data, error } = await supabase
          .from('user_notification_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }
        
        // If user has preferences, populate the form
        if (data) {
          form.reset({
            draw_results: data.draw_results,
            ticket_purchases: data.ticket_purchases,
            account_changes: data.account_changes,
            promotions: data.promotions,
            syndicate_updates: data.syndicate_updates,
          });
        } else {
          // No preferences saved yet, insert defaults
          const { error: insertError } = await supabase
            .from('user_notification_preferences')
            .insert({
              user_id: session.user.id,
              draw_results: true,
              ticket_purchases: true,
              account_changes: true,
              promotions: true,
              syndicate_updates: true,
            });
            
          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notification preferences.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreferences();
  }, []);

  const onSubmit = async (values: NotificationPreferences) => {
    setSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to update your preferences',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_notification_preferences')
        .update({
          ...values,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated',
      });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>Manage what notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lottery-blue"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>Manage what notifications you receive</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="draw_results"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Draw Results</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Get notified when lottery draws are completed.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ticket_purchases"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Ticket Purchases</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you purchase tickets.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="account_changes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Account Changes</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Get notified about important account updates.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="promotions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Promotions</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Get notified about special offers and promotions.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="syndicate_updates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Syndicate Updates</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Get notified about your lottery syndicates.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-lottery-blue hover:bg-lottery-blue/90"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;

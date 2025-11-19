
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type Player = Tables['players']['Row'];
type Coach = Tables['coaches']['Row'];
type Batch = Tables['batches']['Row'];

export const useSupabaseData = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleError = (error: any, operation: string) => {
    console.error(`Error ${operation}:`, error);
    toast({
      title: `Error ${operation}`,
      description: error.message || 'Something went wrong',
      variant: 'destructive'
    });
  };

  // Fetch all players with their profiles
  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          profiles!players_user_id_fkey (
            full_name,
            email,
            phone,
            profile_image_url
          ),
          batches (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'fetching players');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all coaches with their profiles
  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select(`
          *,
          profiles!coaches_user_id_fkey (
            full_name,
            email,
            phone,
            profile_image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'fetching coaches');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all batches
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'fetching batches');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a new player
  const addPlayer = async (playerData: {
    full_name: string;
    email: string;
    phone?: string;
    age?: number;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    medical_conditions?: string;
    batch_id?: string;
  }) => {
    setLoading(true);
    try {
      // First create a user profile
      const { data: profileData, error: profileError } = await supabase.auth.signUp({
        email: playerData.email,
        password: 'temp123!', // You might want to generate this or let them set it
        options: {
          data: {
            full_name: playerData.full_name,
            role: 'player'
          }
        }
      });

      if (profileError) throw profileError;

      if (profileData.user) {
        // Then create the player record
        const { data: player, error: playerError } = await supabase
          .from('players')
          .insert({
            user_id: profileData.user.id,
            age: playerData.age,
            emergency_contact_name: playerData.emergency_contact_name,
            emergency_contact_phone: playerData.emergency_contact_phone,
            medical_conditions: playerData.medical_conditions,
            batch_id: playerData.batch_id
          })
          .select()
          .single();

        if (playerError) throw playerError;

        toast({
          title: 'Player added successfully',
          description: `${playerData.full_name} has been added to the system`
        });

        return player;
      }
    } catch (error) {
      handleError(error, 'adding player');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Remove a player
  const removePlayer = async (playerId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      toast({
        title: 'Player removed',
        description: 'Player has been successfully removed from the system'
      });

      return true;
    } catch (error) {
      handleError(error, 'removing player');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchPlayers,
    fetchCoaches,
    fetchBatches,
    addPlayer,
    removePlayer
  };
};

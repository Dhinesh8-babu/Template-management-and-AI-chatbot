
import { createClient } from '@supabase/supabase-js';
import type { Template } from '../types';

// Use the provided Supabase credentials
const supabaseUrl = 'https://cmopwojiyyxhhhdggyed.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtb3B3b2ppeXl4aGhoZGdneWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjgzMjAsImV4cCI6MjA3ODQ0NDMyMH0.apd2SLcK3PwgSOaNGHcpFZ2J26n-3CYOANANbT0XjaE';

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key must be provided.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLE_NAME = 'templates';

type UpsertTemplate = Omit<Template, 'id' | 'created_at'>;

export const getTemplates = async (): Promise<Template[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    throw new Error('Failed to fetch templates from the database.');
  }

  return data as Template[];
};

export const saveTemplate = async (templateData: UpsertTemplate, id?: string): Promise<Template> => {
  if (id) {
    // Update
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(templateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template.');
    }
    return data as Template;
  } else {
    // Create
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([templateData])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create template.');
    }
    return data as Template;
  }
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    throw new Error('Failed to delete template.');
  }
};
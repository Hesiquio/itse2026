import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export function useModuleLogic(moduleOwner) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_modules')
        .select('*')
        .eq('module_owner', moduleOwner)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) { console.error(error.message); }
    finally { setLoading(false); }
  };

  const addData = async (content) => {
    const { data, error } = await supabase
      .from('student_modules')
      .insert([{ module_owner: moduleOwner, content }]).select();
    if (!error) setItems([data[0], ...items]);
  };

  const deleteData = async (id) => {
    const { error } = await supabase.from('student_modules').delete().eq('id', id);
    if (!error) setItems(items.filter(item => item.id !== id));
  };

  return { items, loading, addData, deleteData, refresh: fetchData };
}
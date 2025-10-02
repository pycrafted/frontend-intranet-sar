import { useState, useCallback } from 'react';
import axios from 'axios';

interface MenuItem {
  id: number;
  name: string;
  type: 'senegalese' | 'european';
  type_display: string;
  description?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

interface DayMenu {
  id: number;
  day: string;
  day_display: string;
  date: string;
  senegalese: MenuItem;
  european: MenuItem;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WeekMenu {
  week_start: string;
  week_end: string;
  days: DayMenu[];
}

interface MenuFormData {
  name: string;
  type: 'senegalese' | 'european';
  description?: string;
  is_available: boolean;
}

interface DayMenuFormData {
  day: string;
  date: string;
  senegalese_id: number;
  european_id: number;
  is_active: boolean;
}

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dayMenus, setDayMenus] = useState<DayMenu[]>([]);
  const [weekMenu, setWeekMenu] = useState<WeekMenu | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/accueil/menu/` : 'http://localhost:8000/api/accueil/menu/';
  const ITEMS_URL = `${API_URL}items/`;
  const DAYS_URL = `${API_URL}days/`;
  const WEEK_URL = `${API_URL}week/`;
  const AVAILABLE_ITEMS_URL = `${API_URL}available-items/`;

  // ===== MENU ITEMS =====
  const fetchMenuItems = useCallback(async (type?: string, isAvailable?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (isAvailable !== undefined) params.append('is_available', isAvailable.toString());
      
      const response = await axios.get<{results: MenuItem[]}>(`${ITEMS_URL}?${params.toString()}`);
      const items = response.data?.results || response.data;
      setMenuItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
      setError("Impossible de charger les plats du menu.");
      setMenuItems([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  }, [ITEMS_URL]);

  const createMenuItem = useCallback(async (data: MenuFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<MenuItem>(ITEMS_URL, data);
      setMenuItems(prev => Array.isArray(prev) ? [...prev, response.data] : [response.data]);
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error("Failed to create menu item:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erreur lors de la création du plat.");
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  }, [ITEMS_URL]);

  const updateMenuItem = useCallback(async (id: number, data: Partial<MenuFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put<MenuItem>(`${ITEMS_URL}${id}/`, data);
      setMenuItems(prev => Array.isArray(prev) ? prev.map(item => item.id === id ? response.data : item) : [response.data]);
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error("Failed to update menu item:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erreur lors de la mise à jour du plat.");
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  }, [ITEMS_URL]);

  const deleteMenuItem = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${ITEMS_URL}${id}/`);
      setMenuItems(prev => Array.isArray(prev) ? prev.filter(item => item.id !== id) : []);
      return { success: true };
    } catch (err: any) {
      console.error("Failed to delete menu item:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erreur lors de la suppression du plat.");
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  }, [ITEMS_URL]);

  // ===== DAY MENUS =====
  const fetchDayMenus = useCallback(async (dateFrom?: string, dateTo?: string, isActive?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (isActive !== undefined) params.append('is_active', isActive.toString());
      
      const response = await axios.get<{results: DayMenu[]}>(`${DAYS_URL}?${params.toString()}`);
      const menus = response.data?.results || response.data;
      setDayMenus(Array.isArray(menus) ? menus : []);
    } catch (err) {
      console.error("Failed to fetch day menus:", err);
      setError("Impossible de charger les menus des jours.");
      setDayMenus([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  }, [DAYS_URL]);

  const createDayMenu = useCallback(async (data: DayMenuFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<DayMenu>(DAYS_URL, data);
      setDayMenus(prev => Array.isArray(prev) ? [...prev, response.data] : [response.data]);
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error("Failed to create day menu:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erreur lors de la création du menu du jour.");
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  }, [DAYS_URL]);

  const updateDayMenu = useCallback(async (id: number, data: Partial<DayMenuFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put<DayMenu>(`${DAYS_URL}${id}/`, data);
      setDayMenus(prev => Array.isArray(prev) ? prev.map(menu => menu.id === id ? response.data : menu) : [response.data]);
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error("Failed to update day menu:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erreur lors de la mise à jour du menu du jour.");
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  }, [DAYS_URL]);

  const deleteDayMenu = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${DAYS_URL}${id}/`);
      setDayMenus(prev => Array.isArray(prev) ? prev.filter(menu => menu.id !== id) : []);
      return { success: true };
    } catch (err: any) {
      console.error("Failed to delete day menu:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erreur lors de la suppression du menu du jour.");
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  }, [DAYS_URL]);

  // ===== WEEK MENU =====
  const fetchWeekMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<WeekMenu>(WEEK_URL);
      setWeekMenu(response.data);
    } catch (err) {
      console.error("Failed to fetch week menu:", err);
      setError("Impossible de charger le menu de la semaine.");
    } finally {
      setLoading(false);
    }
  }, [WEEK_URL]);

  // ===== AVAILABLE ITEMS =====
  const fetchAvailableItems = useCallback(async (type?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      
      const response = await axios.get<{results: MenuItem[]}>(`${AVAILABLE_ITEMS_URL}?${params.toString()}`);
      const items = response.data?.results || response.data;
      return Array.isArray(items) ? items : [];
    } catch (err) {
      console.error("Failed to fetch available items:", err);
      setError("Impossible de charger les plats disponibles.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [AVAILABLE_ITEMS_URL]);

  // ===== WEEK MENU CREATION =====
  const createWeekMenu = useCallback(async (data: { week_start: string; menus: Array<{ day: string; senegalese_id: number; european_id: number; is_active: boolean }> }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<DayMenu[]>(`${API_URL}create-week/`, data);
      // Recharger les données après création
      await fetchDayMenus();
      await fetchWeekMenu();
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error("Failed to create week menu:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erreur lors de la création du menu de la semaine.");
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  }, [API_URL, fetchDayMenus, fetchWeekMenu]);

  // Fonction pour vérifier si un menu existe déjà pour une date donnée
  const getMenuForDate = useCallback((date: string): DayMenu | null => {
    const safeDayMenus = Array.isArray(dayMenus) ? dayMenus : [];
    return safeDayMenus.find(menu => menu.date === date) || null;
  }, [dayMenus]);

  return {
    // State
    menuItems,
    dayMenus,
    weekMenu,
    loading,
    error,
    
    // Menu Items
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    
    // Day Menus
    fetchDayMenus,
    createDayMenu,
    updateDayMenu,
    deleteDayMenu,
    
    // Week Menu
    fetchWeekMenu,
    createWeekMenu,
    
    // Available Items
    fetchAvailableItems,
    
    // Utilities
    getMenuForDate
  };
};

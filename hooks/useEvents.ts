import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from "@/lib/config"

// Interface pour un événement
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string; // Format ISO (YYYY-MM-DD)
  time: string | null; // Format HH:MM ou null
  location: string;
  type: 'meeting' | 'training' | 'celebration' | 'conference' | 'other';
  type_display: string;
  attendees: number;
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
  is_past: boolean;
  is_today: boolean;
  is_future: boolean;
  time_formatted: string | null;
  date_formatted: string;
}

// Interface pour la création/modification d'un événement
export interface EventCreateUpdate {
  title: string;
  description?: string;
  date: string; // Format ISO (YYYY-MM-DD)
  time?: string; // Format HH:MM ou null
  location: string;
  type: 'meeting' | 'training' | 'celebration' | 'conference' | 'other';
  attendees?: number;
  is_all_day?: boolean;
}

// Interface pour les statistiques des événements
export interface EventStats {
  total_events: number;
  future_events: number;
  past_events: number;
  today_events: number;
  type_stats: Record<string, number>;
  next_event: Event | null;
}

// Interface pour les paramètres de filtrage
export interface EventFilters {
  type?: string;
  future_only?: boolean;
  year?: number;
  month?: number;
}

const API_URL = `${API_CONFIG.ACCUEIL}/events/`;

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);

  // Fonction pour récupérer tous les événements
  const fetchEvents = useCallback(async (filters?: EventFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filters?.type) {
        params.append('type', filters.type);
      }
      if (filters?.future_only) {
        params.append('future_only', 'true');
      }
      if (filters?.year) {
        params.append('year', filters.year.toString());
      }
      if (filters?.month) {
        params.append('month', filters.month.toString());
      }

      const response = await axios.get(`${API_URL}?${params.toString()}`);
      
      // Gérer la pagination Django REST Framework
      const eventsData = response.data.results || response.data;
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      
    } catch (err) {
      console.error('Erreur lors de la récupération des événements:', err);
      setError('Erreur lors de la récupération des événements');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour récupérer un événement par ID
  const fetchEvent = useCallback(async (id: number): Promise<Event | null> => {
    try {
      const response = await axios.get(`${API_URL}${id}/`);
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'événement:', err);
      return null;
    }
  }, []);

  // Fonction pour créer un événement
  const createEvent = useCallback(async (eventData: EventCreateUpdate): Promise<Event | null> => {
    try {
      const response = await axios.post(API_URL, eventData);
      
      // Mettre à jour la liste des événements
      setEvents(prev => Array.isArray(prev) ? [...prev, response.data] : [response.data]);
      
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la création de l\'événement:', err);
      setError('Erreur lors de la création de l\'événement');
      return null;
    }
  }, []);

  // Fonction pour modifier un événement
  const updateEvent = useCallback(async (id: number, eventData: EventCreateUpdate): Promise<Event | null> => {
    try {
      // Vérifier si eventData est une chaîne JSON et la désérialiser si nécessaire
      let dataToSend = eventData;
      if (typeof eventData === 'string') {
        try {
          dataToSend = JSON.parse(eventData);
        } catch (parseError) {
          console.error('Erreur lors de la désérialisation des données:', parseError);
          setError('Erreur de format des données');
          return null;
        }
      }
      
      
      const response = await axios.put(`${API_URL}${id}/`, dataToSend);
      
      // Mettre à jour la liste des événements
      setEvents(prev => {
        if (!Array.isArray(prev)) return [response.data];
        return prev.map(event => event.id === id ? response.data : event);
      });
      
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de la modification de l\'événement:', err);
      
      // Afficher les détails de l'erreur de validation
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.values(errorData).flat();
          setError(`Erreur de validation: ${errorMessages.join(', ')}`);
        } else {
          setError(`Erreur: ${errorData}`);
        }
      } else {
        setError('Erreur lors de la modification de l\'événement');
      }
      
      return null;
    }
  }, []);

  // Fonction pour supprimer un événement
  const deleteEvent = useCallback(async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      
      // Mettre à jour la liste des événements
      setEvents(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.filter(event => event.id !== id);
      });
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'événement:', err);
      setError('Erreur lors de la suppression de l\'événement');
      return false;
    }
  }, []);

  // Fonction pour récupérer les événements d'un mois spécifique
  const fetchEventsByMonth = useCallback(async (year: number, month: number): Promise<Event[]> => {
    try {
      const response = await axios.get(`${API_URL}month/${year}/${month}/`);
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la récupération des événements du mois:', err);
      return [];
    }
  }, []);

  // Fonction pour récupérer les événements d'une date spécifique
  const fetchEventsByDate = useCallback(async (date: string): Promise<Event[]> => {
    try {
      const response = await axios.get(`${API_URL}date/${date}/`);
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la récupération des événements de la date:', err);
      return [];
    }
  }, []);

  // Fonction pour récupérer le prochain événement
  const fetchNextEvent = useCallback(async (): Promise<Event | null> => {
    try {
      const response = await axios.get(`${API_URL}next/`);
      
      if (response.data.message) {
        // Aucun événement prévu
        return null;
      }
      
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la récupération du prochain événement:', err);
      return null;
    }
  }, []);

  // Fonction pour récupérer les statistiques des événements
  const fetchEventStats = useCallback(async (): Promise<EventStats | null> => {
    try {
      const response = await axios.get(`${API_URL}stats/`);
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      return null;
    }
  }, []);

  // Fonction pour récupérer les événements futurs uniquement
  const fetchFutureEvents = useCallback(async (): Promise<Event[]> => {
    try {
      const response = await axios.get(`${API_URL}?future_only=true`);
      const eventsData = response.data.results || response.data;
      return Array.isArray(eventsData) ? eventsData : [];
    } catch (err) {
      console.error('Erreur lors de la récupération des événements futurs:', err);
      return [];
    }
  }, []);

  // Fonction pour récupérer les événements d'aujourd'hui
  const fetchTodayEvents = useCallback(async (): Promise<Event[]> => {
    const today = new Date().toISOString().split('T')[0];
    return fetchEventsByDate(today);
  }, [fetchEventsByDate]);

  // Fonction pour formater une date pour l'affichage
  const formatEventDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Fonction pour formater une heure pour l'affichage
  const formatEventTime = useCallback((timeString: string | null): string => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  }, []);

  // Fonction pour obtenir l'icône d'un type d'événement
  const getEventTypeIcon = useCallback((type: string): string => {
    const icons = {
      'meeting': '👥',
      'training': '🎓',
      'celebration': '🎉',
      'conference': '🎤',
      'other': '📅',
    };
    return icons[type as keyof typeof icons] || '📅';
  }, []);

  // Fonction pour obtenir la couleur d'un type d'événement
  const getEventTypeColor = useCallback((type: string): string => {
    const colors = {
      'meeting': 'blue',
      'training': 'green',
      'celebration': 'purple',
      'conference': 'orange',
      'other': 'gray',
    };
    return colors[type as keyof typeof colors] || 'gray';
  }, []);

  // Fonction pour calculer le nombre de jours jusqu'au prochain événement
  const getDaysUntilNextEvent = useCallback((event: Event): number => {
    const today = new Date();
    const eventDate = new Date(event.date);
    
    // Normaliser les dates à minuit pour la comparaison
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const timeDiff = eventDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }, []);

  // Charger les événements au montage du composant
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    // État
    events,
    loading,
    error,
    stats,
    nextEvent,
    
    // Actions
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEventsByMonth,
    fetchEventsByDate,
    fetchNextEvent,
    fetchEventStats,
    fetchFutureEvents,
    fetchTodayEvents,
    
    // Utilitaires
    formatEventDate,
    formatEventTime,
    getEventTypeIcon,
    getEventTypeColor,
    getDaysUntilNextEvent,
    
    // Actions de mise à jour de l'état
    setEvents,
    setError,
    setStats,
    setNextEvent,
  };
};

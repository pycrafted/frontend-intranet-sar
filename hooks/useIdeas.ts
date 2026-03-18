import { useState, useCallback } from 'react';
import { APIClient } from '@/lib/api-client';

interface Idea {
  id: number;
  description: string;
  department: string;
  department_display: string;
  status: string;
  status_display: string;
  submitted_at: string;
  updated_at: string;
}

interface IdeaFormData {
  description: string;
  department: string;
}

interface Department {
  id: string;
  name: string;
  icon: string;
}

export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Les URLs sont maintenant gérées par APIClient qui utilise les endpoints relatifs

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await APIClient.get('/accueil/ideas/');
      const data = await response.json();
      setIdeas(data);
    } catch (err: any) {
      console.error("Failed to fetch ideas:", err);
      setError("Impossible de charger les idées.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await APIClient.get('/accueil/ideas/departments/');
      const data = await response.json();
      setDepartments(data);
    } catch (err: any) {
      console.error("Failed to fetch departments:", err);
      setError("Impossible de charger les départements.");
    }
  }, []);

  const submitIdea = async (data: IdeaFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await APIClient.post('/accueil/ideas/submit/', data);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { response: { status: response.status, data: errorData } };
      }
      
      const responseData = await response.json();
      setIdeas(prev => [responseData, ...prev]);
      return { success: true, data: responseData };
    } catch (err: any) {
      console.error("Failed to submit idea:", err.response?.data || err.message);
      
      // Gestion des erreurs de validation
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (typeof errorData === 'object' && errorData !== null) {
          // Erreurs de validation détaillées
          const errorMessages = Object.values(errorData).flat();
          setError(`Erreur de validation: ${errorMessages.join(', ')}`);
        } else {
          setError("Erreur de validation des données.");
        }
      } else if (err.response?.status === 403) {
        setError("Erreur d'authentification. Veuillez rafraîchir la page et réessayer.");
      } else {
        setError(err.response?.data?.error || "Erreur lors de la soumission de l'idée.");
      }
      
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  return { 
    ideas, 
    departments, 
    loading, 
    error, 
    fetchIdeas, 
    fetchDepartments, 
    submitIdea 
  };
};

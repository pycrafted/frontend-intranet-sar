import { useState, useCallback } from 'react';
import axios from 'axios';

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/accueil/ideas/` : 'http://localhost:8000/api/accueil/ideas/';
  const SUBMIT_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/accueil/ideas/submit/` : 'http://localhost:8000/api/accueil/ideas/submit/';
  const DEPARTMENTS_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/accueil/ideas/departments/` : 'http://localhost:8000/api/accueil/ideas/departments/';

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Idea[]>(API_URL);
      setIdeas(response.data);
    } catch (err) {
      console.error("Failed to fetch ideas:", err);
      setError("Impossible de charger les idées.");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get<Department[]>(DEPARTMENTS_URL);
      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setError("Impossible de charger les départements.");
    }
  }, [DEPARTMENTS_URL]);

  const submitIdea = async (data: IdeaFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<Idea>(SUBMIT_URL, data, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      setIdeas(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
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

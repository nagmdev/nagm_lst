import { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import { AxiosError } from 'axios';

export interface Company {
  id: number;
  name: string;
  website?: string;
  careerSiteUrl?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyData {
  name: string;
  website?: string;
  careerSiteUrl?: string;
  status: string;
}

export interface UpdateCompanyData {
  name?: string;
  website?: string;
  careerSiteUrl?: string;
  status?: string;
}

const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = search 
        ? `/companies/getAllCompanies?search=${encodeURIComponent(search)}`
        : '/companies/getAllCompanies';
      const response = await axiosInstance.get(url);
      
      // Handle different response structures
      const data = response.data;
      if (Array.isArray(data)) {
        setCompanies(data);
      } else if (data && Array.isArray(data.companies)) {
        setCompanies(data.companies);
      } else if (data && Array.isArray(data.data)) {
        setCompanies(data.data);
      } else {
        console.warn('Unexpected API response structure:', data);
        setCompanies([]);
      }
    } catch (err) {
      setError('Failed to fetch companies.');
      console.error(err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyById = async (id: number) => {
    try {
      const response = await axiosInstance.get(`/companies/${id}`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch company:', err);
      throw err;
    }
  };

  const createCompany = async (companyData: CreateCompanyData) => {
    try {
      const response = await axiosInstance.post('/companies', companyData);
      await fetchCompanies(); // Refresh the list
      return response.data;
    } catch (err) {
      console.error('Failed to create company:', err);
      throw err;
    }
  };

  const updateCompany = async (id: number, companyData: UpdateCompanyData) => {
    try {
      const response = await axiosInstance.put(`/companies/${id}`, companyData);
      await fetchCompanies(); // Refresh the list
      return response.data;
    } catch (err) {
      console.error('Failed to update company:', err);
      throw err;
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      await axiosInstance.delete(`/companies/force/${id}`);
      await fetchCompanies(); // Refresh the list
    } catch (err: unknown) {
      // Try to extract backend error message and suggestion
      let errorMsg = 'Failed to delete company.';
      if (err && typeof err === 'object' && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<{ message?: string; suggestion?: string }>;
        const backendMsg = axiosErr.response?.data?.message;
        const suggestion = axiosErr.response?.data?.suggestion;
        if (backendMsg) {
          errorMsg = backendMsg;
          if (suggestion) {
            errorMsg += ' ' + suggestion;
          }
        }
      }
      console.error('Failed to delete company:', errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};

export default useCompanies; 
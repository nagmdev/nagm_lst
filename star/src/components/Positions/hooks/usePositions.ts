/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../services/axiosInstance";

interface Company {
  id: number;
  name: string;
}

interface Position {
  id: number;
  title: string;
  companyId: number;
  company?: Company;
}

interface UsePositionsReturn {
  positions: Position[];
  companies: Company[];
  loading: boolean;
  error: string;
  createPosition: (payload: { title: string; companyId: number }) => Promise<void>;
  updatePosition: (id: number, payload: { title: string; companyId: number }) => Promise<void>;
  deletePosition: (id: number) => Promise<void>;
}

export const usePositions = (): UsePositionsReturn => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [positionsRes, companiesRes] = await Promise.all([
        axiosInstance.get<Position[]>("/positions"),
        axiosInstance.get<{ companies: Company[] }>("/companies/getAllCompanies"),
      ]);

      const processedPositions = positionsRes.data.map((pos: Position) => ({
        ...pos,
        company: pos.company ?? { id: pos.companyId, name: "Unknown" },
      }));

      setPositions(processedPositions);
      setCompanies(companiesRes.data.companies || []);
    } catch (err: any) {
      setError(err.response?.status === 401 ? "Unauthorized: Please log in again." : "Failed to fetch data.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createPosition = async (payload: { title: string; companyId: number }) => {
    try {
      await axiosInstance.post("/positions", payload);
      fetchData();
    } catch (err: any) {
      setError(err.response?.status === 401 ? "Unauthorized: Please log in again." : "Failed to create position.");
      console.error("Error creating position:", err);
    }
  };

  const updatePosition = async (id: number, payload: { title: string; companyId: number }) => {
    try {
      await axiosInstance.put(`/positions/${id}`, payload);
      fetchData();
    } catch (err: any) {
      setError(err.response?.status === 401 ? "Unauthorized: Please log in again." : "Failed to update position.");
      console.error("Error updating position:", err);
    }
  };

  const deletePosition = async (id: number) => {
    try {
      await axiosInstance.delete(`/positions/${id}`);
      setPositions((prev) => prev.filter((pos) => pos.id !== id));
    } catch (err: any) {
      setError(err.response?.status === 401 ? "Unauthorized: Please log in again." : "Failed to delete position.");
      console.error("Error deleting position:", err);
    }
  };

  return {
    positions,
    companies,
    loading,
    error,
    createPosition,
    updatePosition,
    deletePosition,
  };
};
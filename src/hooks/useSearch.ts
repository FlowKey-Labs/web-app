import { useState, useEffect } from "react";
import { api } from "../lib/axios";
import { mapSearchResult } from "../utils/mapSearchResult";

export interface RawSearchResult {
  id: number | string;
  record_type: "session" | "staff" | "client";
  matched_field?: string;
  [key: string]: unknown;
}

export interface SearchResult {
  record_type: "client" | "staff" | "transaction" | "session";
  id: number | string;
  title: string;
  subtitle?: string;
  matched_field?: string;
}

function useSearch(query: string, delay = 300) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay]);

  useEffect(() => {
    if (!debouncedQuery) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/search/?q=${debouncedQuery}`);
        const normalized = res.data.map(mapSearchResult);
        setResults(normalized);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return { results, loading };
}

export default useSearch;

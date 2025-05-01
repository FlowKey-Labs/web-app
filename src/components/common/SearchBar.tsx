import { useState } from "react";
import useSearch, { SearchResult } from "../../hooks/useSearch";
import { SearchIcon } from "../../assets/icons";
import SearchInput from "./SearchInput";

type GroupedSearchResults = Record<SearchResult["record_type"], SearchResult[]>;

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const { results, loading } = useSearch(query);

  const groupedResults: Partial<GroupedSearchResults> = results?.reduce(
    (acc, item) => {
      if (!acc[item.record_type]) {
        acc[item.record_type] = [];
      }

      acc[item.record_type]!.push(item);
      return acc;
    },
    {} as Partial<GroupedSearchResults>
  );

  return (
    <div className="relative w-full max-w-lg">
      <div className="">
        <SearchInput
          placeholder="Search Appointment, Clients, Staff etc"
          leftIcon={
            <div className="bg-[#F5F5F5] p-2 rounded-full cursor-pointer">
              <SearchIcon className="w-4 h-4 text-primary" />
            </div>
          }
          onChange={(e) => setQuery(e.target.value)}
          containerClassName="w-[100%]"
          inputClassName=""
        />
      </div>

      {query && (
        <div className="absolute mt-2 bg-white shadow-lg rounded-md w-full z-10 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-gray-500">Searching…</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-gray-400">No results found</p>
          ) : (
            Object.entries(groupedResults).map(([record_type, items]) => (
              <div key={record_type}>
                <div className="text-xs uppercase text-gray-500 px-4 pt-2">
                  {record_type}
                </div>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.subtitle}</p>
                    {item.matched_field && (
                      <p className="text-xs text-gray-400 italic">
                        Matched by {item.matched_field}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

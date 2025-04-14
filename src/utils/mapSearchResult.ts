import { RawSearchResult, SearchResult } from "../hooks/useSearch";

export function mapSearchResult(item: RawSearchResult): SearchResult {
  switch (item.record_type) {
    case "session":
      return {
        id: item.id,
        record_type: "session",
        title: item.title || "Untitled Session",
        subtitle: `${item.session_type || ""} • ${item.class_type || ""}`,
        matched_field: item.matched_field,
      };
    case "staff":
      return {
        id: item.id,
        record_type: "staff",
        title:
          `${item.user?.first_name || ""} ${
            item.user?.last_name || ""
          }`.trim() || "Unnamed Staff",
        subtitle: item.user?.email || "No email",
        matched_field: item.matched_field,
      };
    case "client":
      return {
        id: item.id,
        record_type: "client",
        title:
          `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
          "Unnamed Client",
        subtitle: item.email || item.phone_number || "No contact info",
        matched_field: item.matched_field,
      };
    default:
      return {
        id: item.id,
        record_type: item.record_type,
        title: "Unknown Record",
        subtitle: "",
      };
  }
}

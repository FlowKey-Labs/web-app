// Utility function to format time strings to 12-hour format in East Africa Time (EAT)
// This treats the input time as local EAT time to avoid timezone conversion issues

export const formatTo12Hour = (isoDateTimeStr: string) => {
  if (!isoDateTimeStr || typeof isoDateTimeStr !== "string")
    return isoDateTimeStr;

  try {
    // Handle both full ISO datetime and time-only strings
    let timePart: string;
    
    if (isoDateTimeStr.includes("T")) {
      // Full ISO datetime: "2025-06-13T09:00:00Z"
      timePart = isoDateTimeStr.split("T")[1];
    } else {
      // Time only: "09:00:00"
      timePart = isoDateTimeStr;
    }
    
    if (!timePart) {
      return isoDateTimeStr;
    }

    // Remove timezone indicators and get time components
    const cleanTime = timePart.replace(/Z.*$/, '').split(":");
    let hours = parseInt(cleanTime[0], 10);
    const minutes = cleanTime[1]?.padStart(2, "0") || "00";

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${hours}:${minutes} ${ampm}`;
  } catch (e) {
    console.error("Error formatting time:", isoDateTimeStr, e);
    return isoDateTimeStr;
  }
};

// New function specifically for formatting times that should be treated as EAT
export const formatToEATTime = (isoDateTimeStr: string) => {
  if (!isoDateTimeStr || typeof isoDateTimeStr !== "string")
    return isoDateTimeStr;

  try {
    // Create a date object but treat the time as local EAT time
    // This prevents automatic UTC to local timezone conversion
    const dateStr = isoDateTimeStr.split("T")[0]; // Get date part
    const timeStr = isoDateTimeStr.split("T")[1]?.replace(/Z.*$/, '') || "00:00:00"; // Get time part without timezone
    
    // Parse time components directly without timezone conversion
    const [hours, minutes] = timeStr.split(":").map(num => parseInt(num, 10));
    
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  } catch (e) {
    console.error("Error formatting EAT time:", isoDateTimeStr, e);
    return formatTo12Hour(isoDateTimeStr); // Fallback to original function
  }
};

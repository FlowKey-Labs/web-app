export const formatTo12Hour = (isoDateTimeStr: string) => {
  if (!isoDateTimeStr || typeof isoDateTimeStr !== "string")
    return isoDateTimeStr;

  try {
    const timePart = isoDateTimeStr.split("T")[1];
    if (!timePart) {
      return isoDateTimeStr;
    }

    const timeComponents = timePart.split(":");
    let hours = parseInt(timeComponents[0], 10);
    const minutes = timeComponents[1].padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${hours}:${minutes} ${ampm}`;
  } catch (e) {
    console.error("Error formatting time:", isoDateTimeStr, e);
    return isoDateTimeStr;
  }
};

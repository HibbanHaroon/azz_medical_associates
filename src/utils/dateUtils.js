export const convertToUTC = (date) => {
  return new Date(date).toISOString();
};

export const convertToLocalTime = (date) => {
  const localDate = new Date(date);
  const offset = localDate.getTimezoneOffset();
  const localTime = new Date(localDate.getTime() - offset * 60 * 1000);
  return localTime.toISOString().slice(0, 19).replace("T", " ");
};

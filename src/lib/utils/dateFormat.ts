const dateFormat = (datetime: string | Date, currentLocale = "de") => {
  const dateTime = new Date(datetime);

  const date = dateTime.toLocaleDateString(currentLocale ? currentLocale : [], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const time = dateTime.toLocaleTimeString(currentLocale ? currentLocale : [], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return date;
};

export default dateFormat;

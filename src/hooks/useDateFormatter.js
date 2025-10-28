import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, kk, ru } from "date-fns/locale";

const getLocale = (lang) => {
  const langCode = lang.split("-")[0];
  if (langCode === "kk" || langCode === "kz") return kk;
  if (langCode === "ru") return ru;
  return enUS;
};

export const useDateFormatter = () => {
  const { i18n } = useTranslation();
  const currentLocale = getLocale(i18n.language);

  const formatDate = (isoDateString, formatString = "PPpp") => {
    if (!isoDateString) return "";
    try {
      const date = new Date(isoDateString);
      return format(date, formatString, { locale: currentLocale });
    } catch (error) {
      console.error("Failed to format date:", isoDateString, error);
      return isoDateString;
    }
  };

  return { formatDate };
};

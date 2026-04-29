import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGE_OPTIONS, useI18n, Language } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  persistToProfile?: boolean;
  compact?: boolean;
}

export const LanguageSelector = ({ persistToProfile, compact }: Props) => {
  const { lang, setLang } = useI18n();

  const handleChange = async (value: string) => {
    const newLang = value as Language;
    setLang(newLang);
    if (persistToProfile) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("profiles").update({ language: newLang } as any).eq("user_id", session.user.id);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Select value={lang} onValueChange={handleChange}>
        <SelectTrigger className={compact ? "h-9 w-[110px] text-xs" : "h-9 w-[150px]"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface FeaturedEntry {
  user_id: string;
  full_name: string | null;
  photo_url: string | null;
  latest_photo: string | null;
  previous_photo: string | null;
  weight: number | null;
  weight_unit: string | null;
  notes: string | null;
}

export const TrainersSection = () => {
  const [items, setItems] = useState<FeaturedEntry[]>([]);

  useEffect(() => {
    (async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, photo_url")
        .eq("progress_public", true);
      if (!profiles?.length) return;
      const ids = profiles.map((p) => p.user_id);
      const { data: progress } = await supabase
        .from("progress_tracking")
        .select("user_id, photo_url, previous_photo_url, weight, weight_unit, notes, created_at")
        .in("user_id", ids)
        .order("created_at", { ascending: false });

      const byUser = new Map<string, any>();
      (progress || []).forEach((p) => {
        if (!byUser.has(p.user_id)) byUser.set(p.user_id, p);
      });

      const merged: FeaturedEntry[] = profiles
        .map((pr) => {
          const latest = byUser.get(pr.user_id);
          if (!latest) return null;
          return {
            user_id: pr.user_id,
            full_name: pr.full_name,
            photo_url: pr.photo_url,
            latest_photo: latest.photo_url,
            previous_photo: latest.previous_photo_url,
            weight: latest.weight,
            weight_unit: latest.weight_unit,
            notes: latest.notes,
          } as FeaturedEntry;
        })
        .filter(Boolean) as FeaturedEntry[];

      setItems(merged);
    })();
  }, []);

  return (
    <section id="trainers" className="py-12 md:py-20 px-4 scroll-mt-24 bg-secondary/20">
      <div className="container mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              Our Trainees
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Real People. Real <span className="text-primary">Results</span>.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Featured progress journeys from members training with Coach Dave.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No featured journeys yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <Card key={it.user_id} className="shadow-card hover:shadow-glow transition-shadow overflow-hidden">
                <div className="grid grid-cols-2 gap-px bg-border">
                  <div className="aspect-square bg-muted relative">
                    {it.previous_photo ? (
                      <img src={it.previous_photo} alt="Before" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        Before
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-background/80 px-2 py-0.5 rounded-full font-semibold">
                      Before
                    </span>
                  </div>
                  <div className="aspect-square bg-muted relative">
                    {it.latest_photo ? (
                      <img src={it.latest_photo} alt="Now" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        Now
                      </div>
                    )}
                    <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                      Now
                    </span>
                  </div>
                </div>
                <CardContent className="pt-4 space-y-1">
                  <h3 className="font-bold text-lg">{it.full_name || "Trainee"}</h3>
                  {it.weight && (
                    <p className="text-sm text-muted-foreground">
                      Latest: {it.weight} {it.weight_unit}
                    </p>
                  )}
                  {it.notes && <p className="text-sm line-clamp-2">{it.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

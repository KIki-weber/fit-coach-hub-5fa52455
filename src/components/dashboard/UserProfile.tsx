import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save } from "lucide-react";

interface UserProfileProps {
  userId: string;
}

const cmToInch = (cm: number) => +(cm / 2.54).toFixed(2);
const inchToCm = (inch: number) => +(inch * 2.54).toFixed(2);
const kgToLb = (kg: number) => +(kg * 2.20462).toFixed(2);
const lbToKg = (lb: number) => +(lb / 2.20462).toFixed(2);

export const UserProfile = ({ userId }: UserProfileProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    height: "",            // displayed value (in selected unit)
    height_unit: "in",     // default to imperial (American focus)
    weight: "",
    weight_unit: "lb",
    photo_url: "",
    photo_description: "",
    photo_uploaded_at: "",
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      const heightUnit = (data as any).height_unit || "in";
      const weightUnit = (data as any).weight_unit || "lb";
      // Stored values are normalized: height in cm, weight in kg.
      const storedH = data.height ? Number(data.height) : null;
      const storedW = data.weight ? Number(data.weight) : null;
      const displayH = storedH == null ? "" :
        heightUnit === "in" ? String(cmToInch(storedH)) : String(storedH);
      const displayW = storedW == null ? "" :
        weightUnit === "lb" ? String(kgToLb(storedW)) : String(storedW);
      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        height: displayH,
        height_unit: heightUnit,
        weight: displayW,
        weight_unit: weightUnit,
        photo_url: data.photo_url || "",
        photo_description: data.photo_description || "",
        photo_uploaded_at: data.photo_uploaded_at || "",
      });
    }
  };

  const handleHeightUnitChange = (newUnit: string) => {
    const val = parseFloat(profile.height);
    if (!isNaN(val)) {
      const converted = profile.height_unit === "cm" && newUnit === "in"
        ? cmToInch(val)
        : profile.height_unit === "in" && newUnit === "cm"
        ? inchToCm(val)
        : val;
      setProfile({ ...profile, height: String(converted), height_unit: newUnit });
    } else {
      setProfile({ ...profile, height_unit: newUnit });
    }
  };

  const handleWeightUnitChange = (newUnit: string) => {
    const val = parseFloat(profile.weight);
    if (!isNaN(val)) {
      const converted = profile.weight_unit === "kg" && newUnit === "lb"
        ? kgToLb(val)
        : profile.weight_unit === "lb" && newUnit === "kg"
        ? lbToKg(val)
        : val;
      setProfile({ ...profile, weight: String(converted), weight_unit: newUnit });
    } else {
      setProfile({ ...profile, weight_unit: newUnit });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('profile-photos').upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl, photo_uploaded_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (!updateError) {
        setProfile({ ...profile, photo_url: publicUrl, photo_uploaded_at: new Date().toISOString() });
        toast({ title: "Photo Uploaded" });
      }
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    // Normalize for storage: height->cm, weight->kg
    const hVal = parseFloat(profile.height);
    const wVal = parseFloat(profile.weight);
    const heightCm = isNaN(hVal) ? null : (profile.height_unit === "in" ? inchToCm(hVal) : hVal);
    const weightKg = isNaN(wVal) ? null : (profile.weight_unit === "lb" ? lbToKg(wVal) : wVal);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        height: heightCm,
        weight: weightKg,
        height_unit: profile.height_unit,
        weight_unit: profile.weight_unit,
        photo_description: profile.photo_description,
      } as any)
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated" });
    }
    setLoading(false);
  };

  // Derived auto-converted display
  const heightAlt = profile.height && !isNaN(parseFloat(profile.height))
    ? profile.height_unit === "cm"
      ? `${cmToInch(parseFloat(profile.height))} in`
      : `${inchToCm(parseFloat(profile.height))} cm`
    : null;
  const weightAlt = profile.weight && !isNaN(parseFloat(profile.weight))
    ? profile.weight_unit === "kg"
      ? `${kgToLb(parseFloat(profile.weight))} lb`
      : `${lbToKg(parseFloat(profile.weight))} kg`
    : null;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Manage your personal information and metrics (units auto-convert)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
              <AvatarImage src={profile.photo_url} />
              <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </span>
                </Button>
                <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </Label>
              {profile.photo_uploaded_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Uploaded: {new Date(profile.photo_uploaded_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo-description">Photo Description</Label>
            <Input id="photo-description" placeholder="Describe your photo..."
              value={profile.photo_description}
              onChange={(e) => setProfile({ ...profile, photo_description: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" value={profile.phone_number}
              onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
              placeholder="+1 555 123 4567" />
          </div>

          <div className="space-y-2">
            <Label>Height</Label>
            <div className="flex gap-2">
              <Input type="number" step="0.1" value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: e.target.value })} />
              <Select value={profile.height_unit} onValueChange={handleHeightUnitChange}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">in</SelectItem>
                  <SelectItem value="cm">cm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {heightAlt && <p className="text-xs text-muted-foreground">≈ {heightAlt}</p>}
          </div>

          <div className="space-y-2">
            <Label>Weight</Label>
            <div className="flex gap-2">
              <Input type="number" step="0.1" value={profile.weight}
                onChange={(e) => setProfile({ ...profile, weight: e.target.value })} />
              <Select value={profile.weight_unit} onValueChange={handleWeightUnitChange}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lb">lb</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {weightAlt && <p className="text-xs text-muted-foreground">≈ {weightAlt}</p>}
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="bg-gradient-primary w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

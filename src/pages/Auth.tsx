import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import logoRunner from "@/assets/logo-runner.png";

const EXERCISE_PLANS = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "weight_gain", label: "Weight Gain" },
  { value: "muscle_building", label: "Muscle Building" },
  { value: "endurance", label: "Endurance Training" },
  { value: "flexibility", label: "Flexibility & Mobility" },
  { value: "general_fitness", label: "General Fitness" },
  { value: "maintenance", label: "Maintenance" },
];

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    age: "",
    height: "",
    heightUnit: "cm",
    weight: "",
    weightUnit: "kg",
    exercisePlan: "",
    gender: ""
  });

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    // Verify the email exists in our profiles before "sending"
    const { data: existing } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", forgotEmail.trim().toLowerCase())
      .maybeSingle();

    if (!existing) {
      setForgotLoading(false);
      toast({
        title: "Email not found",
        description: "No account is registered with that email.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Reset link sent",
        description: "Check your inbox. The link is valid for about 20 minutes.",
      });
      setShowForgot(false);
      setForgotEmail("");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  // Autofill signup from invitation link query params
  useEffect(() => {
    const email = searchParams.get("email");
    const full_name = searchParams.get("full_name");
    const phone_number = searchParams.get("phone_number");
    const exercise_plan = searchParams.get("exercise_plan");
    const gender = searchParams.get("gender");
    if (email || full_name || phone_number || exercise_plan || gender) {
      setSignupData((prev) => ({
        ...prev,
        email: email || prev.email,
        fullName: full_name || prev.fullName,
        phoneNumber: phone_number || prev.phoneNumber,
        exercisePlan: exercise_plan || prev.exercisePlan,
        gender: gender || prev.gender,
      }));
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const redirectUrl = `https://davecoach.online/dashboard`;
    
    // Convert height to cm for storage
    let heightInCm = parseFloat(signupData.height);
    if (signupData.heightUnit === "inch") {
      heightInCm = heightInCm * 2.54;
    }

    // Convert weight to kg for storage
    let weightInKg = parseFloat(signupData.weight);
    if (signupData.weightUnit === "lb") {
      weightInKg = weightInKg * 0.453592;
    }

    const { error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: signupData.fullName,
          phone_number: signupData.phoneNumber,
          height: heightInCm,
          height_unit: signupData.heightUnit,
          weight: weightInKg,
          weight_unit: signupData.weightUnit,
          exercise_plan: signupData.exercisePlan,
          gender: signupData.gender,
          age: signupData.age ? parseInt(signupData.age) : null,
        }
      }
    });

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Update profile with height, weight, and exercise plan
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            height: heightInCm,
            weight: weightInKg,
            height_unit: signupData.heightUnit,
            weight_unit: signupData.weightUnit,
            exercise_plan: signupData.exercisePlan,
            gender: signupData.gender,
            age: signupData.age ? parseInt(signupData.age) : null,
          } as any)
          .eq("user_id", user.id);
      }

      toast({
        title: "Account Created!",
        description: "Welcome to OneLove Fitness. Let's get started!",
      });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <img src={logoRunner} alt="OneLove Fitness" className="w-10 h-10" />
          <span className="text-2xl font-bold text-white">OneLove Fitness</span>
        </Link>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <PasswordInput
                      id="login-password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                  <button type="button" onClick={() => setShowForgot(s => !s)}
                    className="text-sm text-primary hover:underline w-full text-center">
                    Forgot password?
                  </button>
                </form>

                {showForgot && (
                  <form onSubmit={handleForgotPassword} className="mt-4 p-4 rounded-lg bg-muted/40 space-y-3">
                    <Label htmlFor="forgot-email">Enter your account email</Label>
                    <Input id="forgot-email" type="email" required value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" />
                    <p className="text-xs text-muted-foreground">
                      We'll send a reset link valid for ~20 minutes (only if the email exists).
                    </p>
                    <Button type="submit" disabled={forgotLoading} className="w-full">
                      {forgotLoading ? "Sending…" : "Send reset link"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Sign up to start your wellness journey</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={signupData.phoneNumber}
                      onChange={(e) => setSignupData({ ...signupData, phoneNumber: e.target.value })}
                      required
                      placeholder="+1234567890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-age">Age</Label>
                    <Input id="signup-age" type="number" min="1" max="120" required
                      value={signupData.age}
                      onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                      placeholder="e.g. 30" />
                  </div>

                  {/* Height with unit selection */}
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={signupData.height}
                        onChange={(e) => setSignupData({ ...signupData, height: e.target.value })}
                        placeholder={signupData.heightUnit === "cm" ? "170" : "67"}
                        required
                      />
                      <Select
                        value={signupData.heightUnit}
                        onValueChange={(v) => setSignupData({ ...signupData, heightUnit: v })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="inch">inch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Weight with unit selection */}
                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={signupData.weight}
                        onChange={(e) => setSignupData({ ...signupData, weight: e.target.value })}
                        placeholder={signupData.weightUnit === "kg" ? "70" : "154"}
                        required
                      />
                      <Select
                        value={signupData.weightUnit}
                        onValueChange={(v) => setSignupData({ ...signupData, weightUnit: v })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup
                      value={signupData.gender}
                      onValueChange={(v) => setSignupData({ ...signupData, gender: v })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Exercise Plan */}
                  <div className="space-y-2">
                    <Label>Exercise Plan Goal</Label>
                    <Select
                      value={signupData.exercisePlan}
                      onValueChange={(v) => setSignupData({ ...signupData, exercisePlan: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your fitness goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXERCISE_PLANS.map((plan) => (
                          <SelectItem key={plan.value} value={plan.value}>
                            {plan.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <PasswordInput
                      id="signup-password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;

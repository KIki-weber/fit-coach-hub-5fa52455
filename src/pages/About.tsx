import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Target, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import dawitPhoto from "@/assets/photo_2_2026-04-30_06-10-42.jpg";

const About = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            {t("aboutFitCoachPro")}
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12">
            {t("trustedPartner")}
          </p>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("fitCoachProDesc")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="shadow-card">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t("certifiedExperts")}</h3>
                <p className="text-muted-foreground">
                  {t("allCoachesCertified")}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t("goalOriented")}</h3>
                <p className="text-muted-foreground">
                  {t("everyPlanTailored")}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t("communitySupport")}</h3>
                <p className="text-muted-foreground">
                  {t("joinSupportiveCommunity")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-primary rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t("ourMission")}</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              {t("missionDesc")}
            </p>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-8">{t("meetOurCoach")}</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
              <div className="w-64 h-64 rounded-full overflow-hidden shadow-lg">
                <img
                  src={dawitPhoto}
                  alt={t("dawitSemere")}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left md:text-left max-w-md">
                <h3 className="text-2xl font-semibold mb-4">{t("dawitSemere")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("dawitDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

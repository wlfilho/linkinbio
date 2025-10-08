"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import ProfileSection from "./ProfileSection";
import SocialLinksSection from "./SocialLinksSection";
import CustomButtonsSection from "./CustomButtonsSection";
import type { Profile, SocialLink, CustomButton } from "@/lib/types/database";

interface DashboardContentProps {
  profile: Profile | null;
  initialSocialLinks: SocialLink[];
  initialCustomButtons: CustomButton[];
}

export default function DashboardContent({
  profile,
  initialSocialLinks,
  initialCustomButtons,
}: DashboardContentProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Gerencie seu perfil, redes sociais e links personalizados
        </p>
      </div>

      {/* Profile Section */}
      <ProfileSection profile={profile} />

      {/* Social Links Section */}
      <SocialLinksSection
        userId={profile?.id || ""}
        initialSocialLinks={initialSocialLinks}
      />

      {/* Custom Buttons Section */}
      <CustomButtonsSection
        userId={profile?.id || ""}
        initialCustomButtons={initialCustomButtons}
      />
    </div>
  );
}


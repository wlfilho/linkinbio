"use client";

import Image from "next/image";
import { useState } from "react";
import { 
  Youtube, 
  Instagram, 
  Linkedin, 
  Github, 
  Twitter, 
  Facebook,
  ExternalLink,
  Mail,
  Phone,
  FileText
} from "lucide-react";
import type { Profile, SocialLink, CustomButton } from "@/lib/types/database";
import LeadForm from "./LeadForm";
import WebStories from "./WebStories";

interface ProfilePageProps {
  profile: Profile;
  socialLinks: SocialLink[];
  customButtons: CustomButton[];
}

const platformIcons: Record<string, any> = {
  youtube: Youtube,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  facebook: Facebook,
  substack: FileText,
};

const linkTypeIcons: Record<string, any> = {
  external: ExternalLink,
  email: Mail,
  phone: Phone,
};

export default function ProfilePage({
  profile,
  socialLinks,
  customButtons,
}: ProfilePageProps) {
  const [imageError, setImageError] = useState(false);

  const getIconForPlatform = (platform: string) => {
    const Icon = platformIcons[platform.toLowerCase()] || ExternalLink;
    return Icon;
  };

  const getIconForLinkType = (linkType: string) => {
    const Icon = linkTypeIcons[linkType] || ExternalLink;
    return Icon;
  };

  const formatUrl = (url: string, linkType: string) => {
    if (linkType === "email" && !url.startsWith("mailto:")) {
      return `mailto:${url}`;
    }
    if (linkType === "phone" && !url.startsWith("tel:")) {
      return `tel:${url}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-[#212020] py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Web Stories */}
        <WebStories userId={profile.id} />

        {/* Profile Header - Grid Layout */}
        <div className="bg-[#2a2727] rounded-lg p-6 mb-8 border border-[#3a3737]">
          <div className="grid grid-cols-[auto_1fr] gap-6 items-start">
            {/* Column 1: Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-[#3a3737]">
                {profile.avatar_url && !imageError ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-[#177245] flex items-center justify-center text-white text-3xl font-bold">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Profile Info */}
            <div className="min-w-0 flex flex-col justify-center">
              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#177245] mb-0 truncate">
                {profile.full_name}
              </h1>

              {/* Title/Description */}
              {profile.title && (
                <p className="text-[#F1FFFA]/90 text-sm font-body mb-3">
                  {profile.title}
                </p>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {socialLinks.map((link) => {
                    const Icon = getIconForPlatform(link.platform);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                        title={link.display_name}
                        aria-label={link.display_name}
                      >
                        <div
                          className="social-icon-hover w-10 h-10 rounded-md border border-[#3a3737] bg-[#2a2727] flex items-center justify-center text-[#F1FFFA]/70 transition-all duration-200 hover:border-transparent hover:text-white"
                          style={{
                            ['--hover-bg' as any]: link.color,
                          }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Buttons */}
        {customButtons.length > 0 && (
          <div className="space-y-4 mb-8">
            {customButtons.map((button) => {
              const Icon = getIconForLinkType(button.link_type);
              return (
                <a
                  key={button.id}
                  href={formatUrl(button.url, button.link_type)}
                  target={button.link_type === "external" ? "_blank" : undefined}
                  rel={button.link_type === "external" ? "noopener noreferrer" : undefined}
                  className="block"
                >
                  <div className="bg-[#2a2727] rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[#3a3737] group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-[#177245] text-lg group-hover:text-[#1a8a52] transition-colors">
                          {button.title}
                        </h3>
                        {button.subtitle && (
                          <p className="text-[#F1FFFA]/90 text-sm font-body mt-1">
                            {button.subtitle}
                          </p>
                        )}
                      </div>
                      <Icon className="w-6 h-6 text-[#F1FFFA]/70 group-hover:text-[#1a8a52] transition-colors ml-4" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Lead Form */}
        <LeadForm userId={profile.id} />

        {/* Footer */}
        <footer className="text-center mt-12 text-[#F1FFFA]/70 text-sm font-body">
          <p>© {new Date().getFullYear()} {profile.full_name}. Todos os direitos reservados.</p>
          <p className="mt-2">
            Criado com{" "}
            <span className="text-[#177245]">❤</span>{" "}
            usando Link in Bio
          </p>
        </footer>
      </div>
    </div>
  );
}


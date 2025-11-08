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

// TikTok Icon Component - Properly scaled without distortion
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const platformIcons: Record<string, any> = {
  youtube: Youtube,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: TikTokIcon,
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

        {/* Profile Header - Responsive Layout */}
        <div className="bg-[#2a2727] rounded-lg p-6 mb-8 border border-[#3a3737]">
          {/* Mobile Layout: Vertical, Centered */}
          <div className="flex flex-col items-center sm:hidden">
            {/* Avatar - Top */}
            <div className="mb-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#3a3737]">
                {profile.avatar_url && !imageError ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    width={96}
                    height={96}
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

            {/* Social Links - Below Avatar */}
            {socialLinks.length > 0 && (
              <div className="flex gap-2 flex-wrap justify-center mb-4">
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

            {/* Name and Title - Below Social Links */}
            <div className="text-center w-full">
              <h1 className="text-2xl font-heading font-bold text-[#177245] mb-2">
                {profile.full_name}
              </h1>
              {profile.title && (
                <p className="text-[#F1FFFA]/90 text-sm font-body">
                  {profile.title}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Layout: Grid (Original) */}
          <div className="hidden sm:grid grid-cols-[auto_1fr] gap-6 items-start">
            {/* Column 1: Avatar */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-lg overflow-hidden border border-[#3a3737]">
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
              <h1 className="text-3xl font-heading font-bold text-[#177245] mb-0 truncate">
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


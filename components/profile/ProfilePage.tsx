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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {profile.avatar_url && !imageError ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
          </div>

          {/* Name and Title */}
          <h1 className="text-3xl font-bold text-text mb-2">
            {profile.full_name}
          </h1>
          {profile.title && (
            <p className="text-gray-600 text-lg">{profile.title}</p>
          )}
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
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
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                    style={{ backgroundColor: link.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </a>
              );
            })}
          </div>
        )}

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
                  <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text text-lg group-hover:text-primary transition-colors">
                          {button.title}
                        </h3>
                        {button.subtitle && (
                          <p className="text-gray-600 text-sm mt-1">
                            {button.subtitle}
                          </p>
                        )}
                      </div>
                      <Icon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors ml-4" />
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
        <footer className="text-center mt-12 text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} {profile.full_name}. Todos os direitos reservados.</p>
          <p className="mt-2">
            Criado com{" "}
            <span className="text-red-500">❤</span>{" "}
            usando Link in Bio
          </p>
        </footer>
      </div>
    </div>
  );
}


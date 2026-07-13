import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/providers/trpc";

const TITLES: Record<string, string> = {
  returnPolicy: "Return & Exchange Policy",
  privacyPolicy: "Privacy Policy",
  termsAndConditions: "Terms & Conditions",
};

export default function PolicyPage({ settingKey }: { settingKey: "returnPolicy" | "privacyPolicy" | "termsAndConditions" }) {
  const { data: settings, isLoading } = trpc.settings.getAll.useQuery();
  const content = settings?.[settingKey];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-8">{TITLES[settingKey]}</h1>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8">
          {isLoading ? (
            <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {content || "This page will be updated soon."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

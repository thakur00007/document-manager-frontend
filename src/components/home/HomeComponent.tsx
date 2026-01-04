import { Link } from "react-router-dom";
import {
  CloudArrowUpIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import type { JSX } from "react";

function HomeComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-16 py-10">
      {/* Hero Section */}
      <div className="space-y-6 max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4 border border-blue-100 dark:border-blue-800">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
          Secure Cloud Storage v1.0
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          Your Data, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            Securely Everywhere
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Store, share, and collaborate on files and folders from any mobile
          device, tablet, or computer.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link
            to="/signup"
            className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
          >
            Get Started for Free
          </Link>
          <Link
            to="/signin"
            className="px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
          >
            Log In
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
        <FeatureCard
          icon={<CloudArrowUpIcon className="w-6 h-6 text-blue-500" />}
          title="Fast Uploads"
          description="Experience lightning-fast file uploads and downloads with our optimized cloud infrastructure."
        />
        <FeatureCard
          icon={<ShieldCheckIcon className="w-6 h-6 text-indigo-500" />}
          title="Bank-Grade Security"
          description="Your files are encrypted at rest and in transit. We prioritize your privacy above all else."
        />
        <FeatureCard
          icon={<DevicePhoneMobileIcon className="w-6 h-6 text-purple-500" />}
          title="Access Anywhere"
          description="Whether you're on your phone, tablet, or laptop, your files are always just a click away."
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}): JSX.Element {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 group text-left">
      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default HomeComponent;

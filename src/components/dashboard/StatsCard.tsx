import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: string | number;
  change: number | string;
  subtitle?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string; size?: number }>;
  gradient?: string;
  trend?: "up" | "down" | "neutral";
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  gradient = "from-purple-600 to-indigo-600",
  trend = "up",
}) => {
  const isPositive = trend === "up" || (typeof change === "number" ? change >= 0 : !String(change).startsWith("-"));

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-6 rounded-2xl relative overflow-hidden transition-all duration-300 group"
    >
      {/* Subtle background ambient glow */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${gradient} opacity-20 blur-2xl rounded-full group-hover:opacity-35 transition-opacity`}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/60">{title}</p>
          <h2 className="text-2xl font-bold tracking-tight text-white">{value}</h2>
          <div className="flex items-center gap-1.5 text-sm font-semibold pt-1">
            <span
              className={`flex items-center gap-0.5 ${
                isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {typeof change === "number" ? Math.abs(change) : change}%
            </span>
            {subtitle && (
              <span className="text-xs text-white/40 font-normal">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}
          >
            <Icon size={24} className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;

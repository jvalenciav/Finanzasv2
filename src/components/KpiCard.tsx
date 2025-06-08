// src/components/KpiCard.tsx

import React from "react";
import "./KpiCard.css";

interface KpiCardProps {
  title: string;
  value: string | number;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => (
  <div className="kpi-card">
    <div className="kpi-title">{title}</div>
    <div className="kpi-value">{value}</div>
  </div>
);

export default KpiCard;

// src/components/ChartsDashboard.tsx

import React from "react";
import type { Movimiento } from "../types/Movimiento";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import "./ChartsDashboard.css";

const COLORS = ["#1976d2", "#d32f2f", "#4caf50", "#ffa000", "#7b1fa2", "#009688"];

interface ChartsProps {
  ingresos: Movimiento[];
  gastos: Movimiento[];
  catMap: Record<string,string>;
  tarMap: Record<string,string>;
}

const ChartsDashboard: React.FC<ChartsProps> = ({ ingresos, gastos, catMap, tarMap }) => {
  // Line data: monthly incomes vs expenses
  const months = Array.from(new Set([...ingresos, ...gastos].map(m => {
    const d=new Date(m.fecha); return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
  }))).sort();
  const lineData = months.map(mon => {
    return {
      month: mon,
      ingresos: ingresos.filter(m => {
        const d=new Date(m.fecha); return mon===`${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
      }).reduce((s,m)=>s+m.monto,0),
      gastos: gastos.filter(m => {
        const d=new Date(m.fecha); return mon===`${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
      }).reduce((s,m)=>s+m.monto,0)
    };
  });

  // Pie data: gastos by category
  const gastosByCat = Object.entries(
    gastos.reduce<Record<string,number>>((acc,m)=>{
      acc[m.idCategoria]=(acc[m.idCategoria]||0)+m.monto;return acc;
    },{})
  ).map(([id,v],i)=>({ name: catMap[id]||id, value:v, color:COLORS[i%COLORS.length] }));

  // Pie data: gastos by tarjeta
  const gastosByTar = Object.entries(
    gastos.reduce<Record<string,number>>((acc,m)=>{
      if(m.idTarjeta) acc[m.idTarjeta]=(acc[m.idTarjeta]||0)+m.monto;return acc;
    },{})
  ).map(([id,v],i)=>({ name: tarMap[id]||id, value:v, color:COLORS[i%COLORS.length] }));

  return (
    <div className="charts-dashboard">
      <div className="chart-container">
        <h4>Ingresos vs Gastos (por mes)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ingresos" stroke="#4caf50" />
            <Line type="monotone" dataKey="gastos" stroke="#d32f2f" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-row">
        <div className="chart-container small">
          <h4>Gastos por Categoría</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={gastosByCat} dataKey="value" nameKey="name" outerRadius={60} label>
                {gastosByCat.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container small">
          <h4>Gastos por Tarjeta</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={gastosByTar} dataKey="value" nameKey="name" outerRadius={60} label>
                {gastosByTar.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsDashboard;

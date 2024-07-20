import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#4B0082",
  "#FF6347",
  "#4682B4",
  "#32CD32",
  "#FFD700",
  "#8A2BE2",
  "#DC143C",
  "#00CED1",
  "#FF1493",
  "#2E8B57",
];

const AgeChart = ({ data }) => {
  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="ageRange"
            cx="50%"
            cy="50%"
            outerRadius={90} 
            innerRadius={30} 
            fill="#8884d8"
            animationBegin={0}
            animationDuration={800}
            legendType="circle"
            isAnimationActive
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ marginLeft: 20, marginTop: -20 }}
            itemStyle={{ fontSize: "8px", color: "#555" }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgeChart;

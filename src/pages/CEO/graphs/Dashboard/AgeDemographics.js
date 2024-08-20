import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
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

const AgeDemographics = React.forwardRef(
  ({ clinics, arrivals, doctors, onDataProcessed }, ref) => {
    const [ageData, setAgeData] = useState([]);

    useEffect(() => {
      const getAgeDemographics = () => {
        const ageDemographics = {
          "0-5": 0,
          "6-18": 0,
          "19-35": 0,
          "36-50": 0,
          "51-65": 0,
          "66+": 0,
        };

        const currentYear = new Date().getFullYear();

        arrivals.forEach((arrival) => {
          const birthYear = new Date(arrival.dob).getFullYear();
          const age = currentYear - birthYear;

          if (age >= 0 && age <= 5) ageDemographics["0-5"]++;
          else if (age >= 6 && age <= 18) ageDemographics["6-18"]++;
          else if (age >= 19 && age <= 35) ageDemographics["19-35"]++;
          else if (age >= 36 && age <= 50) ageDemographics["36-50"]++;
          else if (age >= 51 && age <= 65) ageDemographics["51-65"]++;
          else if (age >= 66) ageDemographics["66+"]++;
        });

        return Object.entries(ageDemographics).map(([ageRange, count]) => ({
          ageRange,
          count,
        }));
      };

      const data = getAgeDemographics();
      setAgeData(data);

      onDataProcessed();
    }, [clinics, arrivals, doctors, onDataProcessed]);

    return (
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            p: 3,
            m: 1,
            borderRadius: 3,
            boxShadow: 2,
            height: 300,
          }}
          ref={ref}
        >
          <CardContent sx={{ p: 2, height: "100%" }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 2, mt: 0, textAlign: "left" }}
            >
              Age demographics
            </Typography>
            <Box sx={{ width: "100%", height: "100%", marginTop: -5 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ageData}
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
                    {ageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}`, `${name}`]}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ marginLeft: 20, marginTop: -20 }}
                    itemStyle={{ fontSize: "8px", color: "#555" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  }
);

export default AgeDemographics;

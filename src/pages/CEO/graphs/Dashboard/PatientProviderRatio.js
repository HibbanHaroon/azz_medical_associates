import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { useTheme } from "@mui/material/styles";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "chart.js";

Chart.register(ChartDataLabels);

function PatientProviderRatio({
  clinics,
  arrivals,
  doctors,
  patientProviderRatioRef,
  onDataProcessed,
}) {
  const [chartData, setChartData] = useState({ datasets: [] });
  const theme = useTheme();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            if (Number.isInteger(value)) {
              return value;
            }
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "start",
        formatter: (value, context) => {
          if (value === 0) {
            return "";
          }
          return context.chart.data.labels[context.dataIndex];
        },
        font: {
          size: 10,
        },
        color: theme.palette.text.primary,
        rotation: 0,
        offset: -15,
      },
    },
    elements: {
      point: {
        radius: 5,
      },
    },
  };

  useEffect(() => {
    const getClinicRatios = () => {
      const names = [];
      const ratios = [];

      for (const clinic of clinics) {
        const clinicArrivals = arrivals.filter(
          (arrival) => arrival.clinicId === clinic.id
        );
        const clinicDoctors = doctors.filter(
          (doctor) => doctor.clinicId === clinic.id
        );

        let ratio = 0;
        if (clinicDoctors.length > 0) {
          ratio = clinicArrivals.length / clinicDoctors.length;
        }
        names.push(clinic.name);
        ratios.push(parseInt(ratio, 10));
      }

      return { names, ratios };
    };

    const { names, ratios } = getClinicRatios();

    const data = {
      labels: names,
      datasets: [
        {
          label: "Arrivals to Providers Ratio",
          data: ratios,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.dark,
          borderWidth: 0,
          barThickness: 20,
          categoryPercentage: 0.8,
          barPercentage: 0.9,
          borderRadius: 40,
        },
      ],
    };

    setChartData(data);
    onDataProcessed();
  }, [
    clinics,
    arrivals,
    doctors,
    theme.palette.primary.main,
    theme.palette.primary.dark,
    onDataProcessed,
  ]);

  return (
    <Grid item xs={12} md={6}>
      <Box
        sx={{ p: 3, m: 1, borderRadius: 3, boxShadow: 2, height: 300 }}
        ref={patientProviderRatioRef}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ marginBottom: 0, marginTop: 0 }}
        >
          Patient Provider Ratio
        </Typography>
        <div style={{ width: "100%", height: "95%" }}>
          <Bar data={chartData} options={options} />
        </div>
      </Box>
    </Grid>
  );
}

export default PatientProviderRatio;

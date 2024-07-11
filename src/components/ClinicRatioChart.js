import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchAllArrivals } from "../services/arrivalsService";
import { fetchDoctors } from "../services/doctorService";
import { getAllClinics } from "../services/clinicService";

const ClinicRatioChart = () => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const clinics = await getAllClinics();
      //   console.log("heehah", clinics);
      const clinicNames = [];
      var ratios = [];

      for (const clinic of clinics) {
        const arrivals = await fetchAllArrivals(clinic.id);
        // console.log("heehah,I", arrivals);
        const doctors = await fetchDoctors(clinic.id);
        // console.log("heehah II", doctors);

        let ratio = 0;
        if (doctors.length > 0) {
          ratio = arrivals.length / doctors.length;
        }
        clinicNames.push(clinic.name);
        ratios.push(parseInt(ratio, 10));
        console.log(ratios, clinicNames);
      }

      setChartData({
        labels: clinicNames,
        datasets: [
          {
            label: "Arrivals to Providers Ratio",
            data: ratios,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
    };

    fetchData();
    console.log(chartData);
  }, []);

  return (
    <div>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default ClinicRatioChart;

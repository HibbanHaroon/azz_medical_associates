import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";

// Function to add a logo and title to the PDF
const addLogoAndTitle = (doc, logoSrc, title, subtitle) => {
  return new Promise((resolve) => {
    const logo = new Image();
    logo.src = logoSrc;
    logo.onload = () => {
      doc.addImage(logo, "PNG", 20, 20, 50, 10);

      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(22);
      const titleWidth =
        (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 47);

      doc.setFontSize(16);
      const subtitleWidth =
        (doc.getStringUnitWidth(subtitle) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
      const subtitleX = (pageWidth - subtitleWidth) / 2;
      doc.setTextColor(128, 128, 128);
      doc.text(subtitle, subtitleX, 56);

      doc.setTextColor(0, 0, 0);
      resolve();
    };
  });
};

// Function to add date, time, and duration to the PDF
const addDateTimeAndDuration = (doc) => {
  const currentDate = new Date();
  const dateTimeStr = `Date and Time: ${currentDate.toLocaleString()}`;
  const durationStr = `Duration: ${currentDate.toLocaleString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  doc.setFontSize(12);
  doc.text(dateTimeStr, 20, 70);
  doc.text(durationStr, 130, 70);
};

// Function to add charts to the PDF
const addChartsToPDF = async (doc, charts) => {
  for (let i = 0; i < charts.length; i++) {
    const chart = charts[i];
    const canvas = await html2canvas(chart);
    const imgData = canvas.toDataURL("image/png");

    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = (pageWidth - 40) / 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const x = (i % 2) * (imgWidth + 20) + 10; // 20px margin on both sides
    const y = 80 + Math.floor(i / 2) * (imgHeight + 20); // 20px margin between rows

    doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

    // Add a new page if charts exceed the page height
    if (y + imgHeight > doc.internal.pageSize.height - 30) {
      doc.addPage();
    }
  }
};

// Function to add a table to the PDF
const addTableToPDF = (doc, tableColumn, tableRows) => {
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 80,
  });
};

// Function to add footer to the PDF
const addFooter = (doc) => {
  doc.setFontSize(10);
  doc.text(
    "This report is system generated.",
    20,
    doc.internal.pageSize.height - 10
  );
};

export const downloadReport = async ({
  title,
  subtitle,
  charts = [],
  table = null,
  tableColumns = [],
  tableRows = [],
  docName = "report.pdf",
}) => {
  const doc = new jsPDF();

  try {
    // Add logo and title
    await addLogoAndTitle(doc, "/assets/logos/logoHAUTO.png", title, subtitle);

    // Add date, time, and duration
    addDateTimeAndDuration(doc);

    // Add charts if available
    if (charts.length > 0) {
      await addChartsToPDF(doc, charts);
    }

    // Add table if available
    if (table) {
      addTableToPDF(doc, tableColumns, tableRows);
    }

    // Add footer
    addFooter(doc);

    // Save the PDF
    doc.save(docName);
  } catch (error) {
    console.error("Error generating report:", error);
  }
};

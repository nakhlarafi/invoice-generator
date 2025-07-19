import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toWords } from "number-to-words";

export default function InvoiceForm() {
  const pdfRef = useRef(null);

  const [header, setHeader] = useState({
    billNumber: "",
    to: "",
    through: "",
    post: "",
    side: "",
    address1: "",
    address2: "",
    poNumber: "",
  });

  const [rows, setRows] = useState([
    {
      date: "",
      challan: "",
      voltage: "",
      quantity: 0,
      rate: 0,
      remark: "",
    },
  ]);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] =
      field === "quantity" || field === "rate" ? parseFloat(value) : value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { date: "", challan: "", voltage: "", quantity: 0, rate: 0, remark: "" },
    ]);
  };

  const totalQuantity = rows
    .reduce((sum, row) => sum + row.quantity, 0)
    .toFixed(2);
  const totalAmount = rows
    .reduce((sum, row) => sum + row.quantity * row.rate, 0)
    .toFixed(2);

  const buildPDF = () => {
    const doc = new jsPDF();
    
    // Header Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Bismillahir Rahmanir Rahim", 105, 15, { align: "center" });
    doc.setFontSize(20);
    doc.text("M/S DOLPHIN CAREER ENTERPRISE", 105, 25, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Proprietor: MD IQBAL HOSSAIN (JIBON)", 105, 32, { align: "center" });
    doc.text("Address: 103 Pathantuli, Moshjid Road, Narayanganj", 105, 39, { align: "center" });
    doc.text("Email: IQBAL021054@GMAIL.COM", 105, 46, { align: "center" });
    doc.text("Mobile: 01711074444, 01823058478", 105, 53, { align: "center" });

    // Header Info from the form
    doc.setFontSize(11);
    let y = 65;
    doc.text(`To: ${header.to}`, 14, y);
    doc.text(`Through: ${header.through}`, 14, y + 7);
    doc.text(`Post: ${header.post}`, 14, y + 14);
    doc.text(`Side: ${header.side}`, 14, y + 21);
    doc.text(`Address: ${header.address1}`, 14, y + 28);
    doc.text(`${header.address2}`, 14, y + 35);
    doc.text(`P.O No: ${header.poNumber}`, 14, y + 42);
    doc.text(`Bill No - ${header.billNumber}`, 14, y + 49);

    // Draw horizontal line right after mobile info
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setLineWidth(0.5);
    doc.line(14, 58, pageWidth - 14, 58);

    // Table Rows
    const tableRows = rows.map((row, index) => [
      index + 1,
      row.date,
      row.challan,
      row.voltage,
      row.quantity,
      row.rate,
      (row.quantity * row.rate).toFixed(2),
      row.remark,
    ]);

    autoTable(doc, {
      head: [
        [
          "SL",
          "Date",
          "Challan",
          "Name of Voltage",
          "Quantity (cft)",
          "Rate (Tk)",
          "Amount (Tk)",
          "Remarks",
        ],
      ],
      body: tableRows,
      startY: y + 60,
      styles: { fontSize: 10, textColor: 0 },
      headStyles: { fillColor: [240, 240, 240], textColor: 0 },
      theme: "grid",
    });

    // Totals and Extra Info
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total:`, 14, finalY);
    doc.text(`Quantity (cft) = ${totalQuantity} cft`, 30, finalY);
    doc.text(`Amount = ${totalAmount} Tk`, 100, finalY);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `In Words: ${toWords(Math.floor(totalAmount))} Taka Only`,
      14,
      finalY + 10
    );

    // Proprietor Signature area in the bottom right corner
    const sigY = finalY + 30;
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 70, sigY, pageWidth - 14, sigY);
    doc.setFontSize(10);
    doc.text("Proprietor Signature", pageWidth - 14, sigY + 5, {
      align: "right",
    });

    // Place NB note at the very bottom left corner in very small text
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.text(
      "N.B. - All kinds of goods transportation service.",
      14,
      pageHeight - 5
    );

    return doc;
  };

  const generatePDF = () => {
    const doc = buildPDF();
    doc.save("invoice.pdf");
  };

  const handlePrint = () => {
    const doc = buildPDF();
    window.open(doc.output("bloburl"));
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2 style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        Invoice Generator
      </h2>

      <h3>Header Info</h3>
      {Object.entries(header).map(([key, value]) => (
        <input
          key={key}
          type="text"
          placeholder={key.replace(/([A-Z])/g, " $1")}
          value={value}
          onChange={(e) => setHeader({ ...header, [key]: e.target.value })}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
      ))}

      <h3>Invoice Rows</h3>
      {rows.map((row, idx) => (
        <div
          key={idx}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <strong>SL: {idx + 1}</strong>
          <input
            type="date"
            placeholder="Date"
            value={row.date}
            onChange={(e) => handleRowChange(idx, "date", e.target.value)}
            style={{ margin: 5 }}
          />
          <input
            type="text"
            placeholder="Challan"
            value={row.challan}
            onChange={(e) => handleRowChange(idx, "challan", e.target.value)}
            style={{ margin: 5 }}
          />
          <input
            type="text"
            placeholder="Name of Bolgate"
            value={row.voltage}
            onChange={(e) => handleRowChange(idx, "voltage", e.target.value)}
            style={{ margin: 5 }}
          />
          <input
            type="number"
            placeholder="Quantity (cft)"
            value={row.quantity}
            onChange={(e) => handleRowChange(idx, "quantity", e.target.value)}
            style={{ margin: 5 }}
            min="0"
            step="any"
            onWheel={(e) => e.target.blur()}
          />

          <input
            type="number"
            placeholder="Rate (Tk)"
            value={row.rate}
            onChange={(e) => handleRowChange(idx, "rate", e.target.value)}
            style={{ margin: 5 }}
            min="0"
            step="any"
            onWheel={(e) => e.target.blur()}
          />
          <input
            type="text"
            placeholder="Remarks"
            value={row.remark}
            onChange={(e) => handleRowChange(idx, "remark", e.target.value)}
            style={{ margin: 5 }}
          />
          <div>
            <strong>Amount: {(row.quantity * row.rate).toFixed(2)} Tk</strong>
          </div>
        </div>
      ))}

      <button
        onClick={addRow}
        style={{ padding: "10px 20px", marginRight: 10 }}
      >
        Add Row
      </button>
      <button
        onClick={generatePDF}
        style={{ padding: "10px 20px", marginRight: 10 }}
      >
        Generate PDF
      </button>
      <button onClick={handlePrint} style={{ padding: "10px 20px" }}>
        Print
      </button>

      <div style={{ marginTop: 20 }}>
        <strong>Total Quantity: {totalQuantity} cft</strong>
        <br />
        <strong>Total Amount: {totalAmount} Tk</strong>
      </div>
    </div>
  );
}

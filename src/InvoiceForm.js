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
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Bismillahir Rahmanir Rahim", 105, 15, { align: "center" });
    doc.setFontSize(20);
    doc.text("M/S DOLPHIN CARRIER ENTERPRISE", 105, 25, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Proprietor: MD IQBAL HOSSAIN (JIBON)", 105, 32, { align: "center" });
    doc.text("Address: 103 Pathantuli, Moshjid Road, Narayanganj", 105, 39, { align: "center" });
    doc.text("Email: IQBAL021054@GMAIL.COM", 105, 46, { align: "center" });
    doc.text("Mobile: 01711074444, 01823058478", 105, 53, { align: "center" });

    // Header Info from the form
    doc.setFontSize(11);
    let y = 65;
    doc.setFont("helvetica", "bold");
    doc.text("To:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${header.to}`, 35, y);
    
    doc.setFont("helvetica", "bold");
    doc.text("Through:", 14, y + 7);
    doc.setFont("helvetica", "normal");
    doc.text(`${header.through}`, 35, y + 7);
    
    doc.setFont("helvetica", "bold");
    doc.text("Post:", 14, y + 14);
    doc.setFont("helvetica", "normal");
    doc.text(`${header.post}`, 35, y + 14);
    
    doc.setFont("helvetica", "bold");
    doc.text("Side:", 14, y + 21);
    doc.setFont("helvetica", "normal");
    doc.text(`${header.side}`, 35, y + 21);
    
    doc.setFont("helvetica", "bold");
    doc.text("Address:", 14, y + 28);
    doc.setFont("helvetica", "normal");
    doc.text(`${header.address1}`, 35, y + 28);
    
    doc.text(`${header.address2}`, 35, y + 35); // No label here
    
    doc.setFont("helvetica", "bold");
    doc.text("P.O No:", 14, y + 42);
    doc.setFont("helvetica", "normal");
    doc.text(`${header.poNumber}`, 35, y + 42);
    // doc.text(`Bill No - ${header.billNumber}`, 14, y + 49);
    // Bill No in the center just above the table
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Bill No: ${header.billNumber}`, 105, y + 55, { align: "center" });



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
          "Name of Bolgate",
          "Quantity (cft)",
          "Rate (Tk)",
          "Amount (Tk)",
          "Remarks",
        ],
      ],
      body: tableRows,
      startY: y + 65,
      styles: {
        fontSize: 10,
        textColor: 0,
        lineColor: 0,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 255, 255], // white background
        textColor: 0,               // black text
        lineColor: 0,               // black border lines
        lineWidth: 0.1,
        fontStyle: 'bold',
      },
      theme: "grid",
    });
    

    const finalY = doc.lastAutoTable.finalY + 10;
    const lineSpacing = 7;
// Line 1: "Total:" (bold)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 14, finalY);

    // Line 2: Quantity (label normal, value bold)
    doc.setFont("helvetica", "normal");
    doc.text("Quantity (cft) =", 14, finalY + lineSpacing);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalQuantity} cft`, 45, finalY + lineSpacing);  // adjust X if needed

    // Line 3: Amount (label normal, value bold)
    doc.setFont("helvetica", "normal");
    doc.text("Amount =", 14, finalY + lineSpacing * 2);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalAmount} Tk`, 45, finalY + lineSpacing * 2);  // adjust X if needed

    
    // Line 4: In Words
    doc.setFontSize(11);
    doc.text(
      [`In Words: ${toWords(Math.floor(totalAmount))} Taka Only`],
      14,
      finalY + lineSpacing * 3,
      { maxWidth: pageWidth - 28 } // leave 14 margin on both sides
    );

    
    // Signature
    const sigY = finalY + lineSpacing * 5; // give enough space from "In Words"
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 70, sigY, pageWidth - 14, sigY); // signature line
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

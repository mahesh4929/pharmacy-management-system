"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { Order, Invoice } from "./types";
import { getSession } from "./auth";

/**
 * Generates a professional PDF invoice for an order.
 * Uses jsPDF (client-side PDF library) so no backend dependency needed.
 * The PDF includes: company header, invoice details, customer info,
 * itemized line items in a table, and total.
 */
export function downloadInvoicePdf(order: Order): void {
  try {
    const doc = new jsPDF();
    const session = getSession();
    const invoice = order.invoice;
    const items = order.ordered_items || [];

    // ============ HEADER ============
    // Company name and tagline in brand color
    doc.setFillColor(79, 70, 229); // brand-600 indigo
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MediStock", 14, 14);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Pharmacy Management System", 14, 21);

    doc.setFontSize(8);
    doc.text("Tax Invoice", 196, 14, { align: "right" });
    doc.text("GSTIN: 27ABCDE1234F1Z5", 196, 21, { align: "right" });

    // Reset to black for body
    doc.setTextColor(0, 0, 0);

    // ============ INVOICE META ============
    let y = 42;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice #${invoice?.id || "—"}`, 14, y);

    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // ink-500
    doc.text(`Order ID: #${order.id}`, 14, y);

    y += 5;
    const orderDate = order.date ? new Date(order.date).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }) : "—";
    doc.text(`Order Date: ${orderDate}`, 14, y);

    y += 5;
    doc.text(`Status: ${invoice?.status || "unfulfilled"}`, 14, y);

    // ============ CUSTOMER INFO (top right) ============
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("BILLED TO", 196, 42, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(session?.username || "Customer", 196, 49, { align: "right" });
    doc.text(`Customer ID: #${order.customer_id}`, 196, 54, { align: "right" });

    // ============ LINE ITEMS TABLE ============
    const tableData = items.map((item, idx) => [
      String(idx + 1),
      item.stock_name || `Medicine #${item.stock_id}`,
      String(item.amount),
    ]);

    autoTable(doc, {
      startY: y + 10,
      head: [["#", "Medicine", "Quantity"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 130 },
        2: { cellWidth: 40, halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });

    // ============ TOTAL ============
    // @ts-ignore - lastAutoTable is added by the autotable plugin
    const finalY = (doc as any).lastAutoTable.finalY || y + 30;
    const totalY = finalY + 12;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(120, totalY - 3, 196, totalY - 3);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Total Amount:", 140, totalY + 4);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const total = invoice?.totalPrice !== undefined ? `Rs. ${invoice.totalPrice.toFixed(2)}` : "Rs. 0.00";
    doc.text(total, 196, totalY + 4, { align: "right" });

    // ============ FOOTER ============
    const footerY = 280;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, footerY - 4, 196, footerY - 4);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      "This is a system-generated invoice. Thank you for your purchase.",
      105,
      footerY,
      { align: "center" }
    );
    doc.text(
      `Generated on ${new Date().toLocaleString("en-IN")}`,
      105,
      footerY + 5,
      { align: "center" }
    );

    // Save with descriptive filename
    const filename = `invoice-${invoice?.id || order.id}.pdf`;
    doc.save(filename);
    toast.success(`Invoice ${filename} downloaded`);
  } catch (err: any) {
    console.error("PDF generation error:", err);
    toast.error("Failed to generate PDF: " + (err?.message || "unknown error"));
  }
}

/**
 * Generates PDF directly from an Invoice object (for employee invoices page).
 * If the invoice has an order attached, we use that; otherwise we build minimal PDF.
 */
export function downloadInvoicePdfFromInvoice(invoice: Invoice): void {
  if (invoice.order) {
    // The order may have a back-reference to invoice; ensure invoice is set
    const orderWithInvoice = { ...invoice.order, invoice };
    downloadInvoicePdf(orderWithInvoice);
  } else {
    // Backend didn't send the full order - generate a simpler invoice PDF
    try {
      const doc = new jsPDF();
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("MediStock", 14, 14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Pharmacy Management System", 14, 21);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Invoice #${invoice.id}`, 14, 45);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Status: ${invoice.status}`, 14, 55);
      doc.text(`Total: Rs. ${(invoice.totalPrice || 0).toFixed(2)}`, 14, 62);
      doc.text(`Employee ID: ${invoice.employee_id || "—"}`, 14, 69);

      doc.save(`invoice-${invoice.id}.pdf`);
      toast.success(`Invoice ${invoice.id} downloaded`);
    } catch (err: any) {
      toast.error("Failed to generate PDF");
    }
  }
}

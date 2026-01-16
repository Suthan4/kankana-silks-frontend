// src/utils/generateReceipt.ts
import jsPDF from "jspdf";
import type { Order } from "@/lib/api/order.api";

export const generateOrderReceipt = (order: Order) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Company Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("KANKANA SILKS", pageWidth / 2, yPos, { align: "center" });

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Silk Sarees", pageWidth / 2, yPos, { align: "center" });

  yPos += 5;
  doc.text("Bangalore, Karnataka | GST: 29AABCK1234F1Z5", pageWidth / 2, yPos, {
    align: "center",
  });

  // Order Receipt Title
  yPos += 15;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ORDER RECEIPT", pageWidth / 2, yPos, { align: "center" });

  // Horizontal line
  yPos += 5;
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);

  // Order Details
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Order Number:", 15, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(order.orderNumber, 60, yPos);

  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Order Date:", 15, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(order.createdAt).toLocaleDateString(), 60, yPos);

  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 15, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(order.status.toUpperCase(), 60, yPos);

  // Shipping Address
  yPos += 12;
  doc.setFont("helvetica", "bold");
  doc.text("SHIPPING ADDRESS", 15, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  doc.text(order.shippingAddress.fullName, 15, yPos);
  yPos += 5;
  doc.text(order.shippingAddress.addressLine1, 15, yPos);
  if (order.shippingAddress.addressLine2) {
    yPos += 5;
    doc.text(order.shippingAddress.addressLine2, 15, yPos);
  }
  yPos += 5;
  doc.text(
    `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
    15,
    yPos
  );
  yPos += 5;
  doc.text(`Phone: ${order.shippingAddress.phone}`, 15, yPos);

  // Payment Details (if exists)
  if (order.payment) {
    yPos += 12;
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT DETAILS", 15, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Method: ${order.payment.method}`, 15, yPos);
    yPos += 5;
    doc.text(`Status: ${order.payment.status.toUpperCase()}`, 15, yPos);
    if (order.payment.razorpayPaymentId) {
      yPos += 5;
      doc.text(`Payment ID: ${order.payment.razorpayPaymentId}`, 15, yPos);
    }
  }

  // Items Table Header
  yPos += 15;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Item", 18, yPos);
  doc.text("Qty", pageWidth - 80, yPos);
  doc.text("Price", pageWidth - 60, yPos);
  doc.text("Total", pageWidth - 30, yPos, { align: "right" });

  // Items
  yPos += 8;
  doc.setFont("helvetica", "normal");
  order.items.forEach((item) => {
    const itemName = item.productName.substring(0, 35);
    doc.text(itemName, 18, yPos);
    doc.text(item.quantity.toString(), pageWidth - 80, yPos);
    doc.text(`₹${item.price.toFixed(2)}`, pageWidth - 60, yPos);
    doc.text(`₹${item.total.toFixed(2)}`, pageWidth - 30, yPos, {
      align: "right",
    });

    if (item.variant) {
      yPos += 4;
      doc.setFontSize(8);
      const variantText = [
        item.variant.size && `Size: ${item.variant.size}`,
        item.variant.color && `Color: ${item.variant.color}`,
        item.variant.fabric && `Fabric: ${item.variant.fabric}`,
      ]
        .filter(Boolean)
        .join(" | ");
      doc.text(variantText, 18, yPos);
      doc.setFontSize(10);
    }

    yPos += 8;

    // Add new page if needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Totals Section
  yPos += 5;
  doc.setLineWidth(0.3);
  doc.line(pageWidth - 100, yPos, pageWidth - 15, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", pageWidth - 80, yPos);
  doc.text(`₹${order.subtotal.toFixed(2)}`, pageWidth - 30, yPos, {
    align: "right",
  });

  if (order.discount > 0) {
    yPos += 6;
    doc.text("Discount:", pageWidth - 80, yPos);
    doc.text(`-₹${order.discount.toFixed(2)}`, pageWidth - 30, yPos, {
      align: "right",
    });

    if (order.coupon) {
      yPos += 4;
      doc.setFontSize(8);
      doc.text(`(Coupon: ${order.coupon.code})`, pageWidth - 80, yPos);
      doc.setFontSize(10);
    }
  }

  yPos += 6;
  doc.text("Shipping:", pageWidth - 80, yPos);
  const shippingText =
    order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost.toFixed(2)}`;
  doc.text(shippingText, pageWidth - 30, yPos, { align: "right" });

  // Calculate GST (18%)
  const taxableAmount = order.subtotal - order.discount + order.shippingCost;
  const gstAmount = taxableAmount * 0.18;

  yPos += 6;
  doc.text("GST (18%):", pageWidth - 80, yPos);
  doc.text(`₹${gstAmount.toFixed(2)}`, pageWidth - 30, yPos, {
    align: "right",
  });

  yPos += 2;
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 100, yPos, pageWidth - 15, yPos);

  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL:", pageWidth - 80, yPos);
  doc.text(`₹${order.total.toFixed(2)}`, pageWidth - 30, yPos, {
    align: "right",
  });

  // Shipment Info (if exists)
  if (order.shipment && order.shipment.trackingNumber) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SHIPMENT DETAILS", 15, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Tracking Number: ${order.shipment.trackingNumber}`, 15, yPos);
    yPos += 5;
    if (order.shipment.courierName) {
      doc.text(`Courier: ${order.shipment.courierName}`, 15, yPos);
      yPos += 5;
    }
    if (order.shipment.estimatedDelivery) {
      doc.text(
        `Est. Delivery: ${new Date(
          order.shipment.estimatedDelivery
        ).toLocaleDateString()}`,
        15,
        yPos
      );
    }
  }

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 30;
  doc.setLineWidth(0.3);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for shopping with Kankana Silks!", pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 5;
  doc.setFontSize(8);
  doc.text(
    "For any queries, contact us at support@kankanasilks.com | +91 80 1234 5678",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );

  // Save PDF
  doc.save(`Order_${order.orderNumber}_Receipt.pdf`);
};

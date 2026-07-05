"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { ArrowLeft, User, Phone, Mail, MapPin, CheckCircle, FileText, ExternalLink, Truck } from "lucide-react";

type OrderStatus = "Pending Payment" | "Awaiting Verification" | "Payment Confirmed" | "Preparing Order" | "Driver Assigned" | "Shipped" | "Delivered";

interface TimelineStep {
  status: OrderStatus;
  completed: boolean;
  date?: string;
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("Awaiting Verification");
  const [receiptVerified, setReceiptVerified] = useState(true);

  // In a real app, this would fetch by order ID
  const orderDetails = {
    id: id || "DV-000153",
    status: currentStatus,
    customer: {
      fullName: "Grace Okafor",
      phone1: "08012345678",
      phone2: "08098765432",
      email: "grace@email.com",
      address: "12 Lekki Phase 1, Lagos",
      state: "Lagos",
      city: "Lekki",
    },
    items: [
      { name: "Baggy Jeans — Washed Blue", size: "M", color: "Blue", qty: 1, price: 15000 },
      { name: "Basic Top — White", size: "S", color: "White", qty: 2, price: 8500 },
      { name: "Casual Dress — Floral", size: "L", color: "Multi", qty: 1, price: 22000 },
    ],
    deliveryFee: 3000,
    receipt: {
      uploadedAt: "Jun 18, 2026 • 2:34 PM",
      filename: "receipt_dv153.jpg",
      size: "1.2 MB",
    }
  };

  const subtotal = orderDetails.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const total = subtotal + orderDetails.deliveryFee;

  const timelineSteps: TimelineStep[] = [
    { status: "Pending Payment", completed: true },
    { status: "Awaiting Verification", completed: true },
    { status: "Payment Confirmed", completed: currentStatus !== "Pending Payment" && currentStatus !== "Awaiting Verification" },
    { status: "Preparing Order", completed: ["Preparing Order", "Driver Assigned", "Shipped", "Delivered"].includes(currentStatus) },
    { status: "Driver Assigned", completed: ["Driver Assigned", "Shipped", "Delivered"].includes(currentStatus) },
    { status: "Shipped", completed: ["Shipped", "Delivered"].includes(currentStatus) },
    { status: "Delivered", completed: currentStatus === "Delivered" },
  ];

  const handleNextStatus = () => {
    if (currentStatus === "Awaiting Verification") {
      setCurrentStatus("Payment Confirmed");
    } else if (currentStatus === "Payment Confirmed") {
      setCurrentStatus("Preparing Order");
    } else if (currentStatus === "Preparing Order") {
      setCurrentStatus("Driver Assigned");
    } else if (currentStatus === "Driver Assigned") {
      setCurrentStatus("Shipped");
    } else if (currentStatus === "Shipped") {
      setCurrentStatus("Delivered");
    }
  };

  const getStatusButtonText = () => {
    switch (currentStatus) {
      case "Pending Payment":
        return "Confirm Payment";
      case "Awaiting Verification":
        return "Confirm Payment";
      case "Payment Confirmed":
        return "Prepare Order";
      case "Preparing Order":
        return "Assign Driver";
      case "Driver Assigned":
        return "Ship Order";
      case "Shipped":
        return "Mark Delivered";
      default:
        return "Order Completed";
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <Link
            href="/admin/orders"
            className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Order {orderDetails.id}</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans bg-orange-50 text-orange-600">
            {orderDetails.status}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          
          {/* Left Column: Customer & Items */}
          <div className="space-y-6">
            
            {/* Customer Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-sans text-base font-semibold text-[#1C1512]">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50 md:col-span-2">
                  <span className="text-[#8C8682] font-sans">Full Name</span>
                  <span className="font-semibold text-[#1C1512] font-sans">{orderDetails.customer.fullName}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#8C8682] font-sans">Phone 1</span>
                  <span className="font-semibold text-[#1C1512] font-sans">{orderDetails.customer.phone1}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#8C8682] font-sans">Phone 2</span>
                  <span className="font-semibold text-[#1C1512] font-sans">{orderDetails.customer.phone2}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50 md:col-span-2">
                  <span className="text-[#8C8682] font-sans">Email</span>
                  <span className="font-semibold text-[#1C1512] font-sans">{orderDetails.customer.email}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50 md:col-span-2">
                  <span className="text-[#8C8682] font-sans text-right">Address</span>
                  <span className="font-semibold text-[#1C1512] font-sans text-right">{orderDetails.customer.address}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#8C8682] font-sans">State</span>
                  <span className="font-semibold text-[#1C1512] font-sans">{orderDetails.customer.state}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#8C8682] font-sans">City</span>
                  <span className="font-semibold text-[#1C1512] font-sans">{orderDetails.customer.city}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-sans text-base font-semibold text-[#1C1512]">Order Items</h2>
                <span className="font-sans text-xs text-[#8C8682]">{orderDetails.id}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[#8C8682]">
                      <th className="text-left px-6 py-3 font-semibold font-sans whitespace-nowrap">Product</th>
                      <th className="text-center px-4 py-3 font-semibold font-sans whitespace-nowrap">Size</th>
                      <th className="text-center px-4 py-3 font-semibold font-sans whitespace-nowrap">Color</th>
                      <th className="text-center px-4 py-3 font-semibold font-sans whitespace-nowrap">Qty</th>
                      <th className="text-right px-4 py-3 font-semibold font-sans whitespace-nowrap">Price</th>
                      <th className="text-right px-6 py-3 font-semibold font-sans whitespace-nowrap">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orderDetails.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 font-semibold text-[#1C1512] font-sans whitespace-nowrap">{item.name}</td>
                        <td className="px-4 py-4 text-center font-sans whitespace-nowrap">{item.size}</td>
                        <td className="px-4 py-4 text-center font-sans whitespace-nowrap">{item.color}</td>
                        <td className="px-4 py-4 text-center font-semibold text-[#1C1512] font-sans whitespace-nowrap">{item.qty}</td>
                        <td className="px-4 py-4 text-right font-sans whitespace-nowrap">₦{item.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-semibold text-[#1C1512] font-sans whitespace-nowrap">₦{(item.price * item.qty).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Price Calculations */}
              <div className="bg-[#FAF7F2] p-6 border-t border-gray-100 flex flex-col items-end gap-2 text-sm font-sans">
                <div className="flex justify-between w-64 text-[#8C8682]">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#1C1512]">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-64 text-[#8C8682]">
                  <span>Delivery:</span>
                  <span className="font-semibold text-[#1C1512]">₦{orderDetails.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-64 text-base font-bold text-[#1C1512] border-t border-gray-200/50 pt-2 mt-1">
                  <span>Total:</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Status Timeline, Receipt & Driver */}
          <div className="space-y-6">
            
            {/* Order Status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-base font-semibold text-[#1C1512]">Order Status</h2>
                {currentStatus !== "Delivered" && (
                  <button
                    onClick={handleNextStatus}
                    className="px-3 py-1 bg-[#FAF7F2] hover:bg-[#C9956A]/10 border border-[#C9956A]/20 hover:border-[#C9956A]/40 text-[#C9956A] text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
                  >
                    {getStatusButtonText()}
                  </button>
                )}
              </div>

              {/* Vertical Timeline */}
              <div className="relative pl-6 space-y-5">
                {/* Timeline Line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-100" />

                {timelineSteps.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-3">
                    {/* Timeline Node */}
                    <div
                      className={`absolute -left-6 w-5.5 h-5.5 rounded-full border-4 flex items-center justify-center -translate-x-0.5 ${
                        step.completed
                          ? "bg-emerald-500 border-white ring-2 ring-emerald-500/20"
                          : "bg-white border-gray-200"
                      }`}
                    />
                    <div className="ml-1.5">
                      <p
                        className={`font-sans text-sm ${
                          step.completed ? "font-semibold text-[#1C1512]" : "text-[#8C8682]"
                        }`}
                      >
                        {step.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Receipt */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-base font-semibold text-[#1C1512]">Payment Receipt</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans ${
                    receiptVerified ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {receiptVerified ? "Verified" : "Awaiting Verification"}
                </span>
              </div>

              {/* Receipt File Card */}
              <div className="flex items-center gap-3.5 p-4 bg-[#FAF7F2]/60 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-[#8C8682]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-xs text-[#8C8682]">Uploaded: {orderDetails.receipt.uploadedAt}</p>
                  <p className="font-sans text-sm font-semibold text-[#1C1512] truncate mt-0.5">{orderDetails.receipt.filename}</p>
                  <p className="font-sans text-xs text-[#8C8682] mt-0.5">{orderDetails.receipt.size}</p>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-2.5 bg-[#C9956A] hover:bg-[#A87A52] text-white font-sans text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                View Full Receipt
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            {/* Delivery Assignment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-base font-semibold text-[#1C1512]">Delivery Assignment</h2>
                <button className="px-3 py-1 bg-[#FAF7F2] border border-[#C9956A]/20 text-[#C9956A] hover:bg-[#C9956A]/10 text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
                  <Truck className="h-3 w-3" />
                  Assign Driver
                </button>
              </div>

              <div className="border border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center text-center">
                <Truck className="h-6 w-6 text-[#8C8682] mb-1.5" />
                <p className="font-sans text-xs text-[#8C8682]">No driver assigned yet.</p>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

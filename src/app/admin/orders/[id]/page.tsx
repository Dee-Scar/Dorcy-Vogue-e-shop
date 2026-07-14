"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { ArrowLeft, Truck, FileText, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type OrderStatus = "Pending Payment" | "Awaiting Verification" | "Payment Confirmed" | "Preparing Order" | "Driver Assigned" | "Shipped" | "Delivered";

interface TimelineStep {
  status: OrderStatus;
  completed: boolean;
}

interface OrderItem {
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
}

interface OrderDetail {
  id: string;
  status: OrderStatus;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  city: string;
  items: OrderItem[];
  delivery_fee: number;
  receipt_url: string | null;
  receipt_uploaded_at: string | null;
  driver_name: string | null;
  created_at: string;
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const orderId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [tempDriverName, setTempDriverName] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", orderId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const items: OrderItem[] = (data.order_items || []).map((item: any) => ({
            name: item.product_name || "Product",
            size: item.size || "—",
            color: item.color || "—",
            qty: item.quantity || 1,
            price: Number(item.price || 0),
          }));

          setOrder({
            id: data.id,
            status: data.status as OrderStatus,
            customer_name: data.full_name || data.email || "Unknown",
            phone: data.phone || "—",
            email: data.email || "—",
            address: data.address || "—",
            state: data.state || "—",
            city: data.city || "—",
            items,
            delivery_fee: Number(data.shipping_cost || 0),
            receipt_url: data.receipt_url || null,
            receipt_uploaded_at: data.receipt_uploaded_at || null,
            driver_name: data.driver_name || null,
            created_at: data.created_at,
          });
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleNextStatus = async () => {
    if (!order || updating) return;

    let nextStatus: OrderStatus | null = null;
    if (order.status === "Pending Payment") nextStatus = "Awaiting Verification";
    else if (order.status === "Awaiting Verification") nextStatus = "Payment Confirmed";
    else if (order.status === "Payment Confirmed") nextStatus = "Preparing Order";
    else if (order.status === "Preparing Order") nextStatus = "Driver Assigned";
    else if (order.status === "Driver Assigned") nextStatus = "Shipped";
    else if (order.status === "Shipped") nextStatus = "Delivered";

    if (!nextStatus) return;

    setUpdating(true);
    try {
      const updatePayload: Record<string, string> = { status: nextStatus };

      // If confirming payment, also update payment_status
      if (nextStatus === "Payment Confirmed") {
        updatePayload.payment_status = "Confirmed";
      }

      const { error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", order.id);

      if (error) throw error;

      setOrder({ ...order, status: nextStatus });

      // When payment is confirmed, email the customer
      if (nextStatus === "Payment Confirmed" && order.email) {
        const subtotalForEmail = order.items.reduce((acc, item) => acc + item.price * item.qty, 0);
        const totalForEmail = subtotalForEmail + order.delivery_fee;
        try {
          await fetch("/api/notify-admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "payment_confirmed",
              orderId: order.id,
              customerName: order.customer_name,
              customerEmail: order.email,
              amount: totalForEmail,
              items: order.items,
            }),
          });
        } catch (emailErr) {
          console.warn("Payment confirmation email failed (non-fatal):", emailErr);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignDriver = async (driverName: string) => {
    if (!order || updating) return;
    setUpdating(true);
    try {
      const updatePayload: any = { driver_name: driverName };
      
      // If order is currently in "Preparing Order", auto-advance it to "Driver Assigned"
      if (order.status === "Preparing Order") {
        updatePayload.status = "Driver Assigned";
      }

      const { error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", order.id);

      if (error) throw error;

      setOrder({ 
        ...order, 
        driver_name: driverName,
        status: updatePayload.status || order.status
      });
      setIsAssignModalOpen(false);
    } catch (err) {
      console.error("Error assigning driver:", err);
      alert("Failed to assign driver. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusButtonText = () => {
    if (!order) return "";
    switch (order.status) {
      case "Pending Payment": return "Mark Awaiting Verification";
      case "Awaiting Verification": return "Confirm Payment";
      case "Payment Confirmed": return "Prepare Order";
      case "Preparing Order": return "Assign Driver";
      case "Driver Assigned": return "Ship Order";
      case "Shipped": return "Mark Delivered";
      default: return "Order Completed";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <MobileMenuButton />
            <Link href="/admin/orders" className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Order {orderId}</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C9956A]" />
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <MobileMenuButton />
            <Link href="/admin/orders" className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Order Not Found</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="font-sans text-sm text-[#8C8682]">Order {orderId} was not found in the database.</p>
        </main>
      </div>
    );
  }

  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const total = subtotal + order.delivery_fee;

  const statusOrder: OrderStatus[] = [
    "Pending Payment",
    "Awaiting Verification",
    "Payment Confirmed",
    "Preparing Order",
    "Driver Assigned",
    "Shipped",
    "Delivered",
  ];

  const currentIndex = statusOrder.indexOf(order.status);

  const timelineSteps: TimelineStep[] = statusOrder.map((s, i) => ({
    status: s,
    completed: i <= currentIndex,
  }));

  const statusBadgeColor: Record<string, string> = {
    "Pending Payment": "bg-gray-100 text-gray-600",
    "Awaiting Verification": "bg-orange-50 text-orange-600",
    "Payment Confirmed": "bg-emerald-50 text-emerald-600",
    "Preparing Order": "bg-yellow-50 text-yellow-600",
    "Driver Assigned": "bg-purple-50 text-purple-600",
    "Shipped": "bg-blue-50 text-blue-600",
    "Delivered": "bg-emerald-50 text-emerald-600",
  };

  const receiptVerified = currentIndex >= statusOrder.indexOf("Payment Confirmed");

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
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Order {order.id}</h1>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans ${statusBadgeColor[order.status] || "bg-gray-100 text-gray-600"}`}>
            {order.status}
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
                  <span className="font-semibold text-[#1C1512] font-sans">{order.customer_name}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#8C8682] font-sans">Phone</span>
                  <span className="font-semibold text-[#1C1512] font-sans">{order.phone}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#8C8682] font-sans">Email</span>
                  <span className="font-semibold text-[#1C1512] font-sans">{order.email}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50 md:col-span-2">
                  <span className="text-[#8C8682] font-sans">Address</span>
                  <span className="font-semibold text-[#1C1512] font-sans text-right">{order.address}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#8C8682] font-sans">State</span>
                  <span className="font-semibold text-[#1C1512] font-sans">{order.state}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#8C8682] font-sans">City</span>
                  <span className="font-semibold text-[#1C1512] font-sans">{order.city}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-sans text-base font-semibold text-[#1C1512]">Order Items</h2>
                <span className="font-sans text-xs text-[#8C8682]">{order.id}</span>
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
                    {order.items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center font-sans text-sm text-[#8C8682]">
                          No items found for this order.
                        </td>
                      </tr>
                    ) : (
                      order.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 font-semibold text-[#1C1512] font-sans whitespace-nowrap">{item.name}</td>
                          <td className="px-4 py-4 text-center font-sans whitespace-nowrap">{item.size}</td>
                          <td className="px-4 py-4 text-center font-sans whitespace-nowrap">{item.color}</td>
                          <td className="px-4 py-4 text-center font-semibold text-[#1C1512] font-sans whitespace-nowrap">{item.qty}</td>
                          <td className="px-4 py-4 text-right font-sans whitespace-nowrap">₦{item.price.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-semibold text-[#1C1512] font-sans whitespace-nowrap">₦{(item.price * item.qty).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
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
                  <span className="font-semibold text-[#1C1512]">₦{order.delivery_fee.toLocaleString()}</span>
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
                {order.status !== "Delivered" && (
                  <button
                    onClick={handleNextStatus}
                    disabled={updating}
                    className="px-3 py-1 bg-[#FAF7F2] hover:bg-[#C9956A]/10 border border-[#C9956A]/20 hover:border-[#C9956A]/40 text-[#C9956A] text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {updating && <Loader2 className="h-3 w-3 animate-spin" />}
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
                  <p className="font-sans text-xs text-[#8C8682]">
                    {order.receipt_uploaded_at
                      ? `Uploaded: ${new Date(order.receipt_uploaded_at).toLocaleString()}`
                      : "No receipt uploaded yet"}
                  </p>
                  <p className="font-sans text-sm font-semibold text-[#1C1512] truncate mt-0.5">
                    {order.receipt_url ? "Payment Receipt" : "—"}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {order.receipt_url ? (
                <a
                  href={order.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#C9956A] hover:bg-[#A87A52] text-white font-sans text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  View Full Receipt
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <div className="w-full py-2.5 bg-gray-100 text-gray-400 font-sans text-sm font-semibold rounded-xl text-center">
                  No Receipt Available
                </div>
              )}
            </div>

            {/* Delivery Assignment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-base font-semibold text-[#1C1512]">Delivery Assignment</h2>
                <button
                  onClick={() => {
                    setTempDriverName(order.driver_name || "");
                    setIsAssignModalOpen(true);
                  }}
                  className="px-3 py-1 bg-[#FAF7F2] border border-[#C9956A]/20 text-[#C9956A] hover:bg-[#C9956A]/10 text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="h-3 w-3" />
                  {order.driver_name ? "Change Driver" : "Assign Driver"}
                </button>
              </div>

              <div className="border border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center text-center">
                <Truck className="h-6 w-6 text-[#C9956A] mb-1.5" />
                {order.driver_name ? (
                  <div className="space-y-1">
                    <p className="font-sans text-sm font-semibold text-[#1C1512]">
                      {order.driver_name}
                    </p>
                    <p className="font-sans text-[11px] text-[#8C8682]">
                      Assigned to deliver this order.
                    </p>
                  </div>
                ) : (
                  <p className="font-sans text-xs text-[#8C8682]">
                    No driver assigned yet. Click "Assign Driver" to select one.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Assign Driver Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setIsAssignModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          />
          {/* Modal Content */}
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative z-10 border border-[#1C1512]/5">
            <div className="flex justify-center">
              <div className="p-3 bg-[#FAF7F2] rounded-full text-[#C9956A]">
                <Truck className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#1C1512]">
                Assign Delivery Driver
              </h3>
              <p className="font-sans text-xs text-[#8C8682]">
                Enter the name of the driver delivering this order.
              </p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAssignDriver(tempDriverName);
            }} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Driver Name (e.g. John Doe)"
                value={tempDriverName}
                onChange={(e) => setTempDriverName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
              />
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-50 border border-gray-200 text-[#1C1512] font-sans text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 bg-[#C9956A] text-white font-sans text-xs font-semibold rounded-xl hover:bg-[#A87A52] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {updating ? "Saving..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

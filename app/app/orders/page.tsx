
"use client";

import React, { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OrdersPage() {
  const orders = useMemo(
    () => [
      { id: "ORD-1001", date: "Oct 24, 2023", items: "Nike Air Max 90", status: "Delivered", total: "$120.00" },
      { id: "ORD-1002", date: "Nov 02, 2023", items: "Sony WH-1000XM5", status: "In Transit", total: "$348.00" },
      { id: "ORD-1003", date: "Nov 15, 2023", items: "Kindle Paperwhite", status: "Processing", total: "$139.00" },
    ],
    [],
  );

  const fetchEbayOrder = useAction(api.actions.ebayOrder.fetchOrder);
  const startEbayCheckout = useAction(api.actions.ebayOrder.createOrder);

  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const [checkoutItemId, setCheckoutItemId] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutFirstName, setCheckoutFirstName] = useState("");
  const [checkoutLastName, setCheckoutLastName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress1, setCheckoutAddress1] = useState("");
  const [checkoutAddress2, setCheckoutAddress2] = useState("");
  const [checkoutCity, setCheckoutCity] = useState("");
  const [checkoutState, setCheckoutState] = useState("");
  const [checkoutPostal, setCheckoutPostal] = useState("");
  const [checkoutCountry, setCheckoutCountry] = useState("US");
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  const doLookup = async () => {
    setLookupError(null);
    setLookupResult(null);
    const id = purchaseOrderId.trim();
    if (!id) return;

    setIsLookingUp(true);
    try {
      const res = await fetchEbayOrder({ purchaseOrderId: id, marketplaceId: "EBAY_US" });
      setLookupResult(res);
    } catch (e: unknown) {
      setLookupError(e instanceof Error ? e.message : "Failed to fetch order");
    } finally {
      setIsLookingUp(false);
    }
  };

  const doStartCheckout = async () => {
    setCheckoutError(null);
    setCheckoutResult(null);

    const itemId = checkoutItemId.trim();
    if (!itemId) return;
    if (!checkoutEmail.trim()) return;

    setIsStartingCheckout(true);
    try {
      const res = await startEbayCheckout({
        marketplaceId: "EBAY_US",
        contactEmail: checkoutEmail.trim(),
        lineItems: [{ itemId, quantity: 1 }],
        shippingAddress: {
          addressLine1: checkoutAddress1.trim(),
          addressLine2: checkoutAddress2.trim() ? checkoutAddress2.trim() : undefined,
          city: checkoutCity.trim(),
          stateOrProvince: checkoutState.trim() ? checkoutState.trim() : undefined,
          postalCode: checkoutPostal.trim() ? checkoutPostal.trim() : undefined,
          country: checkoutCountry.trim().toUpperCase(),
          phoneNumber: checkoutPhone.trim(),
          recipient: { firstName: checkoutFirstName.trim(), lastName: checkoutLastName.trim() },
        },
      });
      setCheckoutResult(res);
    } catch (e: unknown) {
      setCheckoutError(e instanceof Error ? e.message : "Failed to start checkout");
    } finally {
      setIsStartingCheckout(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold">My Orders</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold">eBay order lookup</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Enter a <span className="font-mono">purchaseOrderId</span> to fetch status (guest purchase orders).
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={purchaseOrderId}
              onChange={(e) => setPurchaseOrderId(e.target.value)}
              placeholder="purchaseOrderId"
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />
            <Button
              onClick={doLookup}
              disabled={isLookingUp || !purchaseOrderId.trim()}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              {isLookingUp ? "Loading…" : "Lookup"}
            </Button>
          </div>

          {lookupError ? <p className="text-sm text-red-400 mt-3">{lookupError}</p> : null}
          {lookupResult ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4 text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">Order</div>
                  <div className="font-mono text-indigo-300">{lookupResult.purchaseOrderId}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">Status</div>
                  <div className="text-white">{lookupResult.purchaseOrderStatus ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">Payment</div>
                  <div className="text-white">{lookupResult.purchaseOrderPaymentStatus ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">Total</div>
                  <div className="text-white">
                    {lookupResult.total?.value ? `${lookupResult.total.value} ${lookupResult.total.currency ?? ""}` : "—"}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Start eBay guest checkout (beta)</h2>
            <p className="text-xs text-zinc-400 mt-1">
              This uses eBay’s Order API guest checkout. Payment is handled by eBay (we do not collect card details).
            </p>
          </div>

          <div className="grid gap-3">
            <Input
              value={checkoutItemId}
              onChange={(e) => setCheckoutItemId(e.target.value)}
              placeholder="eBay REST itemId (e.g. v1|123|0)"
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />
            <Input
              value={checkoutEmail}
              onChange={(e) => setCheckoutEmail(e.target.value)}
              placeholder="Contact email"
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={checkoutFirstName}
                onChange={(e) => setCheckoutFirstName(e.target.value)}
                placeholder="First name"
                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              />
              <Input
                value={checkoutLastName}
                onChange={(e) => setCheckoutLastName(e.target.value)}
                placeholder="Last name"
                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              />
            </div>

            <Input
              value={checkoutPhone}
              onChange={(e) => setCheckoutPhone(e.target.value)}
              placeholder="Phone number (include country code if possible)"
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />

            <Input
              value={checkoutAddress1}
              onChange={(e) => setCheckoutAddress1(e.target.value)}
              placeholder="Address line 1"
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />
            <Input
              value={checkoutAddress2}
              onChange={(e) => setCheckoutAddress2(e.target.value)}
              placeholder="Address line 2 (optional)"
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                value={checkoutCity}
                onChange={(e) => setCheckoutCity(e.target.value)}
                placeholder="City"
                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              />
              <Input
                value={checkoutState}
                onChange={(e) => setCheckoutState(e.target.value)}
                placeholder="State/Province"
                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              />
              <Input
                value={checkoutPostal}
                onChange={(e) => setCheckoutPostal(e.target.value)}
                placeholder="Postal code"
                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              />
            </div>

            <Input
              value={checkoutCountry}
              onChange={(e) => setCheckoutCountry(e.target.value)}
              placeholder="Country (ISO2, e.g. US)"
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />

            <Button
              onClick={doStartCheckout}
              disabled={isStartingCheckout || !checkoutItemId.trim() || !checkoutEmail.trim()}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              {isStartingCheckout ? "Starting…" : "Create checkout session"}
            </Button>

            {checkoutError ? <p className="text-sm text-red-400">{checkoutError}</p> : null}
            {checkoutResult ? (
              <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">checkoutSessionId</div>
                <div className="font-mono text-indigo-300 break-all">{checkoutResult.checkoutSessionId}</div>
                {checkoutResult.securitySignature ? (
                  <>
                    <div className="text-[11px] uppercase tracking-wide text-zinc-500 mt-3 mb-1">
                      X-EBAY-SECURITY-SIGNATURE
                    </div>
                    <div className="font-mono text-zinc-200 break-all">{checkoutResult.securitySignature}</div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border border-white/10 rounded-xl bg-zinc-900/50 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 text-sm font-medium text-zinc-400">
          <div>Order ID</div>
          <div className="col-span-2">Items</div>
          <div>Date</div>
          <div className="text-right">Total</div>
        </div>

        {orders.length > 0 ? (
          <div className="divide-y divide-white/5">
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-5 gap-4 p-4 text-sm items-center hover:bg-white/5 transition-colors">
                <div className="font-mono text-indigo-400">{order.id}</div>
                <div className="col-span-2 font-medium">{order.items}</div>
                <div className="text-zinc-400">{order.date}</div>
                <div className="text-right font-medium">{order.total}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center">
             <Package className="h-12 w-12 text-zinc-600 mb-4" />
             <p className="text-zinc-400">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}






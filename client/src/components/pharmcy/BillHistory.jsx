import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

export default function BillHistory({ ownerId }) {
    const { getToken } = useAuth();

    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (!ownerId) return;
        const fetchBills = async () => {
            try {
                setLoading(true);
                setError("");
                const token = await getToken();
                const res = await axios.get("http://localhost:5000/api/pharmacyBill", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: { ownerId },
                });

                const raw = Array.isArray(res.data?.data) ? res.data.data : [];
                setBills(raw);
            } catch (err) {
                console.error("[BillHistory] fetch error", err.response?.data || err.message);
                setError("Failed to load bills");
                setBills([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, [ownerId, getToken]);

    const filteredBills = useMemo(() => {
        let list = bills;

        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            list = list.filter((bill) => {
                const customer = bill.customerName?.toLowerCase() || "";
                const phone = bill.customerPhone?.toLowerCase() || "";
                const id = String(bill._id || "").toLowerCase();
                const itemsText = (bill.items || [])
                    .map((i) => i.name || "")
                    .join(", ")
                    .toLowerCase();

                return (
                    customer.includes(s) ||
                    phone.includes(s) ||
                    id.includes(s) ||
                    itemsText.includes(s)
                );
            });
        }

        if (startDate) {
            const start = new Date(startDate);
            list = list.filter((bill) => {
                const d = new Date(bill.billDate || bill.createdAt);
                return d >= start;
            });
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            list = list.filter((bill) => {
                const d = new Date(bill.billDate || bill.createdAt);
                return d <= end;
            });
        }

        return list;
    }, [bills, searchTerm, startDate, endDate]);

    const formatDateTime = (value) => {
        if (!value) return "-";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const openPrintWindowForBills = (billsToPrint, title = "Pharmacy Bills") => {
        if (!billsToPrint || billsToPrint.length === 0) return;

        const htmlRows = billsToPrint
            .map((bill, index) => {
                const itemsHtml = (bill.items || [])
                    .map(
                        (item) => `
              <tr>
                <td>${item.name || ""}</td>
                <td>${item.quantity}</td>
                <td>${item.pricePerUnit}</td>
                <td>${item.lineTotal}</td>
              </tr>
            `
                    )
                    .join("");

                return `
          <div style="page-break-after: always; margin-bottom: 24px;">
            <h2 style="margin-bottom: 4px;">Bill #${index + 1}</h2>
            <p><strong>Bill ID:</strong> ${bill._id}</p>
            <p><strong>Date:</strong> ${formatDateTime(bill.billDate || bill.createdAt)} (${bill.day || ""})</p>
            <p><strong>Customer:</strong> ${bill.customerName || ""}</p>
            <p><strong>Phone:</strong> ${bill.customerPhone || ""}</p>
            <p><strong>Notes:</strong> ${bill.notes || ""}</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ccc; padding: 4px; text-align: left;">Medicine</th>
                  <th style="border: 1px solid #ccc; padding: 4px; text-align: left;">Qty</th>
                  <th style="border: 1px solid #ccc; padding: 4px; text-align: left;">Price</th>
                  <th style="border: 1px solid #ccc; padding: 4px; text-align: left;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <h3 style="margin-top: 12px;">Grand Total: ${bill.totalAmount}</h3>
          </div>
        `;
            })
            .join("");

        const win = window.open("", "_blank");
        if (!win) return;

        win.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px; }
            h1,h2,h3 { margin: 0 0 8px 0; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${htmlRows}
        </body>
      </html>
    `);
        win.document.close();
        win.focus();
        win.print();
    };

    const handleDownloadSingle = (bill) => {
        openPrintWindowForBills([bill], "Pharmacy Bill");
    };

    const handleDownloadFiltered = () => {
        openPrintWindowForBills(filteredBills, "Pharmacy Bills Report");
    };

    if (loading) {
        return <p className="text-sm">Loading bills...</p>;
    }

    if (error) {
        return <p className="text-sm text-red-500">{error}</p>;
    }

    return (
        <div className="space-y-4 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div className="space-y-2 w-full md:w-auto">
                    <label className="text-sm font-medium">Search Bills</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by customer, phone, bill id, or medicine"
                        className="w-full md:w-80 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface"
                    />
                </div>

                <div className="flex flex-wrap gap-3 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-dark-surface"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleDownloadFiltered}
                        disabled={filteredBills.length === 0}
                        className="px-4 py-2 rounded-md text-sm bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white hover:opacity-90 disabled:opacity-50"
                    >
                        Download Filtered as PDF
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 px-2">Date</th>
                            <th className="text-left py-2 px-2">Customer</th>
                            <th className="text-left py-2 px-2">Items</th>
                            <th className="text-left py-2 px-2">Total</th>
                            <th className="text-left py-2 px-2">Notes</th>
                            <th className="text-left py-2 px-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBills.map((bill) => {
                            const itemsText = (bill.items || [])
                                .map((i) => `${i.name} x${i.quantity}`)
                                .join(", ");

                            return (
                                <tr key={bill._id} className="border-b last:border-0">
                                    <td className="py-2 px-2">{formatDateTime(bill.billDate || bill.createdAt)}</td>
                                    <td className="py-2 px-2">{bill.customerName}</td>
                                    <td className="py-2 px-2 max-w-xs truncate" title={itemsText}>{itemsText}</td>
                                    <td className="py-2 px-2">₹{bill.totalAmount}</td>
                                    <td className="py-2 px-2 max-w-xs truncate" title={bill.notes}>{bill.notes}</td>
                                    <td className="py-2 px-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadSingle(bill)}
                                            className="text-indigo-600 hover:underline"
                                        >
                                            Download PDF
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredBills.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No bills found for the selected filters.</p>
            )}
        </div>
    );
}

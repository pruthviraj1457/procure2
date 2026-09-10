"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import {
  Send, Paperclip, MessageCircle, ChevronRight, Loader2,
  FileText, Receipt, X, Check
} from "lucide-react";
import { useRole } from "@/components/layout/RoleContext";
import type { Supplier } from "@/lib/standards/data/suppliers";

type Message = {
  id: string;
  senderRole: "officer" | "supplier";
  text: string;
  attachmentUrl?: string;
  sentAt: string;
};

type Quote = {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  warranty: string;
};

const QUICK_TEMPLATES = [
  "Please share the latest BIS certificate for this product.",
  "Is this certificate applicable to the exact model you are offering?",
  "Please confirm you can supply to [location] within [X] weeks.",
  "What is your warranty policy and after-sales support structure?",
];

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isOfficer } = useRole();
  const [messages, setMessages] = useState<Message[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    product: "",
    quantity: 100,
    unitPrice: 0,
    deliveryDays: 20,
    warranty: "12 months",
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
  }, [id]);

  async function loadConversation() {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();
      setMessages(data.conversation?.messages || []);
      setSupplier(data.supplier);
      setQuote(data.conversation?.quote || null);
      if (data.conversation?.requirement?.extractedJson) {
        const extracted = JSON.parse(data.conversation.requirement.extractedJson);
        setQuoteForm((prev) => ({
          ...prev,
          product: extracted.product || prev.product,
          quantity: extracted.quantity || prev.quantity,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(messageText: string = text) {
    if (!messageText.trim()) return;
    setSending(true);
    setText("");
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText, senderRole: isOfficer ? "officer" : "supplier" }),
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function submitQuote() {
    setSubmittingQuote(true);
    try {
      const res = await fetch(`/api/conversations/${id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteForm),
      });
      const data = await res.json();
      setQuote(data.quote);
      setShowQuoteForm(false);
      await loadConversation();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuote(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ maxHeight: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/history" className="hover:text-navy-800">History</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Conversation</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-navy-800">{supplier?.name || "Supplier"}</h1>
                <p className="text-xs text-slate-500">{supplier?.location} · {supplier?.businessType}</p>
              </div>
            </div>
            {isOfficer && !quote && (
              <button onClick={() => setShowQuoteForm(true)} className="btn btn-outline btn-sm">
                <Receipt className="w-4 h-4" />
                Request Quote
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {/* Quote card */}
          {quote && (
            <div className="card p-5 mb-6 border-2 border-accent-200 bg-accent-50 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-5 h-5 text-accent-600" />
                <h3 className="font-semibold text-navy-800">Quotation Received</h3>
                <span className="badge badge-verified ml-auto">Quote Submitted</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <QuoteField label="Product" value={quote.product} />
                <QuoteField label="Quantity" value={quote.quantity.toLocaleString("en-IN") + " units"} />
                <QuoteField label="Unit Price" value={"₹" + quote.unitPrice.toLocaleString("en-IN")} />
                <QuoteField label="Total Amount" value={"₹" + quote.totalPrice.toLocaleString("en-IN")} highlight />
                <QuoteField label="Delivery" value={quote.deliveryDays + " working days"} />
                <QuoteField label="Warranty" value={quote.warranty} />
              </div>
            </div>
          )}

          {/* Quick templates */}
          {isOfficer && messages.length <= 2 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick message templates</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(tmpl)}
                    className="chip text-xs text-left"
                  >
                    {tmpl.length > 60 ? tmpl.slice(0, 60) + "…" : tmpl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isOfficer={isOfficer} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {!isOfficer ? (
            <p className="text-sm text-slate-400 text-center py-2">
              Suppliers receive and reply to conversations. Officers initiate conversations.
            </p>
          ) : (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
                  rows={2}
                  className="input resize-none"
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={sending || !text.trim()}
                className="btn btn-primary p-3"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quote form modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-navy-800">Request Quotation</h2>
              <button onClick={() => setShowQuoteForm(false)} className="btn btn-ghost btn-sm p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Product</label>
                <input
                  className="input"
                  value={quoteForm.product}
                  onChange={(e) => setQuoteForm({ ...quoteForm, product: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Quantity</label>
                  <input
                    type="number"
                    className="input"
                    value={quoteForm.quantity}
                    onChange={(e) => setQuoteForm({ ...quoteForm, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={quoteForm.unitPrice}
                    onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Delivery (days)</label>
                  <input
                    type="number"
                    className="input"
                    value={quoteForm.deliveryDays}
                    onChange={(e) => setQuoteForm({ ...quoteForm, deliveryDays: parseInt(e.target.value) || 20 })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Warranty</label>
                  <input
                    className="input"
                    value={quoteForm.warranty}
                    onChange={(e) => setQuoteForm({ ...quoteForm, warranty: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowQuoteForm(false)} className="btn btn-ghost flex-1">Cancel</button>
              <button onClick={submitQuote} disabled={submittingQuote} className="btn btn-primary flex-1">
                {submittingQuote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Submit Quote Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, isOfficer }: { message: Message; isOfficer: boolean }) {
  const isMe = (message.senderRole === "officer" && isOfficer) ||
               (message.senderRole === "supplier" && !isOfficer);
  const time = new Date(message.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <div className="w-7 h-7 rounded-full bg-navy-800 flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      )}
      <div className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-3 ${
        isMe
          ? "bg-navy-800 text-white rounded-br-sm"
          : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
      }`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className={`text-xs mt-1.5 ${isMe ? "text-navy-300" : "text-slate-400"}`}>{time}</p>
      </div>
      {isMe && (
        <div className="w-7 h-7 rounded-full bg-accent-500 flex items-center justify-center ml-2 flex-shrink-0 self-end mb-1">
          <span className="text-white text-xs font-bold">O</span>
        </div>
      )}
    </div>
  );
}

function QuoteField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-accent-600 text-base" : "text-navy-800"}`}>{value}</p>
    </div>
  );
}

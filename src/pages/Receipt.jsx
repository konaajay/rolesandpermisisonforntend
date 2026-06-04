import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Share2, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import api from '../services/api';

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, compRes] = await Promise.all([
          api.get(`/api/vendor-invoices/${id}`),
          api.get('/company-profile')
        ]);
        setInvoice(invRes.data.data);
        setCompany(compRes.data);
      } catch (err) {
        console.error("Error fetching receipt data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading receipt...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-400">Receipt not found.</div>;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const element = document.getElementById('receipt-content');
    if (!element) return;

    const opt = {
      margin:       0.5,
      filename:     `Receipt_${invoice?.invoiceNumber || `INV-${4000 + invoice?.id}`}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Invoice Receipt',
          text: `Payment Receipt for ${invoice?.invoiceNumber || `INV-${4000 + invoice?.id}`}`,
        });
      } else {
        // Fallback: download the PDF if sharing files is not supported
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = opt.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error generating or sharing PDF', err);
      alert('Failed to share PDF. Your browser may not support file sharing.');
    }
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  return (
    <div className="min-h-screen bg-slate-950 p-4 font-sans print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto bg-white text-black shadow-2xl rounded-sm overflow-hidden print:shadow-none print:w-full print:max-w-none">
        
        {/* Receipt Content to Print */}
        <div id="receipt-content" className="p-8 print:p-0">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase tracking-widest border-b-2 border-black pb-2 inline-block">Online Payment Receipt</h1>
          </div>
          
          <div className="text-center mb-8">
            {company?.logoUrl && <img src={company.logoUrl} alt="Logo" className="h-12 mx-auto mb-2" />}
            <h2 className="text-lg font-bold uppercase text-indigo-700">{company?.companyName || 'Company Name'}</h2>
          </div>

          <div className="border border-black text-sm text-black">
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-2 border-r border-black">
                <span className="text-gray-600 font-medium">Requirement Number:</span> <span className="font-bold text-black ml-2">REQ-{invoice.requirementId || 'N/A'}</span>
              </div>
              <div className="p-2">
                <span className="text-gray-600 font-medium">Invoice Ref:</span> <span className="font-bold text-black ml-2">{invoice.invoiceNumber || `INV-${4000 + invoice.id}`}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-2 border-r border-black">
                <span className="text-gray-600 font-medium">Vendor Name:</span> <span className="font-bold text-black ml-2">{invoice.vendorName}</span>
              </div>
              <div className="p-2">
                <span className="text-gray-600 font-medium">Due Date:</span> <span className="font-bold text-black ml-2">{invoice.dueDate}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-2 border-r border-black">
                <span className="text-gray-600 font-medium">Receipt No:</span> <span className="font-bold text-black ml-2">{invoice.id}{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="p-2">
                <span className="text-gray-600 font-medium">Date Paid:</span> <span className="font-bold text-black ml-2">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 border-b border-black bg-gray-200 font-bold text-black text-center">
              <div className="col-span-1 p-2 border-r border-black">S.NO</div>
              <div className="col-span-8 p-2 border-r border-black text-left">ACCOUNT HEAD</div>
              <div className="col-span-3 p-2">AMOUNT</div>
            </div>

            {/* Table Body */}
            <div className="grid grid-cols-12 border-b border-black min-h-[150px] text-black">
              <div className="col-span-1 p-2 border-r border-black text-center font-bold">1</div>
              <div className="col-span-8 p-2 border-r border-black">
                <div className="font-bold text-black mb-2">Payment for {invoice.notes || 'Procurement Services'}</div>
                <div className="text-xs text-gray-700 leading-tight font-medium">
                  <p>Billing Invoicer: {company?.companyName}</p>
                  <p>Address: {company?.addressLine1} {company?.city} {company?.state} {company?.pincode}</p>
                  <p>GSTIN: {company?.gstNumber}</p>
                </div>
              </div>
              <div className="col-span-3 p-2 text-right font-bold text-black">
                {formatCurrency(invoice.amountPaid || invoice.amountValue)}
              </div>
            </div>

            {/* Total */}
            <div className="grid grid-cols-12 border-b border-black text-black">
              <div className="col-span-9 p-2 border-r border-black text-right font-black">Total :</div>
              <div className="col-span-3 p-2 text-right font-black">
                {formatCurrency(invoice.amountPaid || invoice.amountValue)}
              </div>
            </div>
          </div>

          <div className="border border-black mt-4 p-2 text-xs flex justify-between text-gray-600 font-medium">
            <span>*Terms & Conditions Apply</span>
            <span>*Payment subject to realization</span>
          </div>

          <div className="border border-black border-t-0 p-2 text-xs text-center font-bold text-black">
            This is a Computer Generated Receipt. No signature is Required. Generated On. {new Date().toLocaleString()}
          </div>

          {/* Account Summary Ledger */}
          <div className="mt-8 border border-black text-sm text-center text-black">
            <div className="bg-gray-200 border-b border-black p-1 font-black uppercase text-xs text-black">
              ACCOUNT SUMMARY (LEDGER)
            </div>
            <div className="grid grid-cols-3">
              <div className="p-2 border-r border-black flex justify-between font-medium">
                <span className="text-gray-700">Total Amount:</span>
                <span className="font-bold text-black">{formatCurrency(invoice.amountValue)}</span>
              </div>
              <div className="p-2 border-r border-black flex justify-between font-medium">
                <span className="text-gray-700">Paid So Far:</span>
                <span className="font-bold text-green-700">{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="p-2 flex justify-between font-medium">
                <span className="text-gray-700">Balance Due:</span>
                <span className="font-bold text-red-600">{formatCurrency(invoice.amountPending)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden on print) */}
        <div className="bg-slate-100 p-4 flex justify-center gap-4 print:hidden border-t border-gray-200">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-semibold transition-colors">
            <Printer size={18} /> PRINT
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 bg-slate-300 hover:bg-slate-400 text-slate-800 px-6 py-2 rounded-full font-semibold transition-colors">
            <Share2 size={18} /> SHARE
          </button>
          <button onClick={() => window.close()} className="flex items-center gap-2 bg-slate-300 hover:bg-slate-400 text-slate-800 px-6 py-2 rounded-full font-semibold transition-colors">
            <X size={18} /> CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

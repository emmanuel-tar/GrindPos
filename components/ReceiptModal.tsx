import React from 'react';
import { Order, Location, AppSettings } from '../types';
import { X, Printer, Download, Check, Wifi, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  location: Location;
  settings?: AppSettings;
  isOpen: boolean;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, location, settings, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const template = settings?.receiptTemplate;
  const currencySymbol = order.currencySymbol || settings?.taxAndCurrency?.currencySymbol || '₦';
  const company = settings?.company;
  const isNarrow = template?.paperWidth === '58mm';
  const effectiveTaxRate = settings?.taxAndCurrency?.defaultTaxRate !== undefined
    ? settings.taxAndCurrency.defaultTaxRate
    : location.taxRate;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200 ${
        isNarrow ? 'max-w-xs' : 'max-w-md'
      } w-full`}>
        {/* Modal Controls Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Customer Digital Check</span>
            {template?.paperWidth && (
              <span className="text-[10px] bg-slate-800 text-orange-400 px-2 py-0.5 rounded font-mono font-bold">
                {template.paperWidth}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Realistic Thermal Receipt Body */}
        <div className="p-6 overflow-y-auto bg-[#faf8f5] font-mono text-xs text-slate-800 flex-1 space-y-4">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-4">
            {template?.showLogo && company?.logoUrl && (
              <img
                src={company.logoUrl}
                alt="Brand Logo"
                className="w-12 h-12 object-cover mx-auto rounded-full mb-2"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            )}
            <h2 className="text-base font-black tracking-wider uppercase text-slate-900">
              {company?.name || location.name}
            </h2>
            <p className="text-[11px] text-slate-600">{company?.address || location.address}</p>
            <p className="text-[11px] text-slate-600">Tel: {company?.phone || location.phone}</p>
            {company?.taxId && (
              <p className="text-[10px] text-slate-500">VAT/TIN: {company.taxId}</p>
            )}

            {template?.headerText && (
              <p className="text-[10px] font-bold text-slate-800 pt-1 uppercase">
                {template.headerText}
              </p>
            )}

            <div className="pt-2 text-[10px] text-slate-500">
              <span>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>
            
            <div className="font-bold text-slate-900 pt-1">
              {(template ? template.showTableNumber : true) && (
                <span>{order.orderType === 'dine_in' ? `TABLE #${order.tableNumber || 1}` : order.orderType.toUpperCase()}</span>
              )}
              {(template ? template.showServerName : true) && order.serverName && (
                <span> | SVR: {order.serverName.toUpperCase()}</span>
              )}
            </div>
            {(template ? template.showOrderNumber : true) && (
              <div className="text-[11px] text-slate-700">TICKET #{order.orderNumber || order.id.slice(-5).toUpperCase()}</div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-4">
            <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-1">
              <span>ITEM</span>
              <span>TOTAL</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-bold">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="pl-4 text-[10px] text-slate-500">
                    {item.modifiers.map((m, mIdx) => (
                      <div key={mIdx}>+ {m.optionName} {m.priceDelta > 0 ? `(${currencySymbol}${m.priceDelta.toFixed(2)})` : ''}</div>
                    ))}
                  </div>
                )}
                {item.notes && (
                  <div className="pl-4 text-[10px] text-orange-700 italic">
                    Note: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-4">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>{currencySymbol}{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>DISCOUNT ({order.discountCode || 'PROMO'}):</span>
                <span>-{currencySymbol}{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {(template ? template.showItemizedTax : true) && (
              <div className="flex justify-between">
                <span>VAT ({(effectiveTaxRate * 100).toFixed(1)}%):</span>
                <span>{currencySymbol}{order.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
              <span>TOTAL DUE:</span>
              <span>{currencySymbol}{order.total.toFixed(2)}</span>
            </div>
            {order.foreignTotalAmount && order.currencyCode && order.currencyCode !== 'NGN' && (
              <div className="flex justify-between text-[11px] text-emerald-800 font-bold bg-emerald-50 p-1.5 rounded">
                <span>FX SETTLEMENT ({order.currencyCode}):</span>
                <span>{order.currencySymbol || '$'}{order.foreignTotalAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] text-slate-600 pt-1">
              <span>PAYMENT METHOD:</span>
              <span className="uppercase font-bold">{order.paymentMethod || 'CARD'}</span>
            </div>
          </div>

          {/* Footer & Wi-Fi & Barcode Simulation */}
          <div className="text-center space-y-2.5 pt-2">
            <p className="text-[11px] font-bold text-slate-700">
              {template?.footerMessage || 'THANK YOU FOR DINING WITH US!'}
            </p>
            
            {template?.showWifiInfo && (template.wifiSsid || template.wifiPassword) && (
              <div className="text-[10px] bg-slate-200/50 p-2 rounded-xl text-slate-600 space-y-0.5">
                <div>📶 Wi-Fi: <strong>{template.wifiSsid}</strong></div>
                {template.wifiPassword && <div>Passcode: <strong>{template.wifiPassword}</strong></div>}
              </div>
            )}

            {(template ? template.showBarcode : true) && (
              <div className="pt-2 flex flex-col items-center">
                <div className="h-8 w-44 bg-slate-900 flex items-center justify-around px-2">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-6 bg-white ${i % 3 === 0 ? 'w-1.5' : i % 2 === 0 ? 'w-0.5' : 'w-1'}`}
                    />
                  ))}
                </div>
                <span className="text-[9px] tracking-widest text-slate-400 mt-1">*{order.id}*</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;

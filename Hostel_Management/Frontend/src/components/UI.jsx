import { X, AlertTriangle, Loader2 } from 'lucide-react';
import React from 'react';


// ─────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────
export const Spinner = ({ size = 20, className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2
      size={size}
      className="animate-spin text-blue-600"
    />
  </div>
);


// ─────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────
const badgeStyles = {
  active:       'bg-green-100 text-green-800',
  available:    'bg-green-100 text-green-800',
  paid:         'bg-green-100 text-green-800',
  resolved:     'bg-green-100 text-green-800',

  inactive:     'bg-slate-100 text-slate-600',
  vacated:      'bg-slate-100 text-slate-600',
  general:      'bg-slate-100 text-slate-600',

  occupied:     'bg-blue-100 text-blue-800',
  in_progress:  'bg-blue-100 text-blue-800',
  confirmed:    'bg-blue-100 text-blue-800',

  pending:      'bg-yellow-100 text-yellow-800',
  open:         'bg-yellow-100 text-yellow-800',
  maintenance:  'bg-yellow-100 text-yellow-800',

  overdue:      'bg-red-100 text-red-800',
  urgent:       'bg-red-100 text-red-800',
  high:         'bg-red-100 text-red-800',

  medium:       'bg-orange-100 text-orange-800',
  low:          'bg-slate-100 text-slate-600',
  event:        'bg-purple-100 text-purple-800',
};

export const Badge = ({ status, label }) => {
  const style = badgeStyles[status] || 'bg-slate-100 text-slate-600';
  const text = label || status?.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {text}
    </span>
  );
};


// ─────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">

      <div className="relative w-full max-w-md mx-4">

        {/* CARD */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-2xl shadow-2xl border border-slate-800 p-6">

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>

          {/* TITLE */}
          <h2 className="text-xl font-semibold text-white mb-5">
            {title}
          </h2>

          {/* CONTENT */}
          <div className="space-y-4">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 fade-in">

        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner size={14} className="" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────
export const EmptyState = ({ icon: Icon, message = 'No records found' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
    {Icon && <Icon size={40} strokeWidth={1.2} />}
    <p className="text-sm">{message}</p>
  </div>
);


// ─────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────
export const StatCard = ({ title, value, icon, color = 'blue', change, subtitle }) => {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-100' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-100' },
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
  };
  const c = colorMap[color] || colorMap.blue;

  const renderIcon = () => {
  if (!icon) return null;
  
  if (React.isValidElement(icon)) return icon;
  
  const Icon = icon;
  return <Icon className={`w-6 h-6 ${c.icon}`} />;
};

  return (
    <div className={`bg-white rounded-xl border ${c.border} p-5 flex items-start gap-4 shadow-sm`}>
      <div className={`${c.bg} p-3 rounded-lg flex-shrink-0`}>
        {renderIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {(change !== undefined || subtitle) && (
          <p className="text-xs text-gray-400 mt-1">{change ?? subtitle}</p>
        )}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────
// FORM ROW (2 columns)
// ─────────────────────────────────────────
export const FormRow = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
);


// ─────────────────────────────────────────
// FORM GROUP
// ─────────────────────────────────────────
export const FormGroup = ({ label, children, required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-slate-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);


// ─────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────
export const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none
      focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400
      bg-white text-slate-800 transition ${className}`}
    {...props}
  />
);


// ─────────────────────────────────────────
// SELECT
// ─────────────────────────────────────────
export const Select = ({ className = '', children, ...props }) => (
  <select
    className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none
      focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800
      cursor-pointer transition ${className}`}
    {...props}
  >
    {children}
  </select>
);


// ─────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────
export const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-150
        ${sizes[size]}
        ${variant === 'custom' ? '' : variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
    {children}
  </div>
);

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-2">{children}</div>}
  </div>
);

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  const colors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    occupied: 'bg-blue-100 text-blue-700',
    available: 'bg-green-100 text-green-700',
    maintenance: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700',
    open: 'bg-red-100 text-red-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
  };
  const color = colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
      {status}
    </span>
  );
};
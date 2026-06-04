import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, CreditCard, Receipt, Shield, Mail, Database,
  Smile, LogIn, ChevronRight, Plus, Check, AlertCircle,
  Smartphone, Lock, FileText, Bell, Users, Key, Layout,
  Trash2
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Settings.css';

// --- Hooks ---
const usePersistentState = (key, initialValue) => {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [key, state]);

  return [state, setState];
};

const Settings = () => {
  const [activeModule, setActiveModule] = useState('platform');

  // --- State Management ---
  const [domainSettings, setDomainSettings] = usePersistentState('lms_settings_domain', {
    customDomain: '',
    cloudflare: false
  });

  const [paymentSettings, setPaymentSettings] = usePersistentState('lms_settings_payment', {
    currency: 'USD ($)',
    taxType: 'None',
    foreignPricing: false,
    taxId: '',
    bankAccount: '',
    ifsc: ''
  });

  const [taxSettings, setTaxSettings] = usePersistentState('lms_settings_tax', {
    enableInvoices: true,
    legalName: '',
    taxIdLabel: 'GSTIN',
    address: '',
    prefix: 'INV-',
    serial: 1001,
    footerNote: ''
  });

  const [securitySettings, setSecuritySettings] = usePersistentState('lms_settings_security', {
    maxDevices: 2,
    watermarking: true,
    showEmail: true,
    showPhone: true,
    showIp: false,
    admin2fa: false
  });

  const [authSettings, setAuthSettings] = usePersistentState('lms_settings_auth', {
    googleLogin: true,
    passwordPolicy: 'Standard',
    doubleOptIn: false
  });

  const [commSettings, setCommSettings] = usePersistentState('lms_settings_comm', {
    senderName: 'LMS Academy Team',
    replyTo: ''
  });

  const [uxSettings, setUxSettings] = usePersistentState('lms_settings_ux', {
    verification: true,
    communication: true,
    welcomeMessage: ''
  });

  const [customFields, setCustomFields] = usePersistentState('lms_settings_fields', [
    { id: 'mobile', label: 'Mobile Number', type: 'Mandatory', icon: 'smartphone' }
  ]);

  // --- Methods ---
  const updateState = (setter) => (key, value) => {
    setter(prev => ({ ...prev, [key]: value }));
  };

  const handleAddCustomField = () => {
    const label = prompt("Enter Field Name (e.g. Date of Birth):");
    if (label) {
      setCustomFields(prev => [...prev, { id: Date.now(), label, type: 'Text', icon: 'file' }]);
      toast.success("Custom field added!");
    }
  };

  const handleRemoveCustomField = (id) => {
    if (window.confirm("Delete this field?")) {
      setCustomFields(prev => prev.filter(f => f.id !== id));
      toast.info("Field removed");
    }
  };

  // Define Module Structure
  const modules = [
    { id: 'platform', label: 'Platform Setup', icon: <Globe size={18} /> },
    { id: 'security', label: 'Security & Controls', icon: <Shield size={18} /> },
    { id: 'users', label: 'User & Communication', icon: <Users size={18} /> }
  ];

  const renderContent = () => {
    switch (activeModule) {
      case 'platform':
        return (
          <div className="d-flex flex-column gap-5">
            <DomainSettings data={domainSettings} update={updateState(setDomainSettings)} />
            <PaymentSettings data={paymentSettings} update={updateState(setPaymentSettings)} />
            <TaxSettings data={taxSettings} update={updateState(setTaxSettings)} />
          </div>
        );
      case 'security':
        return (
          <div className="d-flex flex-column gap-5">
            <SecuritySettings data={securitySettings} update={updateState(setSecuritySettings)} />
            <SignupSettings data={authSettings} update={updateState(setAuthSettings)} />
          </div>
        );
      case 'users':
        return (
          <div className="d-flex flex-column gap-5">
            <CommunicationSettings data={commSettings} update={updateState(setCommSettings)} />
            <UXSettings data={uxSettings} update={updateState(setUxSettings)} />
            <CustomFieldsSettings
              fields={customFields}
              onAdd={handleAddCustomField}
              onRemove={handleRemoveCustomField}
            />
          </div>
        );
      default: return <DomainSettings data={domainSettings} update={updateState(setDomainSettings)} />;
    }
  };

  return (
    <div className="settings-container">
      <ToastContainer position="bottom-right" theme="colored" />

      {/* 1. Top Level Module Navigation */}
      <div className="settings-nav-wrapper">
        <div className="settings-nav justify-content-center">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`nav-item px-4 py-3 ${activeModule === module.id ? 'active' : ''}`}
            >
              <span className="d-flex align-items-center gap-2 text-sm font-bold uppercase tracking-wide">
                {module.icon} {module.label}
              </span>
              {activeModule === module.id && (
                <motion.div
                  layoutId="activeModuleIndicator"
                  className="position-absolute bottom-0 start-0 w-100 h-1 bg-indigo-500 rounded-top"
                  style={{ height: '3px' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="settings-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* --- Sub-Components --- */

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="card-header">
    <div className={`card-icon text-indigo-600 bg-indigo-50 bg-opacity-10`}>
      {icon}
    </div>
    <div>
      <h3 className="card-title">{title}</h3>
      <p className="card-subtitle">{subtitle}</p>
    </div>
  </div>
);

const DomainSettings = ({ data, update }) => (
  <div className="settings-card">
    <SectionHeader
      icon={<Globe size={24} />}
      title="Domain Management"
      subtitle="Manage your academy's web address and custom domains."
    />

    <div className="row g-4">
      <div className="col-md-6">
        <label className="input-label">Default Subdomain</label>
        <div className="d-flex gap-2">
          <input type="text" className="input-field" defaultValue="my-academy" readOnly />
          <div className="d-flex align-items-center bg-slate-100 px-3 rounded text-muted font-monospace">.lms.com</div>
        </div>
        <p className="helper-text">Your permanent free address.</p>
      </div>

      <div className="col-12 section-divider" />

      <div className="col-md-8">
        <label className="input-label">Custom Domain</label>
        <div className="input-group-custom">
          <input
            type="text"
            className="input-field"
            placeholder="www.your-academy.com"
            value={data.customDomain}
            onChange={(e) => update('customDomain', e.target.value)}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
          <h5 className="font-bold text-blue-800 text-sm mb-2 d-flex align-items-center gap-2">
            <AlertCircle size={16} /> DNS Configuration Required
          </h5>
          <p className="text-sm text-blue-700 mb-2">To connect your domain, add the following CNAME record to your DNS provider:</p>
          <div className="bg-white p-3 rounded border border-blue-200 font-monospace text-xs d-flex justify-content-between">
            <span>CNAME &nbsp; @ &nbsp; domains.lms.com</span>
            <button className="text-blue-600 font-bold" onClick={() => { navigator.clipboard.writeText('domains.lms.com'); toast.success("Copied to clipboard!"); }}>Copy</button>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <ToggleSwitch
            checked={data.cloudflare}
            onChange={(val) => update('cloudflare', val)}
          />
          <span className="text-sm font-medium">I use Cloudflare proxy</span>
        </div>
      </div>

      <div className="col-12 d-flex justify-content-end mt-4">
        <button className="btn-primary" onClick={() => toast.success("Domain configuration saved.")}>Verify & Save</button>
      </div>
    </div>
  </div>
);

const PaymentSettings = ({ data, update }) => (
  <>
    <div className="settings-card">
      <SectionHeader icon={<CreditCard size={24} />} title="Currency & Tax" subtitle="Set your primary currency and tax rules." />
      <div className="row g-4">
        <div className="col-md-6">
          <label className="input-label">Base Currency</label>
          <select className="select-field" value={data.currency} onChange={(e) => update('currency', e.target.value)}>
            <option>USD ($)</option>
            <option>INR (₹)</option>
            <option>EUR (€)</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="input-label">Tax Type</label>
          <select className="select-field" value={data.taxType} onChange={(e) => update('taxType', e.target.value)}>
            <option>GST (India)</option>
            <option>VAT (EU)</option>
            <option>Sales Tax (US)</option>
            <option>None</option>
          </select>
        </div>
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="font-bold text-slate-700">Foreign Currency Pricing</span>
              <p className="text-xs text-muted m-0">Automatically convert prices based on learner location.</p>
            </div>
            <ToggleSwitch checked={data.foreignPricing} onChange={(val) => update('foreignPricing', val)} />
          </div>
        </div>
      </div>
    </div>

    <div className="settings-card">
      <SectionHeader icon={<Users size={24} />} title="Verification" subtitle="Compliance details for payouts." />
      <div className="row g-4">
        <div className="col-md-6">
          <label className="input-label">Tax ID / PAN Number</label>
          <input type="text" className="input-field" placeholder="ABCDE1234F" value={data.taxId} onChange={(e) => update('taxId', e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="input-label">Bank Account Number</label>
          <input type="password" className="input-field" placeholder="•••• •••• •••• 1234" value={data.bankAccount} onChange={(e) => update('bankAccount', e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="input-label">IFSC / Swift Code</label>
          <input type="text" className="input-field" placeholder="HDFC0001234" value={data.ifsc} onChange={(e) => update('ifsc', e.target.value)} />
        </div>
        <div className="col-12 text-end">
          <button className="btn-secondary" onClick={() => toast.info("Verification details submitted for review.")}>Submit for Verification</button>
        </div>
      </div>
    </div>
  </>
);

const TaxSettings = ({ data, update }) => (
  <div className="settings-card">
    <SectionHeader icon={<Receipt size={24} />} title="Invoicing" subtitle="Customize your invoice appearance and details." />

    <div className="d-flex align-items-center justify-content-between mb-4">
      <span className="font-bold">Enable Invoices</span>
      <ToggleSwitch checked={data.enableInvoices} onChange={(val) => update('enableInvoices', val)} />
    </div>

    {data.enableInvoices && (
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="row g-4 overflow-hidden">
        <div className="col-md-6">
          <label className="input-label">Company Legal Name</label>
          <input className="input-field" placeholder="Acme Corp Pvt Ltd" value={data.legalName} onChange={(e) => update('legalName', e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="input-label">Tax ID Label</label>
          <input className="input-field" value={data.taxIdLabel} onChange={(e) => update('taxIdLabel', e.target.value)} />
        </div>
        <div className="col-md-12">
          <label className="input-label">Address on Invoice</label>
          <textarea className="input-field" rows={3} placeholder="123 Business Park..." value={data.address} onChange={(e) => update('address', e.target.value)} />
        </div>

        <div className="col-12 section-divider" />

        <div className="col-md-4">
          <label className="input-label">Invoice Prefix</label>
          <input className="input-field" value={data.prefix} onChange={(e) => update('prefix', e.target.value)} />
        </div>
        <div className="col-md-4">
          <label className="input-label">Starting Serial Number</label>
          <input className="input-field" type="number" value={data.serial} onChange={(e) => update('serial', e.target.value)} />
        </div>

        <div className="col-12">
          <label className="input-label">Footer Note</label>
          <input className="input-field" placeholder="Thank you for your business!" value={data.footerNote} onChange={(e) => update('footerNote', e.target.value)} />
        </div>
      </motion.div>
    )}
    <div className="mt-4 text-end">
      <button className="btn-primary" onClick={() => toast.success("Invoice settings updated")}>Save Changes</button>
    </div>
  </div>
);

const SecuritySettings = ({ data, update }) => (
  <div className="settings-card">
    <SectionHeader icon={<Shield size={24} />} title="Content Security" subtitle="Protect your intellectual property." />

    <div className="mb-5">
      <h5 className="font-bold text-slate-800 mb-3 text-sm">Access Limits</h5>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label className="input-label mb-3">Max Login Devices</label>
        <div className="d-flex align-items-center gap-3">
          <input
            type="range"
            className="form-range flex-grow-1"
            min="1" max="5"
            value={data.maxDevices}
            onChange={(e) => update('maxDevices', e.target.value)}
          />
          <span className="font-bold bg-white px-3 py-1 rounded border shadow-sm w-12 text-center">{data.maxDevices}</span>
        </div>
        <p className="helper-text mt-2">Learners will be logged out of other devices if they exceed this limit.</p>
      </div>
    </div>

    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="font-bold text-slate-800 m-0 text-sm">Dynamic Watermarking</h5>
          <p className="text-xs text-muted m-0">Overlay learner details on PDF and Video content.</p>
        </div>
        <ToggleSwitch checked={data.watermarking} onChange={(val) => update('watermarking', val)} />
      </div>

      {data.watermarking && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row g-3">
          <div className="col-md-6">
            <div className="form-check cursor-pointer" onClick={() => update('showEmail', !data.showEmail)}>
              <input className="form-check-input cursor-pointer" type="checkbox" checked={data.showEmail} readOnly />
              <label className="text-sm cursor-pointer">Show Learner Email</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check cursor-pointer" onClick={() => update('showPhone', !data.showPhone)}>
              <input className="form-check-input cursor-pointer" type="checkbox" checked={data.showPhone} readOnly />
              <label className="text-sm cursor-pointer">Show Learner Phone</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check cursor-pointer" onClick={() => update('showIp', !data.showIp)}>
              <input className="form-check-input cursor-pointer" type="checkbox" checked={data.showIp} readOnly />
              <label className="text-sm cursor-pointer">Show IP Address</label>
            </div>
          </div>
        </motion.div>
      )}
    </div>

    <div className="section-divider" />

    <div className="d-flex justify-content-between align-items-center">
      <div>
        <h5 className="font-bold text-slate-800 m-0 text-sm">Admin 2FA</h5>
        <p className="text-xs text-muted m-0">Require OTP for admin login.</p>
      </div>
      <ToggleSwitch checked={data.admin2fa} onChange={(val) => update('admin2fa', val)} />
    </div>
  </div>
);

const SignupSettings = ({ data, update }) => (
  <div className="settings-card">
    <SectionHeader icon={<LogIn size={24} />} title="Auth Configuration" subtitle="Manage how users access your platform." />

    <div className="bg-white border rounded-xl p-4 mb-4 shadow-sm border-slate-200">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="24" alt="Google" />
          <span className="font-bold text-slate-700">Google Login</span>
        </div>
        <ToggleSwitch checked={data.googleLogin} onChange={(val) => update('googleLogin', val)} />
      </div>
      <p className="text-xs text-muted m-0">Allow users to sign up and log in using their Google account.</p>
    </div>

    <div className="mb-4">
      <label className="input-label">Password Policy</label>
      <select className="select-field" value={data.passwordPolicy} onChange={(e) => update('passwordPolicy', e.target.value)}>
        <option>Standard (Min 6 chars)</option>
        <option>Strong (Min 8 chars, 1 Special, 1 Number)</option>
        <option>Strict (Min 12 chars, Mixed Case, Special)</option>
      </select>
    </div>

    <div className="d-flex justify-content-between align-items-center">
      <div>
        <h5 className="font-bold text-sm">Double Opt-in</h5>
        <p className="text-xs text-muted">Send confirmation email before creating account.</p>
      </div>
      <ToggleSwitch checked={data.doubleOptIn} onChange={(val) => update('doubleOptIn', val)} />
    </div>

    <div className="col-12 d-flex justify-content-end mt-5">
      <button className="btn-primary px-4" onClick={() => toast.success("Auth settings updated")}>Save Configuration</button>
    </div>
  </div>
);

const CommunicationSettings = ({ data, update }) => (
  <>
    <div className="settings-card">
      <SectionHeader icon={<Mail size={24} />} title="Email Settings" subtitle="Configure sender details and notifications." />
      <div className="row g-4">
        <div className="col-md-6">
          <label className="input-label">Sender Name</label>
          <input className="input-field" value={data.senderName} onChange={(e) => update('senderName', e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="input-label">Reply-To Email</label>
          <input className="input-field" type="email" placeholder="support@lms.com" value={data.replyTo} onChange={(e) => update('replyTo', e.target.value)} />
        </div>
        <div className="col-12 text-end">
          <button className="btn-primary" onClick={() => toast.success("Email settings saved")}>Save Changes</button>
        </div>
      </div>
    </div>

    <div className="settings-card">
      <SectionHeader icon={<FileText size={24} />} title="Notification Templates" subtitle="Manage automated emails sent to learners." />
      <div className="d-flex flex-column gap-3">
        {[
          "Wecome Email - New Signups",
          "Purchase Receipt - Course Bought",
          "Forgot Password - Recovery",
          "Live Class Reminder - 1 Hour Before"
        ].map((template, idx) => (
          <div key={idx} className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-lg hover:shadow-sm transition-all cursor-pointer" onClick={() => toast.info(`Editing template: ${template}`)}>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded text-indigo-600"><Mail size={16} /></div>
              <span className="font-medium text-sm text-slate-700">{template}</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>
        ))}
      </div>
    </div>
  </>
);

const UXSettings = ({ data, update }) => (
  <div className="settings-card">
    <SectionHeader icon={<Layout size={24} />} title="Learner Experience" subtitle="Controls for learner interface and permissions." />

    <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
      <div>
        <h5 className="font-bold text-sm">Account Verification</h5>
        <p className="text-xs text-muted">Require email verification before access.</p>
      </div>
      <ToggleSwitch checked={data.verification} onChange={(val) => update('verification', val)} />
    </div>

    <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
      <div>
        <h5 className="font-bold text-sm">Learner Communication</h5>
        <p className="text-xs text-muted">Allow students to message instructors.</p>
      </div>
      <ToggleSwitch checked={data.communication} onChange={(val) => update('communication', val)} />
    </div>

    <div>
      <label className="input-label mb-2">Custom Welcome Message (Dashboard)</label>
      <textarea
        className="input-field"
        rows={3}
        placeholder="Welcome to the best learning platform..."
        value={data.welcomeMessage}
        onChange={(e) => update('welcomeMessage', e.target.value)}
      />
    </div>
    <div className="mt-4 text-end">
      <button className="btn-primary" onClick={() => toast.success("UX settings updated")}>Save Changes</button>
    </div>
  </div>
);

const CustomFieldsSettings = ({ fields, onAdd, onRemove }) => (
  <div className="settings-card">
    <SectionHeader icon={<Database size={24} />} title="Custom User Fields" subtitle="Collect extra data during signup." />

    {fields.map(field => (
      <div key={field.id} className={`p-4 rounded-xl mb-3 d-flex justify-content-between align-items-center ${field.type === 'Mandatory' ? 'bg-orange-50 border border-orange-100' : 'bg-white border'}`}>
        <div className="d-flex gap-3 align-items-center">
          <div className={`${field.type === 'Mandatory' ? 'text-orange-500' : 'text-slate-400'}`}>
            {field.id === 'mobile' ? <Smartphone size={20} /> : <FileText size={20} />}
          </div>
          <div>
            <h6 className={`font-bold m-0 text-sm ${field.type === 'Mandatory' ? 'text-orange-800' : 'text-slate-700'}`}>{field.label}</h6>
            <p className={`text-xs m-0 mt-1 ${field.type === 'Mandatory' ? 'text-orange-700' : 'text-muted'}`}>
              {field.type === 'Mandatory' ? 'Mandatory for security' : 'Optional field'}
            </p>
          </div>
        </div>
        {field.type !== 'Mandatory' && (
          <button className="btn-icon text-red-500 hover:bg-red-50 rounded-full p-2" onClick={() => onRemove(field.id)}><Trash2 size={16} /></button>
        )}
      </div>
    ))}

    <div
      className="text-center p-5 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer mt-4"
      onClick={onAdd}
    >
      <div className="bg-slate-100 p-3 rounded-full d-inline-flex mb-3">
        <Plus size={24} className="text-slate-400" />
      </div>
      <h6 className="font-bold text-slate-600">Add Custom Field</h6>
      <p className="text-xs text-muted">e.g. Date of Birth, Tax ID, Company</p>
    </div>
  </div>
);

/* Helper Component: Controlled Toggle Switch */
const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <div
      className={`toggle-switch ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <div className="toggle-thumb" />
    </div>
  );
};

export default Settings;
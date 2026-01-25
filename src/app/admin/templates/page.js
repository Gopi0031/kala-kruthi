"use client";

import { useState } from "react";

/* =========================
   INLINE SCHEMAS
========================= */
const weddingSchema = {
  brideName: "",
  groomName: "",
  weddingDate: "",
  venue: "",
  contactNumber: "",
};

const preWeddingSchema = {
  coupleName: "",
  shootDate: "",
  location: "",
};

const portraitSchema = {
  clientName: "",
  shootDate: "",
};

const maternitySchema = {
  motherName: "",
  shootDate: "",
};

const kidsSchema = {
  childName: "",
  age: "",
};

const videographySchema = {
  eventName: "",
  eventDate: "",
};

const saveTheDateSchema = {
  coupleName: "",
  eventDate: "",
};

const birthdaySchema = {
  personName: "",
  age: "",
  venue: "",
};

const houseCeremonySchema = {
  ownerName: "",
  ceremonyDate: "",
  address: "",
};

/* =========================
   SCHEMA MAP
========================= */
const SCHEMAS = {
  wedding: weddingSchema,
  prewedding: preWeddingSchema,
  portrait: portraitSchema,
  maternity: maternitySchema,
  kids: kidsSchema,
  videography: videographySchema,
  savedate: saveTheDateSchema,
  birthday: birthdaySchema,
  housecaremony: houseCeremonySchema,
};

/* =========================
   FIELD LABELS & TYPES
========================= */
const FIELD_CONFIG = {
  wedding: {
    brideName: { label: "Bride Name", type: "text" },
    groomName: { label: "Groom Name", type: "text" },
    weddingDate: { label: "Wedding Date", type: "date" },
    venue: { label: "Venue", type: "text" },
    contactNumber: { label: "Contact Number", type: "tel" },
  },
  birthday: {
    personName: { label: "Person Name", type: "text" },
    age: { label: "Age", type: "number" },
    venue: { label: "Venue", type: "text" },
  },
  // Add more configs as needed
  ...Object.fromEntries(
    Object.keys(SCHEMAS).filter(key => !['wedding', 'birthday'].includes(key)).map(key => [
      key, 
      Object.fromEntries(Object.keys(SCHEMAS[key]).map(field => [field, { label: field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), type: "text" }]))
    ])
  )
};

/* =========================
   PAGE
========================= */
export default function TemplatesPage() {
  const [open, setOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  const openTemplate = (key) => {
    setActiveTemplate(key);
    setForm({ ...SCHEMAS[key] });
    setOpen(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTemplate,
          data: form,
        }),
      });

      const result = await res.json();

      if (result.url) {
        alert("Saved to Cloudinary ✅\n" + result.url);
        window.open(result.url, "_blank");
        setOpen(false);
        setForm(null);
        setActiveTemplate(null);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  const getBackgroundStyle = (templateKey) => {
    const colors = {
      wedding: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)',
      prewedding: 'linear-gradient(135deg, #ffd3a5 0%, #fd8b9e 100%)',
      birthday: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      house: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    };
    return colors[templateKey] || 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Leaves */}
        <div className="text-center mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JlZW4tbGVhdmVzIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0wLDUwIEw1MCwwIEw1MCwxMDAgTDAsNTAgWiIgZmlsbD0icmdiYSgyMCwgMTg1LCAxMDAsIDAuNCkiLz48cGF0aCBkPSJNMTAwLDUwIEwxNTAsMCAgTDE1MCwxMDAgTDEwMCw1MCBaIiBmaWxsPSJyZ2JhKDIwLCAxODUsIDEwMCwgMC4zKSIvPjxwYXRoIGQ9Ik0yMCwyMCBRMzAsMTAgNDAsMjAgNDUsMTUgNDUsMzAgNDAgMzUgMzAsMzAgMjUsMzAgMjAsMjAgWiIgZmlsbD0icmdiYSgyMCwgMTg1LCAxMDAsIDAuNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JlZW4tbGVhdmVzKSIgb3BhY2l0eT0iMC4yNSIvPjwvc3ZnKQ==')] animate-pulse"></div>
          <h1 className="text-5xl sm:text-6xl font-serif font-bold text-emerald-800 relative z-10 drop-shadow-2xl mb-4">
            Kalakruthi Templates
          </h1>
          <p className="text-xl text-emerald-700 font-medium relative z-10">Create beautiful event invitations</p>
        </div>

        {/* Template Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
          {Object.entries(SCHEMAS).map(([key, schema]) => (
            <button
              key={key}
              onClick={() => openTemplate(key)}
              className="group relative overflow-hidden bg-white/70 backdrop-blur-xl hover:bg-white/90 border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] min-h-[140px] flex flex-col items-center justify-center text-center"
              style={{
                background: `${getBackgroundStyle(key)}, radial-gradient(circle at 30% 30%, rgba(130, 128, 252, 0.3) 0%, transparent 50%)`
              }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl font-bold text-white">
                  {key === 'wedding' ? '💒' : key === 'birthday' ? '🎂' : key === 'prewedding' ? '📸' : key === 'house' ? '🏠' : '✨'}
                </span>
              </div>
              <h3 className="font-bold text-lg text-emerald-800 group-hover:text-emerald-900 mb-1 leading-tight">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('Prewedding', 'Pre-Wedding').replace('Savedate', 'Save the Date')}
              </h3>
              <p className="text-xs text-emerald-600 font-medium opacity-80">{Object.keys(schema).length} fields</p>
            </button>
          ))}
        </div>

        {/* Enhanced Modal */}
        {open && form && (
          <div className={overlayClass}>
            <div className={modalClass}>
              {/* Header */}
              <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-emerald-100">
                <h2 className="text-3xl font-serif font-bold text-emerald-800 capitalize">
                  {activeTemplate.replace(/([A-Z])/g, ' $1').replace('Prewedding', 'Pre-Wedding').replace('Savedate', 'Save the Date')} Form
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-6 mb-10">
                {Object.entries(form).map(([field, value]) => {
                  const config = FIELD_CONFIG[activeTemplate]?.[field] || { label: field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), type: "text" };
                  
                  return (
                    <div key={field} className="space-y-2">
                      <label className="block text-sm font-semibold text-emerald-800 uppercase tracking-wide">
                        {config.label}
                      </label>
                      <input
                        type={config.type}
                        name={field}
                        placeholder={`Enter ${config.label.toLowerCase()}`}
                        value={value}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full px-5 py-4 border-2 border-emerald-200 rounded-2xl focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50/80 text-lg placeholder-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons - Exactly like your second image */}
              <div className="flex gap-4 pt-6 border-t-2 border-emerald-100">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-5 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" pathLength="1" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      💾 Save to Cloudinary
                    </>
                  )}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-12 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-bold py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg border border-gray-300 hover:border-gray-400 transform hover:-translate-y-1 whitespace-nowrap"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .floating { animation: float 3s ease-in-out infinite; }
      `}</style>
    </main>
  );
}

/* =========================
   TAILWIND CLASSES (No inline styles!)
========================= */
const overlayClass = `
  fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4
`;

const modalClass = `
  bg-white/95 backdrop-blur-2xl border border-emerald-100 shadow-2xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 sm:p-12
  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-emerald-50 [&::-webkit-scrollbar-thumb]:bg-emerald-300 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-400 rounded-lg
`;
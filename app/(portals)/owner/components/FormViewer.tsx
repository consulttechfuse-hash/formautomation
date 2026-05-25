'use client';

export default function FormViewer({ formData, formNumber, clientEmail }) {
  if (!formData) return null;

  if (formNumber === 1 || formNumber === '1') {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded sticky top-0">
          <h3 className="font-bold text-lg mb-2">Form-01: National Information</h3>
          <p className="text-sm text-gray-600">Client: {clientEmail}</p>
          {formData.submitted_at && (
            <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(formData.submitted_at).toLocaleString()}</p>
          )}
        </div>

        <div className="space-y-4">
          {/* Section 1: National Naming Information */}
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">N1.1 - National Naming Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-500">First Name</label><p className="font-medium">{formData.fn_t1 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">First Name (Uppercase)</label><p className="font-medium">{formData.fn_t2 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">First Name (Lowercase)</label><p className="font-medium">{formData.fn_t3 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">First Name Initial</label><p className="font-medium">{formData.fni_t1 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">Middle Name</label><p className="font-medium">{formData.mdn_t1 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">Middle Name (Uppercase)</label><p className="font-medium">{formData.mdn_t2 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">Middle Name Initial</label><p className="font-medium">{formData.mdni_t1 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">Surname</label><p className="font-medium">{formData.fln_t1 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">Full Name</label><p className="font-medium">{formData.fln_t5 || formData.fln_t1 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">Previous Surnames</label><p className="font-medium">{formData.prev_surnames || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">Extra Middle Names</label><p className="font-medium">{formData.extra_middle_names || 'N/A'}</p></div>
            </div>
          </div>

          {/* Section 2: Children Information */}
          {(formData.child_t1 || formData.no_children) && (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">Children Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500">Has Children</label><p className="font-medium">{formData.no_children === false ? 'Yes' : 'No'}</p></div>
                <div><label className="text-sm text-gray-500">Child Name(s)</label><p className="font-medium">{formData.child_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Child ID(s)</label><p className="font-medium">{formData.child_id_t1 || 'N/A'}</p></div>
              </div>
            </div>
          )}

          {/* Section 3: Contact Information */}
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">N1.3 - Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-500">Email Address</label><p className="font-medium">{formData.user_email || clientEmail}</p></div>
              <div><label className="text-sm text-gray-500">Alternative Email 1</label><p className="font-medium">{formData.ema_t1 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">Alternative Email 2</label><p className="font-medium">{formData.ema_t2 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">Alternative Email 3</label><p className="font-medium">{formData.ema_t3 || 'N/A'}</p></div>
              <div><label className="text-sm text-gray-500">Mobile Number</label><p className="font-medium">{formData.cnt_1 || 'N/A'}</p></div>
            </div>
          </div>

          {/* Section 4: Father's Information */}
          {(formData.pffn_t1 || formData.pft_t1) && (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">Father's Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500">Father's Full Name</label><p className="font-medium">{formData.pffn_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Father's Title</label><p className="font-medium">{formData.pft_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Father's Birth Date</label><p className="font-medium">{formData.pfbt_t2 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Father's Birth Place</label><p className="font-medium">{formData.pfbp_t1 || 'N/A'}</p></div>
              </div>
            </div>
          )}

          {/* Section 5: Mother's Information */}
          {(formData.pmfn_t1 || formData.pmbd_t1) && (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">Mother's Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500">Mother's Full Name</label><p className="font-medium">{formData.pmfn_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Mother's Maiden Name</label><p className="font-medium">{formData.pmmn_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Mother's Birth Date</label><p className="font-medium">{formData.pmbd_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Mother's Birth Place</label><p className="font-medium">{formData.pmbp_t1 || 'N/A'}</p></div>
              </div>
            </div>
          )}

          {/* Section 6: Address Information */}
          {(formData.padr_1 || formData.adr_stack) && (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">Address Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div><label className="text-sm text-gray-500">Physical Address</label><p className="font-medium">{formData.padr_1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Postal Code</label><p className="font-medium">{formData.psdc_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Full Address Stack</label><p className="font-medium whitespace-pre-wrap">{formData.adr_stack || 'N/A'}</p></div>
              </div>
            </div>
          )}

          {/* Section 7: Identity Documents */}
          {(formData.idp_t1 || formData.strn_t1) && (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">Identity Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500">ID/Passport Number</label><p className="font-medium">{formData.idp_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Serial Number</label><p className="font-medium">{formData.srn_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Street Number</label><p className="font-medium">{formData.strn_t1 || 'N/A'}</p></div>
              </div>
            </div>
          )}

          {/* Section 8: Personal Details */}
          {(formData.gen_t1 || formData.bgr_t1) && (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">Personal Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500">Gender</label><p className="font-medium">{formData.gen_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Birth Date</label><p className="font-medium">{formData.bgr_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Birth Place</label><p className="font-medium">{formData.bgr_t2 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Nationality</label><p className="font-medium">{formData.ctn_t1 || 'N/A'}</p></div>
              </div>
            </div>
          )}

          {/* Section 9: Disability Information */}
          {formData.dis_t1 && (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-md mb-3 text-blue-700 border-b pb-2">Disability Information</h4>
              <div className="grid grid-cols-1 gap-2">
                <div><label className="text-sm text-gray-500">Disability Type</label><p className="font-medium">{formData.dis_t1 || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Disability Description</label><p className="font-medium">{formData.dis_t2 || 'N/A'}</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Forms 2-17
  if (formData.filled_html) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded sticky top-0">
          <h3 className="font-bold text-lg">Form {formNumber.toString().padStart(2, '0')}</h3>
          <p className="text-sm text-gray-600">Client: {clientEmail}</p>
          {formData.is_locked && (
            <span className="inline-block mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">🔒 Locked - Submitted</span>
          )}
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formData.filled_html }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 p-4 rounded">
      <p className="text-sm">No form data available for Form {formNumber}</p>
    </div>
  );
}

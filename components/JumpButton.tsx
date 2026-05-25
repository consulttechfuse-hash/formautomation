'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JumpButton() {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const jumpTo = (path: string) => {
    router.push(path);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm"
      >
        Jump to ▼
      </button>
      {showMenu && (
        <div className="absolute left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
          <div className="py-1">
            {/* Dashboard Link */}
            <button
              onClick={() => jumpTo('/client/dashboard')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 font-semibold"
            >
              🏠 Dashboard
            </button>
            
            {/* Form 01 Link */}
            <button
              onClick={() => jumpTo('/client/form-01')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              📝 Form 01
            </button>
            
            <div className="border-t my-1"></div>
            
            {/* Forms 02-17 Links */}
            <div className="px-2 py-1 text-xs text-gray-500">Forms 02-17</div>
            {[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(num => (
              <button
                key={num}
                onClick={() => jumpTo(`/forms/${String(num).padStart(2, '0')}`)}
                className="block w-full text-left px-4 py-1 text-sm hover:bg-gray-100 pl-8"
              >
                Form {String(num).padStart(2, '0')}
              </button>
            ))}
            
            <div className="border-t my-1"></div>
            
            {/* Form Check & Submit Link */}
            <button
              onClick={() => jumpTo('/forms/check-submit')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 font-semibold text-green-600"
            >
              ✓ Form Check & Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";

function AuthRequired() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 text-center max-w-md w-full border border-gray-100">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
          <svg className="w-8 h-8 text-[#008e9b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          You need to login
        </h2>
        <p className="text-gray-600 mb-4">
          Please login to continue
        </p>
        <Link 
          to="/login"
          className="inline-block bg-[#008e9b] text-white px-6 py-2 rounded-lg hover:bg-[#007a85] transition font-bold"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

export default AuthRequired;

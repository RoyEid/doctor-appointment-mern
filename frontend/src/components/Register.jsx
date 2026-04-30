import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiConfig } from "../config/api";

function Register() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(apiConfig.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.token) {
      login(data.token, data.user);
      navigate("/");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <form
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
        onSubmit={handleSubmit}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Create Account
          </h2>
          <p className="text-gray-500 mt-2">
            Join us to book your appointments
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50"
            />
          </div>
        </div>

        <button className="w-full mt-8 py-3.5 rounded-lg bg-[#008e9b] text-white font-bold tracking-wide hover:bg-[#007a85] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008e9b] shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
          Create Account
        </button>
      </form>
    </div>
  );
}

export default Register;

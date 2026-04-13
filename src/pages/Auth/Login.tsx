import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { login } from "../../store/slices/authSlice";
import { authService } from "../../services/authService";
import { ROUTES } from "../../routes/routes";
import logo from "../../assets/logo.png";
import side_image from "../../assets/side_img.png";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authService.login({ username: form.username, password: form.password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      dispatch(login({
        id: res.data.id,
        username: res.data.username,
        email: res.data.meta.email,
        fullname: res.data.meta.fullname,
        phone: res.data.meta.phone,
        role: res.data.meta.role,
      }));
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">

      <div className="w-1/2 bg-white flex flex-col items-center px-16 py-10">

        <div className="w-full flex justify-center pt-8">
          <img src={logo} alt="logo" />
        </div>


        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-md my-auto">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-800">Username</label>
            <input
              name="username"
              type="text"
              required
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="border-0 border-b border-gray-300 py-2 text-sm text-gray-400 placeholder-gray-300 outline-none focus:border-gray-500 bg-transparent transition-colors"
            />
          </div>


          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-800">Password</label>
            <div className="relative flex items-center border-b border-gray-300 focus-within:border-gray-500 transition-colors">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="flex-1 border-0 py-2 text-sm text-gray-400 placeholder-gray-300 outline-none bg-transparent pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>


          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#00AEEF] hover:bg-[#0099d4] disabled:opacity-50 text-white text-sm font-medium px-6 py-2 transition-colors"
            >
              {loading ? "Please wait..." : "Proceed"}
            </button>
          </div>
        </form>
      </div>

<div className="w-1/2 h-screen bg-gray-200 flex items-center justify-center">
  <img src={side_image} alt="side" className="w-full h-full object-fill" />
</div>
    </div>
  );
}

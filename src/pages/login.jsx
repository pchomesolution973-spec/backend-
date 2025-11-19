import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://backend-production-8657.up.railway.app/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Identifiants incorrects");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");

    } catch (err) {
      setError("Impossible de se connecter au serveur.");
    }

    setLoading(false);
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-700">
          Connexion PrestService97
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-200 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-200 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

        </form>
      </div>
    </div>
  );
}

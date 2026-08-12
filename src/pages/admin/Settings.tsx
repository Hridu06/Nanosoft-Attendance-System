import { useEffect, useState, type FormEvent } from "react";
import { Check, Clock3, Lock, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getAttendanceThresholds,
  updateAttendanceThresholds,
} from "../../services/settingsService";

const Settings = () => {
  const { user, login } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileSaved, setProfileSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [presentHours, setPresentHours] = useState(6);
  const [halfDayHours, setHalfDayHours] = useState(3);
  const [thresholdError, setThresholdError] = useState("");
  const [thresholdSaved, setThresholdSaved] = useState(false);
  const [loadingThresholds, setLoadingThresholds] = useState(true);

  useEffect(() => {
    const load = async () => {
      const thresholds = await getAttendanceThresholds();
      setPresentHours(thresholds.presentHours);
      setHalfDayHours(thresholds.halfDayHours);
      setLoadingThresholds(false);
    };

    load();
  }, []);

  const handleProfileSubmit = (event: FormEvent) => {
    event.preventDefault();

    login({ name, email, role: "admin" });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handlePasswordSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      setPasswordSaved(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setPasswordSaved(false);
      return;
    }

    setPasswordError("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  const handleThresholdSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (halfDayHours >= presentHours) {
      setThresholdError("Half day hours must be less than present hours.");
      setThresholdSaved(false);
      return;
    }

    setThresholdError("");
    await updateAttendanceThresholds({ presentHours, halfDayHours });
    setThresholdSaved(true);
    setTimeout(() => setThresholdSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and system preferences.
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
            <UserCircle size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Profile
            </h2>
            <p className="text-sm text-slate-500">
              Update your account name and email.
            </p>
          </div>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Save Changes
            </button>

            {profileSaved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <Check size={16} />
                Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Password
            </h2>
            <p className="text-sm text-slate-500">
              Change your account password.
            </p>
          </div>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Update Password
            </button>

            {passwordSaved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <Check size={16} />
                Updated
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Attendance Rules */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
            <Clock3 size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Attendance Rules
            </h2>
            <p className="text-sm text-slate-500">
              Daily contribution hours required for Present / Half Day status.
            </p>
          </div>
        </div>

        {loadingThresholds ? (
          <p className="mt-5 text-sm text-slate-400">Loading...</p>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleThresholdSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Present Threshold (hours)
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  step={0.5}
                  value={presentHours}
                  onChange={(event) =>
                    setPresentHours(Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Contribution ≥ this many hours counts as Present.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Half Day Threshold (hours)
                </label>
                <input
                  required
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={halfDayHours}
                  onChange={(event) =>
                    setHalfDayHours(Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Below present but ≥ this many hours counts as Half Day.
                </p>
              </div>
            </div>

            {thresholdError && (
              <p className="text-sm text-red-600">{thresholdError}</p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Save Rules
              </button>

              {thresholdSaved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <Check size={16} />
                  Saved
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;

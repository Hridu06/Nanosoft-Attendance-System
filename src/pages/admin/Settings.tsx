import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Briefcase,
  Building2,
  Camera,
  Check,
  Clock3,
  Lock,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserCircle,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CategoryManager from "../../components/settings/CategoryManager";
import {
  getAttendanceThresholds,
  updateAttendanceThresholds,
} from "../../services/settingsService";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentList,
  updateDepartment,
} from "../../services/departmentService";
import {
  createDesignation,
  deleteDesignation,
  getDesignationList,
  updateDesignation,
} from "../../services/designationService";

type TabId = "profile" | "attendance" | "departments" | "designations";

const TABS: { id: TabId; label: string; icon: typeof UserCircle }[] = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "attendance", label: "Attendance Rules", icon: Clock3 },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "designations", label: "Designations", icon: Briefcase },
];

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [mobile, setMobile] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileSnapshot = useRef({ name, email, mobile, avatarUrl });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [presentHours, setPresentHours] = useState(6);
  const [halfDayHours, setHalfDayHours] = useState(3);
  const [officeStartTime, setOfficeStartTime] = useState("09:30");
  const [thresholdError, setThresholdError] = useState("");
  const [thresholdSaved, setThresholdSaved] = useState(false);
  const [loadingThresholds, setLoadingThresholds] = useState(true);

  useEffect(() => {
    const load = async () => {
      const thresholds = await getAttendanceThresholds();
      setPresentHours(thresholds.presentHours);
      setHalfDayHours(thresholds.halfDayHours);
      setOfficeStartTime(thresholds.officeStartTime);
      setLoadingThresholds(false);
    };

    load();
  }, []);

  const startEditProfile = () => {
    profileSnapshot.current = { name, email, mobile, avatarUrl };
    setIsEditingProfile(true);
  };

  const cancelEditProfile = () => {
    const snapshot = profileSnapshot.current;
    setName(snapshot.name);
    setEmail(snapshot.email);
    setMobile(snapshot.mobile);
    setAvatarUrl(snapshot.avatarUrl);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setIsEditingProfile(false);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setPasswordError("Password must be at least 6 characters.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }
    }

    setPasswordError("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleThresholdSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (halfDayHours >= presentHours) {
      setThresholdError("Half day hours must be less than present hours.");
      setThresholdSaved(false);
      return;
    }

    setThresholdError("");
    await updateAttendanceThresholds({ presentHours, halfDayHours, officeStartTime });
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

      <div className="rounded-xl border border-slate-200 bg-white">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 px-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Profile */}
          {activeTab === "profile" && (
            <div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="group relative shrink-0">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-2xl font-semibold text-blue-600 ring-4 ring-blue-50">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name || "Profile"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        name.charAt(0).toUpperCase() || "?"
                      )}
                    </div>

                    {isEditingProfile && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700"
                        aria-label="Change profile picture"
                      >
                        <Camera size={13} />
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {name || "Unnamed"}
                    </h2>
                    <p className="text-sm text-slate-500">{email}</p>
                    {user?.role && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
                        <ShieldCheck size={12} />
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={startEditProfile}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Pencil size={15} />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="my-6 border-t border-slate-200" />

              {isEditingProfile ? (
                <form className="space-y-5" onSubmit={handleProfileSubmit}>
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

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={mobile}
                        placeholder="+880 1XXX-XXXXXX"
                        onChange={(event) => setMobile(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Role
                      </label>
                      <input
                        disabled
                        value={user?.role ?? ""}
                        className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm capitalize text-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <Lock size={15} className="text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">
                      Change Password
                    </p>
                    <span className="text-xs text-slate-400">
                      (leave blank to keep your current password)
                    </span>
                  </div>

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
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
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
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <Check size={16} />
                      Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditProfile}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow icon={<UserCircle size={16} />} label="Full Name" value={name || "Not set"} />
                  <InfoRow icon={<Mail size={16} />} label="Email" value={email || "Not set"} />
                  <InfoRow icon={<Phone size={16} />} label="Mobile Number" value={mobile || "Not provided"} />
                  <InfoRow icon={<Lock size={16} />} label="Password" value="••••••••" />
                </div>
              )}

              {profileSaved && (
                <span className="mt-5 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <Check size={16} />
                  Profile updated successfully
                </span>
              )}
            </div>
          )}

          {/* Attendance Rules */}
          {activeTab === "attendance" && (
            <div>
              <p className="text-sm text-slate-500">
                Daily contribution hours required for Present / Half Day status.
              </p>

              {loadingThresholds ? (
                <p className="mt-5 text-sm text-slate-400">Loading...</p>
              ) : (
                <form
                  className="mt-5 space-y-4"
                  onSubmit={handleThresholdSubmit}
                >
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

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Office Start Time
                    </label>
                    <input
                      required
                      type="time"
                      value={officeStartTime}
                      onChange={(event) =>
                        setOfficeStartTime(event.target.value)
                      }
                      className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="mt-1.5 text-xs text-slate-400">
                      Contributions starting after this time count as a Late
                      arrival.
                    </p>
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
          )}

          {/* Departments */}
          {activeTab === "departments" && (
            <CategoryManager
              entityLabel="Department"
              description="Manage the departments employees can be assigned to."
              getList={getDepartmentList}
              create={createDepartment}
              update={updateDepartment}
              remove={deleteDepartment}
            />
          )}

          {/* Designations */}
          {activeTab === "designations" && (
            <CategoryManager
              entityLabel="Designation"
              description="Manage the job designations employees can be assigned to."
              getList={getDesignationList}
              create={createDesignation}
              update={updateDesignation}
              remove={deleteDesignation}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3.5">
    <div className="mt-0.5 text-slate-400">{icon}</div>
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
    </div>
  </div>
);

export default Settings;

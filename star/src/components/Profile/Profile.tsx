import { useState, useEffect } from "react";
import { User, Edit2, Save } from "lucide-react";
import { toast } from "react-toastify";
import useUserProfile from "./hooks/useUserProfile";
import LoadingSpinner from "../ui/LoadingSpinner";
import { UserProfile } from "../../types/users";

const Profile = () => {
  const { userData, loading: isUpdating, error, updateUserProfileData } = useUserProfile();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<{ phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData) {
      setUserProfile({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email,
        phone: userData.phone || "",
      });
    }
  }, [userData]);

  const validatePhone = (value: string) => {
    if (!value) return undefined;
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    return phoneRegex.test(value) ? undefined : "Enter a valid phone number.";
  };

  const isInitialLoading = !userData && isUpdating;

  const handleUpdate = async () => {
    if (!isEditing) return;
    const phoneError = validatePhone(userProfile.phone);
    if (phoneError) {
      setFormErrors({ phone: phoneError });
      toast.error(phoneError);
      return;
    }

    setFormErrors({});
    const payload = {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
      phone: userProfile.phone,
    };

    try {
      setIsSubmitting(true);
      const response = await updateUserProfileData(payload);
      if (response?.user) {
        setUserProfile({
          firstName: response.user.firstName || "",
          lastName: response.user.lastName || "",
          email: response.user.email,
          phone: response.user.phone || "",
        });
      }
      toast.success(response?.message || "Profile updated successfully");
      setIsEditing(false);
    } catch (updateError: any) {
      const serverMessage =
        updateError?.message ||
        updateError?.response?.data?.error ||
        "Failed to update profile";
      toast.error(serverMessage);
      console.error("Failed to update profile", updateError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setUserProfile({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email,
        phone: userData.phone || "",
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  if (isInitialLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  if (error)
    return <p className="text-red-500 text-center">Error loading profile.</p>;

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" /> Profile
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={userProfile.firstName}
            onChange={(e) =>
              setUserProfile((prev) => ({ ...prev, firstName: e.target.value }))
            }
            disabled={!isEditing}
            className={`w-full p-3 border rounded-md focus:ring-2 ${
              isEditing
                ? "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                : "bg-gray-100 dark:bg-gray-700 cursor-not-allowed dark:text-gray-300"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={userProfile.lastName}
            onChange={(e) =>
              setUserProfile((prev) => ({ ...prev, lastName: e.target.value }))
            }
            disabled={!isEditing}
            className={`w-full p-3 border rounded-md focus:ring-2 ${
              isEditing
                ? "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                : "bg-gray-100 dark:bg-gray-700 cursor-not-allowed dark:text-gray-300"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          <input
            type="text"
            value={userProfile.phone}
            onChange={(e) =>
              setUserProfile((prev) => ({ ...prev, phone: e.target.value }))
            }
            disabled={!isEditing}
            className={`w-full p-3 border rounded-md focus:ring-2 ${
              isEditing
                ? "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                : "bg-gray-100 dark:bg-gray-700 cursor-not-allowed dark:text-gray-300"
            }`}
          />
          {formErrors.phone && (
            <p className="mt-2 text-sm text-red-500">{formErrors.phone}</p>
          )}
        </div>

        {/* Email (Read-Only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            defaultValue={userProfile.email}
            disabled
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed dark:text-gray-300"
          />
        </div>
        <div className="flex justify-between">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex justify-between w-full">
              <button
                onClick={handleUpdate}
                disabled={isSubmitting || isUpdating}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                  isSubmitting || isUpdating
                    ? "bg-indigo-300 cursor-not-allowed text-white"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                <Save className="w-4 h-4" />
                {isSubmitting || isUpdating ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

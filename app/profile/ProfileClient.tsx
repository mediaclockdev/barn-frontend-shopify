"use client";

import useAuthStore from "@/src/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiBox,
  FiCheck,
  FiMapPin,
  FiChevronDown,
  FiX,
  FiArrowRight,
  FiEdit2,
  FiPlus,
} from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";

interface AddressDetails {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface CustomerProfile {
  id: string;
  email?: string;
  username?: string;
  shipping?: AddressDetails;
  first_name?: string;
  last_name?: string;
}

export default function ProfileClient() {
  const { user, hasHydrated } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [shippingForm, setShippingForm] = useState<AddressDetails>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/login?redirect=/profile");
    }
  }, [hasHydrated, user, router]);

  useEffect(() => {
    const userId = user?.id || (user as any)?.user_id || (user as any)?.wp_id;
    if (!hasHydrated || !userId) return;

    const controller = new AbortController();

    const fetchProfile = async () => {
      setIsLoadingProfile(true);

      try {
        const token = useAuthStore.getState().token;
        const response = await fetch(`/api/profile`, {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (response.ok) {
          setProfile(data.profile || null);
          if (data.profile?.shipping) {
            setShippingForm(data.profile.shipping);
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error("Failed to load profile.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProfile(false);
        }
      }
    };

    void fetchProfile();

    return () => controller.abort();
  }, [hasHydrated, user]);

  if (!hasHydrated || (!user && !isLoadingProfile)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userId = user?.id || (user as any)?.user_id || (user as any)?.wp_id;

  const activeProfile = profile
    ? {
        id: profile.id,
        email: profile.email || user?.email,
        username: profile.username || user?.username,
        first_name: profile.first_name || user?.first_name,
        last_name: profile.last_name || user?.last_name,
        shipping: profile.shipping,
      }
    : {
        id: userId ?? "",
        email: user?.email,
        username: user?.username,
        first_name: user?.first_name,
        last_name: user?.last_name,
        shipping: undefined,
      };

  const handleUpdateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!shippingForm.first_name?.trim())
      newErrors.first_name = "First name is required";
    if (!shippingForm.last_name?.trim())
      newErrors.last_name = "Last name is required";
    if (!shippingForm.address_1?.trim())
      newErrors.address_1 = "Street address is required";
    if (!shippingForm.city?.trim()) newErrors.city = "City is required";
    if (!shippingForm.state?.trim()) newErrors.state = "State is required";
    if (!shippingForm.postcode?.trim())
      newErrors.postcode = "Postcode is required";

    setAddressErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ shipping: shippingForm }),
      });
      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        if (data.profile?.shipping) {
          setShippingForm(data.profile.shipping);
        }
        setIsEditingAddress(false);
        setAddressErrors({});
        toast.success("Shipping address updated!");
      } else {
        toast.error(data.message || "Failed to update shipping address");
      }
    } catch (err) {
      toast.error("An error occurred while saving.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingForm({ ...shippingForm, [name]: value });
    if (addressErrors[name]) {
      setAddressErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="bg-white py-6 sm:py-10 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-[28px] md:text-3xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1.5 sm:mt-2 font-medium">
            Manage your account details and view your activity.
          </p>
        </div>

        {isLoadingProfile ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl sm:rounded-[32px] overflow-hidden shadow-sm border border-gray-100 px-4 sm:px-6 md:px-12 py-6 sm:py-10 md:py-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
              {/* Account Information */}
              <div className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiUser className="text-[#42A1E8] text-xl sm:text-2xl shrink-0" />{" "}
                  Account Information
                </h3>
                <div className="space-y-5">
                  <div className="bg-[#E5E3D8] bg-opacity-70 rounded-xl sm:rounded-2xl p-4 sm:p-5 py-3.5 sm:py-4 border border-gray-200/30">
                    <p className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                      Full Name
                    </p>
                    <p className="text-gray-600 font-medium">
                      {activeProfile.first_name || activeProfile.last_name
                        ? `${activeProfile.first_name || ""} ${activeProfile.last_name || ""}`.trim()
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-[#E5E3D8] bg-opacity-70 rounded-xl sm:rounded-2xl p-4 sm:p-5 py-3.5 sm:py-4 border border-gray-200/30">
                    <p className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                      Email
                    </p>
                    <p className="text-gray-600 font-medium text-sm sm:text-base break-all">
                      {activeProfile.email || "-"}
                    </p>
                  </div>
                  <div className="bg-[#E5E3D8] bg-opacity-70 rounded-xl sm:rounded-2xl p-4 sm:p-5 py-3.5 sm:py-4 border border-gray-200/30">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-base sm:text-lg font-bold text-gray-800">
                        Shipping Address
                      </p>
                      <button
                        onClick={() => setIsEditingAddress(!isEditingAddress)}
                        className="text-[#42A1E8] hover:bg-white/60 p-1.5 px-2 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-bold shadow-sm bg-white/40 cursor-pointer"
                      >
                        {isEditingAddress ? (
                          <>
                            Close <FiX className="text-base" />
                          </>
                        ) : activeProfile.shipping?.address_1 ||
                          activeProfile.shipping?.city ? (
                          <>
                            Edit <FiEdit2 className="text-base" />
                          </>
                        ) : (
                          <>
                            Add <FiPlus className="text-base" />
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-gray-600 font-medium text-sm sm:text-base mt-2">
                      {activeProfile.shipping?.address_1 ||
                      activeProfile.shipping?.city ? (
                        <>
                          {activeProfile.shipping.first_name ||
                            activeProfile.first_name ||
                            ""}{" "}
                          {activeProfile.shipping.last_name ||
                            activeProfile.last_name ||
                            ""}
                          <br />
                          {activeProfile.shipping.address_1}{" "}
                          {activeProfile.shipping.address_2}
                          <br />
                          {activeProfile.shipping.city
                            ? `${activeProfile.shipping.city}, `
                            : ""}
                          {activeProfile.shipping.state}{" "}
                          {activeProfile.shipping.postcode}
                        </>
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiMapPin className="text-[#42A1E8] text-xl sm:text-2xl shrink-0" />{" "}
                  Quick Actions
                </h3>
                <div className="space-y-5">
                  {/* Order History Action */}
                  <Link
                    href="/orders"
                    className="flex items-center justify-between bg-[#E5E3D8] bg-opacity-70 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5 hover:bg-[#DCDAD0] transition-colors border border-gray-200/30 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-md shrink-0">
                        <FiBox className="text-xl text-[#42A1E8]" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
                          Order History
                        </p>
                        <p className="text-sm text-gray-600 mt-1 font-medium">
                          View and Track all your orders
                        </p>
                      </div>
                    </div>
                    <span className="text-[#42A1E8] text-sm sm:text-md font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                      View <FiArrowRight />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Address Edit Form */}
            {isEditingAddress && (
              <div className="mt-8 sm:mt-12 pt-8 sm:pt-10 border-t border-[#E5E3D8]">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-2">
                  <FiMapPin className="text-[#42A1E8] text-xl sm:text-2xl shrink-0" />{" "}
                  Shipping Detail
                </h3>
                <form
                  onSubmit={handleUpdateShipping}
                  className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                        First Name<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={shippingForm.first_name || ""}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-3.5 bg-white border ${addressErrors.first_name ? "border-red-500" : "border-gray-200"} rounded-xl outline-none focus:border-[#42A1E8] focus:ring-2 focus:ring-[#42A1E8]/20 transition-all text-md font-medium`}
                        placeholder="John"
                      />
                      {addressErrors.first_name && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium">
                          {addressErrors.first_name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                        Last Name<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={shippingForm.last_name || ""}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-3.5 bg-white border ${addressErrors.last_name ? "border-red-500" : "border-gray-200"} rounded-xl outline-none focus:border-[#42A1E8] focus:ring-2 focus:ring-[#42A1E8]/20 transition-all text-md font-medium`}
                        placeholder="Doe"
                      />
                      {addressErrors.last_name && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium">
                          {addressErrors.last_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                      Street Address
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      name="address_1"
                      value={shippingForm.address_1 || ""}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-3.5 bg-white border ${addressErrors.address_1 ? "border-red-500" : "border-gray-200"} rounded-xl outline-none focus:border-[#42A1E8] focus:ring-2 focus:ring-[#42A1E8]/20 transition-all mb-1 text-md font-medium`}
                      placeholder="Street name, P.O. box, etc."
                    />
                    {addressErrors.address_1 && (
                      <p className="text-red-500 text-xs mt-0.5 mb-3 font-medium">
                        {addressErrors.address_1}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                        City<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingForm.city || ""}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-3.5 bg-white border ${addressErrors.city ? "border-red-500" : "border-gray-200"} rounded-xl outline-none focus:border-[#42A1E8] focus:ring-2 focus:ring-[#42A1E8]/20 transition-all text-md font-medium`}
                        placeholder="Sydney"
                      />
                      {addressErrors.city && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium">
                          {addressErrors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                        State<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="state"
                          value={shippingForm.state || ""}
                          onChange={
                            ((e: React.ChangeEvent<HTMLSelectElement>) => {
                              setShippingForm({
                                ...shippingForm,
                                state: e.target.value,
                              });
                              if (addressErrors.state) {
                                setAddressErrors((prev) => ({
                                  ...prev,
                                  state: "",
                                }));
                              }
                            }) as React.ChangeEventHandler<HTMLSelectElement>
                          }
                          className={`w-full appearance-none px-4 py-3.5 bg-white border ${addressErrors.state ? "border-red-500" : "border-gray-200"} rounded-xl outline-none focus:border-[#42A1E8] focus:ring-2 focus:ring-[#42A1E8]/20 transition-all text-md font-medium text-gray-700 cursor-pointer`}
                        >
                          <option value="" disabled hidden>
                            Select State
                          </option>
                          {[
                            "NSW",
                            "VIC",
                            "QLD",
                            "WA",
                            "SA",
                            "TAS",
                            "ACT",
                            "NT",
                          ].map((stateOption) => (
                            <option key={stateOption} value={stateOption}>
                              {stateOption}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <FiChevronDown />
                        </div>
                      </div>
                      {addressErrors.state && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium">
                          {addressErrors.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                        Postcode<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        value={shippingForm.postcode || ""}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-3.5 bg-white border ${addressErrors.postcode ? "border-red-500" : "border-gray-200"} rounded-xl outline-none focus:border-[#42A1E8] focus:ring-2 focus:ring-[#42A1E8]/20 transition-all text-md font-medium`}
                        placeholder="2000"
                      />
                      {addressErrors.postcode && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium">
                          {addressErrors.postcode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="px-6 py-3 sm:py-3.5 text-gray-600 font-bold hover:bg-gray-200/50 rounded-xl transition-colors text-md text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="px-8 py-3 sm:py-3.5 bg-[#42A1E8] text-white font-bold rounded-xl hover:bg-[#328BCB] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-md shadow-md"
                    >
                      {isSavingAddress ? (
                        "Saving..."
                      ) : (
                        <>
                          <FiCheck className="text-lg" /> Save Address
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

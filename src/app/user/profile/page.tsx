"use client";

import React, { useEffect, useState, useRef } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import LocationPicker from "@/components/map/LocationPicker";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  CheckCircle2, 
  Save, 
  Camera, 
  Upload, 
  AlertCircle,
  RefreshCw,
  X
} from "lucide-react";

export default function UserProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<[number, number]>([77.5946, 12.9716]);
  const [profileImage, setProfileImage] = useState("");

  // Photo upload & preview states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch authenticated user profile data from MongoDB
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setFullName(data.user.fullName || "");
        setMobile(data.user.mobile || "");
        setCity(data.user.city || "");
        setAddress(data.user.address || "");
        setProfileImage(data.user.profileImage || "");
        if (data.user.location?.coordinates && Array.isArray(data.user.location.coordinates)) {
          setCoords(data.user.location.coordinates);
        }
      }
    } catch (err: any) {
      console.error("[Profile] Error loading user profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Photo File Selection & Validation
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Please select a valid image file (JPEG, PNG, WebP, GIF).");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("File size exceeds 5MB limit. Please choose a smaller photograph.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Upload Photograph to Server & Persist in MongoDB
  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    try {
      setUploadingPhoto(true);
      setPhotoError(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/user/photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.profileImage) {
        setProfileImage(data.profileImage);
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setPhotoError(data.error || "Failed to upload photograph.");
      }
    } catch (err: any) {
      setPhotoError(err.message || "Network error while uploading photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Real Profile & Location Save to MongoDB
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    // If there is an unsaved photo preview, upload it first
    if (selectedFile) {
      await handleUploadPhoto();
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          city: city.trim(),
          address: address.trim(),
          coordinates: coords,
          profileImage: profileImage || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        await fetchProfile();
      } else {
        setErrorMessage(data.error || "Failed to update profile details.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "PUBLIC_USER"}
          userName={currentUser?.fullName || "Guardian"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
              User Profile
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2 font-display">
              Guardian Account & Location
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Manage your personal guardian credentials and regional GPS alert perimeter.
            </p>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
              <span>Guardian details, photograph, and location coordinates successfully saved in MongoDB!</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-coral-50 border border-coral-200 text-coral-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-coral-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-6"
          >
            {/* 1. Profile Photo Upload & Guardian Role Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-cream-100">
              <div className="flex items-center gap-5">
                {/* Photo Display / Preview */}
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-peach-400 bg-cream-100 shadow-sm flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Photo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile Photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-primary-500 font-display font-black text-2xl">
                        🐾
                      </div>
                    )}
                  </div>

                  {/* Camera overlay button to choose photo */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Choose a profile photograph"
                    className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary-500 text-white shadow-md hover:bg-primary-600 transition-transform active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-black text-foreground font-display">
                    {currentUser?.fullName || "Animal Guardian"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-peach-100 text-primary-700">
                      Role: {currentUser?.role?.replace(/_/g, " ") || "PUBLIC USER"}
                    </span>
                    {currentUser?.isEmailVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-mint-700 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-mint-600" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Supported: JPG, PNG, WebP (Max 5MB)
                  </p>
                </div>
              </div>

              {/* Photo Upload Actions when file is chosen */}
              {previewUrl && (
                <div className="flex items-center gap-2 bg-cream-50 p-2.5 rounded-2xl border border-cream-200 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={handleUploadPhoto}
                    disabled={uploadingPhoto}
                    className="px-3.5 py-1.5 rounded-xl bg-primary-500 text-white text-xs font-bold shadow-sm hover:bg-primary-600 flex items-center gap-1.5"
                  >
                    {uploadingPhoto ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Save Photo</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPreview}
                    disabled={uploadingPhoto}
                    className="p-1.5 rounded-xl text-muted-foreground hover:bg-cream-200 transition-colors"
                    title="Cancel photo preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Photo Error Banner */}
            {photoError && (
              <div className="p-3 rounded-xl bg-coral-50 border border-coral-200 text-coral-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-coral-600 flex-shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {/* 2. Guardian Details Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary-500" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-semibold focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary-500" /> Email Address (Registered)
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ""}
                  className="w-full p-2.5 rounded-xl border border-cream-200 bg-cream-100 text-xs text-muted-foreground font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary-500" /> Mobile Phone
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-semibold focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" /> Operating City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-semibold focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* 3. Location Section: Home Base / Operating Coordinates */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" /> Home Base / Operating Coordinates
                </label>
                <span className="font-mono text-[11px] text-primary-600 bg-peach-50 px-2 py-0.5 rounded-lg border border-peach-200 font-bold">
                  {coords[1].toFixed(4)}° N, {coords[0].toFixed(4)}° E
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Click anywhere on the map or drag the pin to set your regional alert zone. Saved permanently in MongoDB.
              </p>

              <LocationPicker
                initialCoordinates={coords}
                onLocationSelect={(c, addr) => {
                  setCoords(c);
                  setAddress(addr);
                }}
              />

              {address && (
                <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs text-foreground font-medium flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-all active:scale-98 flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

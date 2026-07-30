// app/account/address/page.tsx
"use client";

import { useState, useEffect } from "react";
import SavedAddresses from "@/components/address/SavedAddresses";
import AddAddress from "@/components/address/AddAddress";
import { BsFillPlusCircleFill } from "react-icons/bs";
import toast, { Toaster } from "react-hot-toast";
import { Address } from "@/types/address";

export default function AddressPage() {
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = 'https://fashion.admin.t-carts.com/api';

  // جلب جميع العناوين
  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token2');
      
      const response = await fetch(`${API_URL}/addresses`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      
      
      if (result.result === true && Array.isArray(result.data)) {
        setAddresses(result.data);
      } else {
        throw new Error("فشل في تحميل العناوين");
      }
    } catch (error) {
      console.error("❌ خطأ في جلب العناوين:", error);
      toast.error("فشل في تحميل العناوين");
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (newAddress: Address) => {
    await fetchAddresses();
    setShowAddAddress(false);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddAddress(true);
  };

  const handleUpdateAddress = async (updatedAddress: Address) => {
    await fetchAddresses();
    setShowAddAddress(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token2');
      
      const response = await fetch(`${API_URL}/addresses/${id}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      const result = await response.json();
      
      if (result.result === true) {
        toast.success("تم حذف العنوان بنجاح");
        await fetchAddresses();
      } else {
        throw new Error(result.message || "فشل في حذف العنوان");
      }
    } catch (error) {
      console.error("❌ خطأ في حذف العنوان:", error);
      toast.error(error instanceof Error ? error.message : "فشل في حذف العنوان");
    }
  };

  const handleCloseModal = () => {
    setShowAddAddress(false);
    setEditingAddress(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          {/* <p className="mt-4 text-gray-600">جاري تحميل العناوين...</p> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
    
      <div className="container mx-auto">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-[#180100]">
              العناوين المحفوظة
            </h1>
          </div>

          <SavedAddresses
            addresses={addresses}
            onDelete={handleDeleteAddress}
            onEdit={handleEditAddress}
          />

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setEditingAddress(null);
                setShowAddAddress(true);
              }}
              className="flex items-center gap-2 text-[#180100] hover:text-[#ff6b6b] transition-colors"
            >
              <BsFillPlusCircleFill className="w-10 h-10" />
            </button>
          </div>

          {showAddAddress && (
            <AddAddress
              key={editingAddress?.id || "new"}
              onClose={handleCloseModal}
              onSave={editingAddress ? handleUpdateAddress : handleAddAddress}
              initialData={editingAddress || undefined}
              isEditing={!!editingAddress}
            />
          )}
        </div>
      </div>
    </div>
  );
}
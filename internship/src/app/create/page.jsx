'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// เพิ่มการ import SweetAlert2 (ถ้าใช้ CDN ไม่ต้อง import แต่ต้องเพิ่ม script ใน layout)
import Swal from 'sweetalert2';

export default function CreatePage() {
  const [form, setForm] = useState({ name: '', title: '', quantity: 0, image: '' });
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'quantity' ? parseInt(value) || 0 : value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, image: reader.result });
      reader.readAsDataURL(file);
    } else {
      setForm({ ...form, image: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'เพิ่มสินค้าเรียบร้อยแล้ว!',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3085d6',
      });
      router.push('/');
    } catch (error) {
      console.error('Error adding item:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเพิ่มสินค้าได้',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">เพิ่มสินค้า</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-semibold">ชื่อสินค้า</label>
          <input
            name="name"
            placeholder="ชื่อสินค้า"
            value={form.name}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">รายละเอียด</label>
          <input
            name="title"
            placeholder="รายละเอียด"
            value={form.title}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">จำนวน</label>
          <input
            type="number"
            name="quantity"
            placeholder="จำนวน"
            value={form.quantity}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">รูปภาพ</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="p-2 w-full"
          />
        </div>

        {/* แสดงตัวอย่างรูปภาพ หรือพื้นหลังสีเทาถ้าไม่มีรูป */}
        <div className="mt-2">
          <p className="font-semibold">ตัวอย่างรูปภาพ:</p>
          {form.image ? (
            <img
              src={form.image}
              alt="Preview"
              className="h-40 w-full object-cover rounded"
            />
          ) : (
            <div className="h-40 w-full bg-gray-300 rounded flex items-center justify-center">
              <p className="text-gray-500">ไม่มีรูปภาพ</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          บันทึก
        </button>
      </form>
    </div>
  );
}
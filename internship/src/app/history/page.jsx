'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/posts/history');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลประวัติได้',
          confirmButtonText: 'ตกลง',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📜 ประวัติการทำรายการ</h1>
      <button
        onClick={() => router.push('/')}
        className="mb-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        กลับไปหน้าหลัก
      </button>

      {loading ? (
        <p className="text-gray-500 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 mr-2 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h-8z"
            />
          </svg>
          กำลังโหลด...
        </p>
      ) : history.length === 0 ? (
        <p className="text-gray-500">ไม่มีประวัติการทำรายการ</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">ชื่อสินค้า</th>
                <th className="border border-gray-300 p-2 text-left">การกระทำ</th>
                <th className="border border-gray-300 p-2 text-left">จำนวน</th>
                <th className="border border-gray-300 p-2 text-left">วันที่/เวลา</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{entry.itemName}</td>
                  <td className="border border-gray-300 p-2">
                    <span
                      className={
                        entry.action === 'add'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }
                    >
                      {entry.action === 'add' ? 'เพิ่ม' : 'เบิก'}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2">{entry.quantity}</td>
                  <td className="border border-gray-300 p-2">
                    {new Date(entry.timestamp).toLocaleString('th-TH', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
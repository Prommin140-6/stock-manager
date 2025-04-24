'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
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
        setFilteredHistory(data); // ตั้งค่าเริ่มต้นให้แสดงประวัติทั้งหมด
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

  const handleDateChange = (e) => {
    const date = e.target.value; // ได้วันที่ในรูปแบบ YYYY-MM-DD
    setSelectedDate(date);

    if (!date) {
      setFilteredHistory(history); // ถ้าไม่เลือกวันที่ ให้แสดงประวัติทั้งหมด
      return;
    }

    // แปลงวันที่ที่เลือกเป็น Date object และรีเซ็ตเวลาเป็น 00:00:00 เพื่อเปรียบเทียบเฉพาะวันที่
    const selectedDateObj = new Date(date);
    selectedDateObj.setHours(0, 0, 0, 0);

    // กรองประวัติโดยเปรียบเทียบเฉพาะวันที่
    const filtered = history.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0); // รีเซ็ตเวลาเพื่อเปรียบเทียบเฉพาะวันที่
      return entryDate.getTime() === selectedDateObj.getTime();
    });

    setFilteredHistory(filtered);
  };

  const resetFilter = () => {
    setSelectedDate(''); // ล้างวันที่ที่เลือก
    setFilteredHistory(history); // แสดงประวัติทั้งหมด
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📜 ประวัติการทำรายการ</h1>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => router.push('/')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          กลับไปหน้าหลัก
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="border p-2 rounded"
        />
        <button
          onClick={resetFilter}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
          disabled={!selectedDate}
        >
          รีเซ็ต
        </button>
      </div>

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
      ) : filteredHistory.length === 0 ? (
        <p className="text-gray-500">
          {selectedDate ? 'ไม่มีประวัติในวันที่เลือก' : 'ไม่มีประวัติการทำรายการ'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">ชื่อสินค้า</th>
                <th className="border border-gray-300 p-2 text-left">การกระทำ</th>
                <th className="border border-gray-300 p-2 text-left">จำนวน</th>
                <th className="border border-gray-300 p-2 text-left">ผู้เบิก</th>
                <th className="border border-gray-300 p-2 text-left">วันที่/เวลา</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((entry, index) => (
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
                      {entry.action === 'add' ? 'เพิ่ม' : entry.action === 'remove' ? 'เบิก' : 'แก้ไข'}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2">{entry.quantity}</td>
                  <td className="border border-gray-300 p-2">
                    {entry.requester || 'ไม่ระบุ'}
                  </td>
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
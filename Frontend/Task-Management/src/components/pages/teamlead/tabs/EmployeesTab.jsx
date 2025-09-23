//src/componnets/pages/teamlead/tabs/employeetab
import React, { useEffect, useState } from "react";
import api from "../../../../utils/api";

const EmployeesTab = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get("/team/team");
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading employees...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">👥 My Employees</h2>
      {employees.length === 0 ? (
        <p className="text-gray-600">No employees assigned to you yet.</p>
      ) : (
        <ul className="space-y-2">
          {employees.map((emp) => (
            <li
              key={emp._id}
              className="p-3 border rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{emp.name}</p>
                <p>Email: {emp.email}</p>
                <p>Phone: {emp.phone}</p>
                <p>CNIC: {emp.cnic}</p>
                <p>Status: {emp.isActive ? "✅ Active" : "❌ Inactive"}</p>
              </div>
              {/* Future Actions: Assign task / send notification */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeesTab;

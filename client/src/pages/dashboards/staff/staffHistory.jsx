import { useEffect, useState } from "react";
import api from "../../../api/axiosClient";
import Layout from "../../../layout";

export default function StaffHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/org/staff/activity")
      .then((res) => {
        setHistory(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching staff activity:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Staff Activity History:">
      <div style={{ padding: "20px" }}>
        <h2>Activity Log</h2>

        {loading ? (
          <p>Loading...</p>
        ) : history.length === 0 ? (
          <p>No staff activity found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr style={{ background: "#e6ffe6" }}>
                <th style={th}>Action</th>
                <th style={th}>Item Name</th>
                <th style={th}>Category</th>
                <th style={th}>Old Status</th>
                <th style={th}>New Status</th>
                <th style={th}>Reason</th>
                <th style={th}>Date</th>
              </tr>
            </thead>

            <tbody>
              {history.map((row, index) => (
                <tr key={index} style={{ textAlign: "center" }}>
                  <td style={td}>{row.action}</td>
                  <td style={td}>{row.item_name}</td>
                  <td style={td}>{row.category}</td>
                  <td style={td}>{row.old_status}</td>
                  <td style={td}>{row.new_status}</td>
                  <td style={td}>{row.reason || "-"}</td>
                  <td style={td}>
                    {new Date(row.changed_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

const th = {
  border: "1px solid #ccc",
  padding: "10px",
  fontWeight: "bold",
};

const td = {
  border: "1px solid #ccc",
  padding: "8px",
};

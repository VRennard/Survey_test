// src/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// High-contrast defaults for dark backgrounds
ChartJS.defaults.color = "#f2f2f2";
ChartJS.defaults.borderColor = "rgba(255,255,255,0.18)";

const STATEMENTS = [
  "AI-generated deepfakes will determine future elections",
  "Microtargeting with AI can manipulate voters effectively",
  "Most people can't distinguish AI-generated from authentic content",
  "Campaign AI use is primarily deceptive",
  "AI poses a greater threat than voter suppression, gerrymandering, or institutional attacks",
];

const SCALE = [1, 2, 3, 4, 5];
const LABELS = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
};
const COLORS = ["#ff6b6b", "#feca57", "#1dd1a1", "#54a0ff", "#5f27cd"];

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [invalid, setInvalid] = useState(0);

  // Listen to ALL responses, newest first
  useEffect(() => {
    const qy = query(collection(db, "responses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const good = [];
        let bad = 0;
        snap.forEach((d) => {
          const data = d.data();
          if (Array.isArray(data?.ratings) && data.ratings.length === 5) {
            const arr = data.ratings.map((v) => Number(v));
            if (arr.every((x) => Number.isFinite(x) && x >= 1 && x <= 5)) {
              good.push(arr);
            } else {
              bad++;
            }
          } else {
            bad++;
          }
        });
        setRows(good);
        setInvalid(bad);
      },
      (err) => console.error("onSnapshot error:", err)
    );
    return () => unsub();
  }, []);

  // Build per-question distributions: [{1:n,2:n,3:n,4:n,5:n}, ...]
  const distributions = useMemo(() => {
    const dist = STATEMENTS.map(() => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }));
    rows.forEach((arr) =>
      arr.forEach((v, i) => {
        dist[i][v] += 1;
      })
    );
    return dist;
  }, [rows]);

  return (
    <div style={{ maxWidth: 1300, margin: "32px auto", padding: "8px 16px" }}>
      <h1 style={{ marginBottom: 4 }}>Live Results</h1>
      <p style={{ color: "#bdbdbd", marginTop: 0 }}>
        {rows.length} responses loaded
        {invalid ? ` · ${invalid} ignored` : ""} · Scale: 1 = {LABELS[1]}, 5 = {LABELS[5]}
      </p>

      {/* 2×3 grid of charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(360px, 1fr))",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {STATEMENTS.map((q, i) => {
          const data = {
            labels: SCALE.map((n) => `${n} (${LABELS[n]})`),
            datasets: [
              {
                label: "Responses",
                data: SCALE.map((n) => distributions[i][n]),
                backgroundColor: COLORS,
                borderRadius: 6,
                borderWidth: 1,
              },
            ],
          };

          return (
            <div
              key={i}
              style={{
                height: 320,
                padding: "18px 16px",
                background: "#1f1f1f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              }}
            >
              <Bar
                data={data}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: q,
                      color: "#fff",
                      font: { weight: "600", size: 16 },
                      padding: { bottom: 8 },
                    },
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    x: {
                      grid: { color: "rgba(255,255,255,0.08)" },
                      ticks: { autoSkip: false },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(255,255,255,0.12)" },
                      ticks: { stepSize: 1 },
                    },
                  },
                  layout: { padding: { left: 6, right: 6 } },
                  animation: { duration: 250 },
                }}
              />
            </div>
          );
        })}
        {/* sixth grid cell will stay empty (2×3 layout) since we have 5 questions */}
      </div>
    </div>
  );
}

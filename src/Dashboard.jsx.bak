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

// Palette for bars (Rating 1..5)
const COLORS = ["#ff6b6b", "#feca57", "#1dd1a1", "#54a0ff", "#5f27cd"];

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [invalid, setInvalid] = useState(0);

  useEffect(() => {
    // Listen in real time, newest first (createdAt comes from serverTimestamp in Survey.jsx)
    const qy = query(collection(db, "responses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const good = [];
        let bad = 0;
        snap.forEach((d) => {
          const data = d.data();
          if (Array.isArray(data?.ratings) && data.ratings.length === 5) {
            // Coerce to numbers and validate
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
    <div style={{ maxWidth: 1200, margin: "32px auto", padding: "8px 16px" }}>
      <h1 style={{ marginBottom: 4 }}>Live Results</h1>
      <p style={{ color: "#bdbdbd", marginTop: 0 }}>
        {rows.length} responses loaded
        {invalid ? ` · ${invalid} ignored (invalid shape)` : ""}
      </p>

      {STATEMENTS.map((q, i) => {
        const data = {
          labels: SCALE.map((n) => `Rating ${n}`),
          datasets: [
            {
              label: "Responses",
              data: SCALE.map((n) => distributions[i][n]),
              backgroundColor: COLORS,
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        };

        return (
          <div
            key={i}
            style={{
              maxWidth: 720,             // keep chart nicely centered
              height: 320,               // fixed height so it doesn’t squish
              margin: "28px auto",       // centers the card
              padding: "20px 18px",
              background: "#1f1f1f",     // card background (dark)
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
                    color: "#ffffff",
                    font: { weight: "600", size: 16 },
                    padding: { bottom: 10 },
                  },
                  legend: { display: false }, // title already describes the question
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
                layout: { padding: { right: 6, left: 6 } },
                animation: { duration: 250 },
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

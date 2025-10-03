// src/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
ChartJS.defaults.color = "#f2f2f2";
ChartJS.defaults.borderColor = "rgba(255,255,255,0.18)";

const STATEMENTS = [
  "AI-generated deepfakes will determine future elections",
  "Microtargeting with AI can manipulate voters effectively",
  "Most people can't distinguish AI-generated from authentic content",
  "Campaign AI use is primarily deceptive",
  "AI poses a greater threat than voter suppression, gerrymandering, or institutional attacks",
];
const SCALE = [1,2,3,4,5];
const LABELS = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
};
const COLORS = ["#ff6b6b","#feca57","#1dd1a1","#54a0ff","#5f27cd"];
const SURVEY_ID = import.meta.env.VITE_SURVEY_ID ?? "default-survey";

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [invalid, setInvalid] = useState(0);

  useEffect(() => {
    // If you use surveyId, this filters to the current session
    const qy = query(
      collection(db, "responses"),
      where("surveyId", "==", SURVEY_ID),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(qy, (snap) => {
      const good = [];
      let bad = 0;
      snap.forEach(d => {
        const data = d.data();
        if (Array.isArray(data?.ratings) && data.ratings.length === 5) {
          const arr = data.ratings.map(Number);
          if (arr.every(x => Number.isFinite(x) && x>=1 && x<=5)) good.push(arr);
          else bad++;
        } else bad++;
      });
      setRows(good); setInvalid(bad);
    });
    return () => unsub();
  }, []);

  const distributions = useMemo(() => {
    const dist = STATEMENTS.map(() => ({1:0,2:0,3:0,4:0,5:0}));
    rows.forEach(arr => arr.forEach((v,i) => { dist[i][v] += 1; }));
    return dist;
  }, [rows]);

  return (
    <div style={{ maxWidth: 1300, margin: "32px auto", padding: "8px 16px" }}>
      <h1 style={{ marginBottom: 4 }}>Live Results</h1>
      <p style={{ color: "#bdbdbd", marginTop: 0 }}>
        {rows.length} responses loaded{invalid ? ` · ${invalid} ignored` : ""} ·
        &nbsp;Scale: 1 = {LABELS[1]}, 5 = {LABELS[5]}
      </p>

      {/* 2×3 grid of charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(340px, 1fr))",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {STATEMENTS.map((q, i) => {
          const data = {
            labels: SCALE.map(n => `${n} (${LABELS[n]})`),
            datasets: [{
              label: "Responses",
              data: SCALE.map(n => distributions[i][n]),
              backgroundColor: COLORS,
              borderRadius: 6,
              borderWidth: 1,
            }]
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
                  },
                  scales: {
                    x: { grid: { color: "rgba(255,255,255,0.08)" }, ticks: { autoSkip: false } },
                    y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.12)" }, ticks: { stepSize: 1 } },
                  },
                }}
              />
            </div>
          );
        })}
        {/* If you later add a 6th question, it will fill the last grid cell automatically */}
      </div>
    </div>
  );
}

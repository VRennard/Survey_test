// src/Survey.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const STATEMENTS = [
  "AI-generated deepfakes will determine future elections",
  "Microtargeting with AI can manipulate voters effectively",
  "Most people can't distinguish AI-generated from authentic content",
  "Campaign AI use is primarily deceptive",
  "AI poses a greater threat than voter suppression, gerrymandering, or institutional attacks",
];

export default function Survey() {
  const [ratings, setRatings] = useState(Array(STATEMENTS.length).fill(3));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const update = (i, v) => {
    const next = [...ratings];
    next[i] = v;
    setRatings(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "responses"), {
        ratings: ratings.map(Number),
        createdAt: serverTimestamp(),
      });
      setDone(true);
      // OPTIONAL: auto-redirect after 1.5s
      // setTimeout(() => navigate("/dashboard"), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{maxWidth:900, margin:"24px auto", padding:16}}>
        <h2>✅ Thanks! Your response was recorded.</h2>
        <div style={{marginTop:16, display:"flex", gap:12}}>
          <button onClick={() => navigate("/")} type="button">Submit another</button>
          <button onClick={() => navigate("/dashboard")} type="button" style={{background:"#2563eb", color:"#fff"}}>
            View live results →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth:900, margin:"24px auto", padding:16}}>
      <h1>Pre-Course Beliefs Assessment</h1>

      {/* quick link to dashboard even before submitting */}
      <p style={{margin:"8px 0 20px"}}>
        <Link to="/dashboard" style={{color:"#7cc0ff", textDecoration:"underline"}}>
          View live results
        </Link>
      </p>

      <form onSubmit={submit}>
        {STATEMENTS.map((q, i) => (
          <div key={i} style={{margin:"16px 0", padding:12, border:"1px solid #ddd", borderRadius:12}}>
            <div style={{marginBottom:8, fontWeight:600}}>{q}</div>
            {[1,2,3,4,5].map(n => (
              <label key={n} style={{marginRight:12}}>
                <input
                  type="radio"
                  name={`q${i}`}
                  value={n}
                  checked={ratings[i]===n}
                  onChange={() => update(i, n)}
                /> {n}
              </label>
            ))}
          </div>
        ))}

        <div style={{display:"flex", gap:12, alignItems:"center", marginTop:12}}>
          <button disabled={submitting} type="submit" style={{background:"#16a34a", color:"#fff"}}>
            {submitting ? "Submitting..." : "Submit"}
          </button>

          {/* secondary button to jump to dashboard anytime */}
          <button type="button" onClick={() => navigate("/dashboard")}>
            Live results →
          </button>
        </div>
      </form>
    </div>
  );
}

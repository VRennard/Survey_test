// src/Survey.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

const SURVEY_ID = import.meta.env.VITE_SURVEY_ID ?? "default-survey";

export default function Survey() {
  const [ratings, setRatings] = useState(Array(STATEMENTS.length).fill(3));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem(`submitted:${SURVEY_ID}`) === "1") setDone(true);
  }, []);

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
        surveyId: SURVEY_ID,
        ratings: ratings.map(Number),
        createdAt: serverTimestamp(),
      });
      localStorage.setItem(`submitted:${SURVEY_ID}`, "1");
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  // After submit (or already submitted): ONLY "View live results"
  if (done) {
    return (
      <div style={{maxWidth:900, margin:"24px auto", padding:16}}>
        <h2>✅ Thanks! Your response was recorded.</h2>
        <p style={{color:"#aaa"}}>You’ve already participated in this survey on this device.</p>
        <button
          onClick={() => navigate("/dashboard")}
          type="button"
          style={{marginTop:16, padding:"10px 14px", borderRadius:10, background:"#2563eb", color:"#fff"}}
        >
          View live results →
        </button>
      </div>
    );
  }

  return (
    <div style={{maxWidth:900, margin:"24px auto", padding:16}}>
      <h1>Pre-Course Beliefs Assessment</h1>
      <p style={{marginTop:6, color:"#9aa0a6"}}>
        Scale: <strong>1 = {LABELS[1]}</strong> … <strong>5 = {LABELS[5]}</strong>
      </p>

      <form onSubmit={submit}>
        {STATEMENTS.map((q, i) => (
          <div key={i} style={{margin:"18px 0", padding:12, border:"1px solid #333", borderRadius:12}}>
            <div style={{marginBottom:12, fontWeight:600}}>{q}</div>

            <div style={{display:"flex", gap:16, flexWrap:"wrap", alignItems:"center"}}>
              {SCALE.map(n => (
                <label key={n} style={{display:"flex", alignItems:"center", gap:6}}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    value={n}
                    checked={ratings[i]===n}
                    onChange={() => update(i, n)}
                    aria-label={`${n} - ${LABELS[n]}`}
                  />
                  <span style={{fontSize:13}}>
                    {n} <span style={{opacity:0.7}}>({LABELS[n]})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          disabled={submitting}
          type="submit"
          style={{marginTop:12, padding:"10px 14px", borderRadius:10, background:"#16a34a", color:"#fff"}}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

// src/Survey.jsx
import { useState } from "react";
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
        ratings: ratings.map(Number), // [1..5] × 5
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return <h2 style={{padding:20}}>✅ Thanks! Your response was recorded.</h2>;

  return (
    <div style={{maxWidth:900, margin:"24px auto", padding:16}}>
      <h1>Pre-Course Beliefs Assessment</h1>
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
        <button disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</button>
      </form>
      <p style={{marginTop:12,fontSize:12,color:"#666"}}>
        After you submit, open <code>/dashboard</code> in another tab to see live results.
      </p>
    </div>
  );
}

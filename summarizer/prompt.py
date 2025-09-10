from textwrap import dedent

def build_prompt(transcript: str, ctx: dict | None) -> str:
    patient = (ctx or {}).get("patientName") or "Unknown"
    age = (ctx or {}).get("age") or "Unknown"
    sex = (ctx or {}).get("sex") or "Unknown"

    return dedent(f"""
    You are a clinical voice AI assistant that writes post-call summaries for EHRs.
    Summarize the conversation into a compact, clinically useful record.

    STRICT OUTPUT FORMAT: Return a JSON object with EXACT keys:
    - patient_overview (string, 1–3 sentences)
    - key_findings (array of strings, 3–8 bullets)
    - differentials (array of strings, 2–6 items, rank more likely first)
    - decisions (string, 1–4 sentences)
    - next_steps (array of strings, actionable items)
    - followups (array of strings)
    - red_flags (array of strings; if none, return [])

    Patient context:
    - Name: {patient}
    - Age: {age}
    - Sex: {sex}

    Conversation transcript (verbatim):
    ---
    {transcript}
    ---
    """).strip()

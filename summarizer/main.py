import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from models import SummarizeRequest, SummarizeResponse, SummaryJSON
from prompt import build_prompt

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY missing. Set it in .env")

client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="Call Summarizer", version="1.0.0")

# CORS
origins = [o.strip() for o in (os.getenv("CORS_ORIGINS") or "").split(",") if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/summarize", response_model=SummarizeResponse)
def summarize(body: SummarizeRequest):
    """
    Accepts a plain text transcript + optional case context.
    Returns structured JSON and a pretty text block for UI.
    """
    prompt = build_prompt(body.transcript, body.context.dict() if body.context else None)

    try:
        # JSON-safe completion (chat.completions with response_format)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            temperature=0.2,
            messages=[{"role": "user", "content": prompt}],
        )
        content = resp.choices[0].message.content
        data = json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM_error: {e}")

    # Validate/normalize with pydantic
    summary = SummaryJSON.model_validate(data)

    # Human-friendly block for your RN card
    pretty = (
        f"Patient Overview: {summary.patient_overview}\n\n"
        f"Key Findings:\n- " + "\n- ".join(summary.key_findings or ["—"]) + "\n\n"
        f"Differentials:\n- " + "\n- ".join(summary.differentials or ["—"]) + "\n\n"
        f"Decisions: {summary.decisions or '—'}\n\n"
        f"Next Steps:\n- " + "\n- ".join(summary.next_steps or ["—"]) + "\n\n"
        f"Follow-ups:\n- " + "\n- ".join(summary.followups or ["—"]) + "\n\n"
        f"Red Flags:\n- " + "\n- ".join(summary.red_flags or ["—"])
    )

    return SummarizeResponse(ok=True, summary_json=summary, pretty_text=pretty)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, log_level="info",reload=True)
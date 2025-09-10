from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

class CaseContext(BaseModel):
    patientName: Optional[str] = None
    age: Optional[str | int] = None
    sex: Optional[str] = None

class SummarizeRequest(BaseModel):
    transcript: str = Field(..., description="Plain text transcript")
    context: Optional[CaseContext] = None

class SummaryJSON(BaseModel):
    patient_overview: str
    key_findings: List[str] = []
    differentials: List[str] = []
    decisions: str = ""
    next_steps: List[str] = []
    followups: List[str] = []
    red_flags: List[str] = []

class SummarizeResponse(BaseModel):
    ok: Literal[True] = True
    summary_json: SummaryJSON
    pretty_text: str

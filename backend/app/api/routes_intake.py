from pathlib import Path
from typing import Dict

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.intake_store import save_latest_intake
from app.services.store import reset_review, update_review

router = APIRouter()

ROOT = Path(__file__).resolve().parents[3]
ARTIFACT_DIR = ROOT / "data" / "demo_artifacts" / "ai_ticket_summarizer"


class ReviewIntake(BaseModel):
    title: str
    owner: str = "Product Team"
    target_launch: str = "Next Friday"
    description: str = ""
    artifacts: Dict[str, str]


@router.post("")
def create_review_from_context(payload: ReviewIntake):
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    for filename, content in payload.artifacts.items():
        safe_name = filename.replace("/", "_").replace("\\", "_")
        (ARTIFACT_DIR / safe_name).write_text(content or "", encoding="utf-8")

    latest = {
        "title": payload.title,
        "owner": payload.owner,
        "target_launch": payload.target_launch,
        "description": payload.description,
        "artifact_names": list(payload.artifacts.keys()),
    }
    save_latest_intake(latest)

    review_id = "rev_ai_ticket_summarizer"
    reset_review(review_id)

    review = update_review(
        review_id,
        title=payload.title,
        description=payload.description,
        status="CONTEXT_UPLOADED",
        decision="Ready for Agent Review",
        riskScore=0,
        riskLevel="Unscored",
        intake={
            "owner": payload.owner,
            "target_launch": payload.target_launch,
            "artifact_count": len(payload.artifacts),
            "artifact_names": list(payload.artifacts.keys()),
        },
    )

    return {
        "ok": True,
        "message": "Review context uploaded",
        "review_id": review_id,
        "artifact_dir": str(ARTIFACT_DIR),
        "review": review,
    }

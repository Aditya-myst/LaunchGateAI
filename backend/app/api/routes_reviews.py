from fastapi import APIRouter
from pydantic import BaseModel

from app.services.demo_runner import start_demo_review
from app.services.review_history import load_history
from app.services.store import get_review, reset_review, update_review

router = APIRouter()


class ReviewCreate(BaseModel):
    title: str
    description: str = ""


class HumanDecision(BaseModel):
    decision: str
    reason: str = ""


@router.post("")
def create_review(payload: ReviewCreate):
    review = reset_review("rev_custom")
    review = update_review(
        "rev_custom",
        title=payload.title,
        description=payload.description,
        status="INTAKE_RECEIVED",
        decision="Not Started",
    )
    return review


@router.get("/{review_id}")
def get_review_by_id(review_id: str):
    return get_review(review_id)


@router.post("/{review_id}/reset")
def reset_review_by_id(review_id: str):
    return reset_review(review_id)


@router.post("/{review_id}/start")
def start_review(review_id: str):
    return start_demo_review(review_id)


@router.post("/{review_id}/human-decision")
def submit_human_decision(review_id: str, payload: HumanDecision):
    return update_review(
        review_id,
        status="HUMAN_DECISION_RECORDED",
        decision=payload.decision,
        humanDecision={
            "decision": payload.decision,
            "reason": payload.reason,
        },
    )

@router.get("/history/list")
def list_review_history():
    return {
        "items": load_history()
    }
from fastapi import APIRouter, Response

from app.services.dossier_service import build_dossier_markdown

router = APIRouter()


@router.get("/{review_id}/dossier")
def get_dossier(review_id: str):
    markdown = build_dossier_markdown(review_id)
    return {
        "review_id": review_id,
        "format": "markdown",
        "content": markdown,
    }


@router.get("/{review_id}/dossier.md")
def download_dossier(review_id: str):
    markdown = build_dossier_markdown(review_id)
    return Response(
        content=markdown,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="launchgate-{review_id}-dossier.md"'
        },
    )

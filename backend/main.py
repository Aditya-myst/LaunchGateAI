import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_dossier import router as dossier_router
from app.api.routes_demo import router as demo_router
from app.api.routes_reviews import router as reviews_router
from app.api.routes_intake import router as intake_router
from app.api.routes_agent_events import router as agent_events_router
from app.api.routes_band import router as band_router

WEB_ORIGIN = os.getenv("WEB_ORIGIN")

app = FastAPI(
    title="LaunchGate AI API",
    version="1.0.0",
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

if WEB_ORIGIN:
    origins.append(WEB_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://launchgate-pi.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(band_router, prefix="/api/band", tags=["band"])
app.include_router(intake_router, prefix="/api/intake", tags=["intake"])
app.include_router(dossier_router, prefix="/api/reviews", tags=["dossier"])
app.include_router(demo_router, prefix="/api/demo", tags=["Demo"])
app.include_router(reviews_router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(agent_events_router, prefix="/api/agent-events", tags=["agent-events"])

@app.get("/health")
def health():
    return {"status": "ok",
            "services":"LaunchGate AI API",
            "version":"1.0.0",
            "message":"API is healthy and running"
    }
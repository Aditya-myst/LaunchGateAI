# Setup Guide

## 1. Install Dependencies

### Backend

```bash
cd backend
uv sync
```

### Frontend

```bash
cd apps/web
pnpm install
```

### Agents

```bash
cd agents
uv sync
```

---

## 2. Configure Environment

Create a `.env` file in the project root:

```env
BAND_REST_URL=https://app.band.ai
BAND_WS_URL=wss://app.band.ai/api/v1/socket/websocket
BAND_REVIEW_ROOM_ID=your_band_room_id

AIMLAPI_API_KEY=your_aimlapi_key
AIMLAPI_BASE_URL=https://api.aimlapi.com/v1

API_BASE_URL=http://localhost:8000
```

---

## 3. Configure Band Agents

Create an `agent_config.yaml` file in the project root:

```yaml
coordinator:
  agent_id: "..."
  api_key: "..."

security:
  agent_id: "..."
  api_key: "..."

privacy_compliance:
  agent_id: "..."
  api_key: "..."

engineering:
  agent_id: "..."
  api_key: "..."

qa_test:
  agent_id: "..."
  api_key: "..."

decision_arbiter:
  agent_id: "..."
  api_key: "..."
```

---

## 4. Create Band Room

In Band:

1. Create a chat room.
2. Add the following remote agents:

   * LaunchGate Coordinator
   * Security Review
   * Privacy Compliance
   * Engineering Readiness
   * QA Test
   * Decision Arbiter
3. Copy the room ID from the URL.
4. Add it to your `.env` file as:

```env
BAND_REVIEW_ROOM_ID=your_band_room_id
```

---

## 5. Run the Application

### Backend

```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd apps/web
pnpm dev
```

### Agents

```bash
cd agents
uv run python run_all.py
```

---

## 6. Demo

Open:

```text
http://localhost:3000
```

Then navigate to:

```text
/reviews/new
```

Load the sample context and click **Start Agent Review** to begin the Band-powered review workflow.

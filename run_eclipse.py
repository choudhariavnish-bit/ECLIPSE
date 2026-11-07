"""
ECLIPSE Engine — Server Launcher
Member 3 — AI & Prompt Engineer
"""

import os
import sys
import uvicorn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AI_ENGINE_DIR = os.path.join(BASE_DIR, "ai-engine")

if AI_ENGINE_DIR not in sys.path:
    sys.path.insert(0, AI_ENGINE_DIR)

if __name__ == "__main__":
    os.chdir(AI_ENGINE_DIR)
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    print("\n" + "=" * 65)
    print("  LAUNCHING ECLIPSE ENGINE")
    print(f"  Swagger API Docs: http://localhost:{port}/docs")
    print(f"  Interactive Demo: http://localhost:{port}/")
    print(f"  Health Check:     http://localhost:{port}/api/v1/health")
    print("=" * 65 + "\n")

    uvicorn.run("app.main:app", host=host, port=port, reload=True)

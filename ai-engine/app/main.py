import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from schemas.request_schema import ReviewRequest, ChatRequest, ChatResponse
from schemas.audit_schema import BrandAuditReport
from app.review_engine import review_engine
from app.gemini_client import gemini_client
from app.prompt_engine import PromptEngine
from app.brand_retriever import brand_retriever
from app.system_prompt import ECLIPSE_IDENTITY

# Initialize FastAPI app
app = FastAPI(
    title="ECLIPSE AI Engine",
    description="The Intelligent Brand Governance & Fact Verification Layer. Developed by Member 3 (AI & Prompt Engineer).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    """Returns ECLIPSE operational status and Gemini configuration."""
    return {
        "status": "online",
        "engine": ECLIPSE_IDENTITY["name"],
        "title": ECLIPSE_IDENTITY["title"],
        "powered_by": ECLIPSE_IDENTITY["powered_by"],
        "version": ECLIPSE_IDENTITY["engine_version"],
        "model": gemini_client.model,
        "live_gemini_active": gemini_client.is_live(),
        "project": ECLIPSE_IDENTITY["project"]
    }

@app.post("/api/v1/review", response_model=BrandAuditReport)
def review_content_endpoint(request: ReviewRequest):
    """
    Core Pipeline Endpoint:
    Reviews marketing content, identifies brand violations, verifies facts,
    calculates compliance score, and recommends corrections.
    """
    try:
        report = review_engine.review_content(request)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ECLIPSE review processing error: {str(e)}")

@app.post("/api/v1/chat", response_model=ChatResponse)
def chat_with_eclipse(request: ChatRequest):
    """
    Conversational ECLIPSE Brand Assistant Endpoint:
    Consult with ECLIPSE on brand guidelines, wording questions, or claim verifications.
    """
    try:
        history_dicts = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []
        prompt = PromptEngine.build_chat_prompt(request.message, history_dicts)
        response_text = gemini_client.ask_eclipse(prompt, as_json=False)
        return ChatResponse(
            engine_name="ECLIPSE",
            powered_by="Google Gemini",
            reply=response_text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ECLIPSE chat error: {str(e)}")

@app.get("/api/v1/rules")
def get_brand_rules():
    """Returns active brand guidelines and prohibited terms loaded in ECLIPSE."""
    return brand_retriever.guidelines

@app.get("/api/v1/facts")
def get_verified_facts():
    """Returns the verified facts database used by ECLIPSE for claim verification."""
    return brand_retriever.facts

@app.get("/", response_class=HTMLResponse)
def serve_playground():
    """
    Interactive Web Playground for ECLIPSE Brand Governance Assistant.
    Provides instant live testing for hackathon demos.
    """
    return """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ECLIPSE AI Engine</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --card-border: #1f293d;
      --accent-purple: #8b5cf6;
      --accent-cyan: #06b6d4;
      --text-main: #f3f4f6;
      --text-dim: #9ca3af;
      --danger: #ef4444;
      --warning: #f59e0b;
      --success: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.5;
      padding: 24px;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 20px;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-badge {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #7c3aed, #06b6d4);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      color: white;
      box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
    }
    h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .subtitle { color: var(--text-dim); font-size: 14px; }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: 24px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 22px;
    }
    h2 { font-size: 18px; margin-bottom: 14px; color: #fff; }
    textarea {
      width: 100%;
      height: 160px;
      background: #0d1322;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 14px;
      color: #fff;
      font-size: 14px;
      resize: vertical;
      font-family: inherit;
    }
    textarea:focus { outline: none; border-color: var(--accent-purple); }
    .controls {
      display: flex;
      gap: 12px;
      margin-top: 14px;
    }
    select, button {
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    select {
      background: #162032;
      color: #fff;
      border: 1px solid var(--card-border);
    }
    .btn-primary {
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white;
      border: none;
      flex: 1;
      transition: transform 0.15s, opacity 0.15s;
    }
    .btn-primary:hover { opacity: 0.95; transform: translateY(-1px); }
    .btn-quick {
      background: #1f2937;
      color: #93c5fd;
      border: 1px solid #374151;
      padding: 6px 10px;
      font-size: 12px;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .quick-list { display: flex; gap: 8px; margin-bottom: 12px; }
    
    .score-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-radius: 10px;
      background: #151d30;
      margin-bottom: 18px;
      border-left: 5px solid var(--accent-purple);
    }
    .score-circle {
      font-size: 32px;
      font-weight: 800;
      color: var(--accent-cyan);
    }
    .badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-critical { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    .badge-high { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .badge-verified { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .badge-unsupported { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .badge-refuted { background: rgba(239, 68, 68, 0.2); color: #f87171; }

    .item-box {
      background: #0f172a;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .problem-text {
      color: #f87171;
      font-weight: 600;
    }
    .fix-box {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px;
      padding: 14px;
      margin-top: 14px;
    }
    .chat-section {
      margin-top: 24px;
      border-top: 1px solid var(--card-border);
      padding-top: 18px;
    }
    .chat-output {
      background: #0d1322;
      border-radius: 8px;
      padding: 12px;
      height: 120px;
      overflow-y: auto;
      font-size: 13px;
      color: #cbd5e1;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="brand-title">
      <div class="logo-badge">E</div>
      <div>
        <h1>ECLIPSE AI Engine</h1>
        <div class="subtitle">Intelligent Brand Governance Assistant &bull; Powered by Google Gemini</div>
      </div>
    </div>
  </div>

  <div class="container">
    <!-- Input Section -->
    <div class="card">
      <h2>Submit Marketing Content</h2>
      <div class="quick-list">
        <button class="btn-quick" onclick="loadSample(1)">Sample 1: Violations & Exaggerations</button>
        <button class="btn-quick" onclick="loadSample(2)">Sample 2: Compliant B2B Copy</button>
      </div>

      <textarea id="contentInput" placeholder="Paste marketing ad copy, email, headline, or document here..."></textarea>

      <div class="controls">
        <select id="channelSelect">
          <option value="social_media">Social Media Post</option>
          <option value="ad_copy">Advertisement Copy</option>
          <option value="email">Marketing Email</option>
          <option value="blog_post">Blog Post / Article</option>
        </select>
        <button class="btn-primary" onclick="runReview()" id="btnReview">Run ECLIPSE Audit</button>
      </div>

      <div class="chat-section">
        <h2>Ask ECLIPSE Brand Assistant</h2>
        <div id="chatOutput" class="chat-output">ECLIPSE: Hello! I am ECLIPSE, your AI brand governance assistant. Ask me questions about brand tone, prohibited terminology, or factual claims.</div>
        <div style="display:flex; gap:8px;">
          <input type="text" id="chatInput" placeholder="Ask ECLIPSE (e.g. Can I claim 100% bug-free?)" style="flex:1; background:#0d1322; border:1px solid #1f293d; color:#fff; padding:8px 12px; border-radius:6px;">
          <button class="btn-primary" style="flex:0; padding:8px 16px;" onclick="sendChat()">Send</button>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="card" id="resultsCard">
      <h2>ECLIPSE Audit Report</h2>
      <div id="placeholderMsg" style="color:var(--text-dim); padding:40px 0; text-align:center;">
        Submit content on the left to generate real-time brand governance analysis, fact verification, and recommended corrections.
      </div>
      
      <div id="reportContent" style="display:none;">
        <div class="score-banner">
          <div>
            <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase;">Compliance Score</div>
            <div class="score-circle" id="scoreValue">85</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px; color:var(--text-dim);">Decision</div>
            <span id="statusBadge" class="badge">APPROVED</span>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="font-size:13px; font-weight:700; color:#cbd5e1; margin-bottom:4px;">Executive Summary</div>
          <p id="summaryText" style="font-size:14px; color:#9ca3af;"></p>
        </div>

        <div style="margin-bottom:16px;">
          <div style="font-size:13px; font-weight:700; color:#cbd5e1; margin-bottom:6px;">Detected Violations</div>
          <div id="violationsList"></div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="font-size:13px; font-weight:700; color:#cbd5e1; margin-bottom:6px;">Fact Verification</div>
          <div id="factsList"></div>
        </div>

        <div class="fix-box">
          <div style="font-size:13px; font-weight:700; color:#34d399; margin-bottom:6px;">Recommended Compliant Copy</div>
          <div id="recommendedFix" style="font-size:14px; color:#f3f4f6;"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const sample1 = "Switch to eclipse now! Our revolutionary AI is 100% bug-free with 100% uptime guaranteed. We destroy our competitors and guarantee cheap pricing with guaranteed profit. Over 50,000 customers love us!";
    const sample2 = "Empower your marketing team with ECLIPSE. Our enterprise platform delivers a 99.99% uptime SLA and reduces brand review turnaround times by 78%. Trusted by over 10,000 teams globally.";

    function loadSample(n) {
      document.getElementById('contentInput').value = n === 1 ? sample1 : sample2;
    }

    async function runReview() {
      const content = document.getElementById('contentInput').value.trim();
      const channel = document.getElementById('channelSelect').value;
      if (!content) return alert("Please enter text to review.");

      const btn = document.getElementById('btnReview');
      btn.innerText = "Analyzing with ECLIPSE...";
      btn.disabled = true;

      try {
        const res = await fetch('/api/v1/review', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ content, channel })
        });
        const data = await res.json();

        document.getElementById('placeholderMsg').style.display = 'none';
        document.getElementById('reportContent').style.display = 'block';

        document.getElementById('scoreValue').innerText = data.compliance_score;
        const badge = document.getElementById('statusBadge');
        badge.innerText = data.status.toUpperCase();
        badge.className = 'badge ' + (data.status === 'approved' ? 'badge-verified' : data.status === 'rejected' ? 'badge-critical' : 'badge-high');

        document.getElementById('summaryText').innerText = data.summary;

        // Violations
        const vList = document.getElementById('violationsList');
        vList.innerHTML = '';
        if (data.violations && data.violations.length > 0) {
          data.violations.forEach(v => {
            vList.innerHTML += `
              <div class="item-box">
                <div class="item-header">
                  <span class="problem-text">"${v.problematic_text}"</span>
                  <span class="badge badge-${v.severity}">${v.severity}</span>
                </div>
                <div style="font-size:12px; color:#cbd5e1;">${v.explanation}</div>
                <div style="font-size:12px; color:#34d399; margin-top:4px;">&rarr; ${v.suggestion}</div>
              </div>
            `;
          });
        } else {
          vList.innerHTML = '<div style="font-size:13px; color:#34d399;">No guideline violations detected.</div>';
        }

        // Facts
        const fList = document.getElementById('factsList');
        fList.innerHTML = '';
        if (data.fact_checks && data.fact_checks.length > 0) {
          data.fact_checks.forEach(f => {
            fList.innerHTML += `
              <div class="item-box">
                <div class="item-header">
                  <span style="color:#e2e8f0; font-weight:600;">${f.claim_text}</span>
                  <span class="badge badge-${f.status}">${f.status}</span>
                </div>
                <div style="font-size:12px; color:#9ca3af;">${f.evidence}</div>
                ${f.source_ref ? `<div style="font-size:11px; color:#60a5fa; margin-top:2px;">Ref: ${f.source_ref}</div>` : ''}
              </div>
            `;
          });
        } else {
          fList.innerHTML = '<div style="font-size:13px; color:#9ca3af;">No empirical claims detected.</div>';
        }

        document.getElementById('recommendedFix').innerText = data.recommended_correction || "Content looks great!";
      } catch (err) {
        alert("Error executing review: " + err);
      } finally {
        btn.innerText = "Run ECLIPSE Audit";
        btn.disabled = false;
      }
    }

    async function sendChat() {
      const input = document.getElementById('chatInput');
      const msg = input.value.trim();
      if (!msg) return;

      const output = document.getElementById('chatOutput');
      output.innerHTML += `\\nUser: ${msg}`;
      input.value = '';

      try {
        const res = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ message: msg })
        });
        const data = await res.json();
        output.innerHTML += `\\nECLIPSE: ${data.reply}\\n`;
        output.scrollTop = output.scrollHeight;
      } catch (err) {
        output.innerHTML += `\\nECLIPSE: Error connecting to engine.\\n`;
      }
    }
  </script>
</body>
</html>
    """

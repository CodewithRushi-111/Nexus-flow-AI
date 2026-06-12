import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple fallback rule-based analyzer when GEMINI_API_KEY is not defined
function runRuleBasedAnalyzer(query: string, context: any) {
  const q = query.toLowerCase();
  const { zones, stats, alerts, staff, activeIncidentMode } = context;

  if (q.includes('critical') || q.includes('congest') || q.includes('overcrowd') || q.includes('bottleneck')) {
    const criticalZones = zones.filter((z: any) => z.density === 'critical' || z.density === 'high');
    if (criticalZones.length === 0) {
      return "Flow systems are currently operating normally. No sectors have exceeded density thresholds.";
    }
    const list = criticalZones.map((z: any) => `- **${z.name}** in ${z.section}: Currently running at **${Math.round((z.current/z.capacity)*100)}%** capacity with a **${z.waitTime} minute** wait.`).join('\n');
    return `Analysis shows high-density bottlenecks in the following locations:\n\n${list}\n\n**Recommendation:** Trigger detours in adjacent zones and dispatch auxiliary personnel to guide flow.`;
  }

  if (q.includes('wait') || q.includes('longest') || q.includes('queue') || q.includes('restroom')) {
    const sortedZones = [...zones].sort((a: any, b: any) => b.waitTime - a.waitTime);
    const top = sortedZones[0];
    const rest = sortedZones.slice(1, 3).map((z: any) => `${z.name} (${z.waitTime}m)`).join(', ');
    return `The longest queue is currently at **${top.name}** with a wait time of **${top.waitTime} minutes** (${top.current} visitors). Other high wait times: ${rest}.\n\n**Recommendation:** Direct visitors to nearby alternatives like ${sortedZones[sortedZones.length - 1].name} which has a wait time of ${sortedZones[sortedZones.length - 1].waitTime}m.`;
  }

  if (q.includes('staff') || q.includes('officer') || q.includes('medic') || q.includes('deploy')) {
    const idleStaff = staff.filter((s: any) => s.status === 'idle');
    const busyStaff = staff.filter((s: any) => s.status !== 'idle');
    return `**Crew Deployment Status:**\n- **Available (Idle):** ${idleStaff.length} members (${idleStaff.map((s: any) => s.name).join(', ') || 'None'})\n- **Active (Deployed):** ${busyStaff.length} members.\n\nTo deploy staff, click on any hotspot dot on the **Spatial Map** or select a zone and use the Dispatch console.`;
  }

  if (q.includes('summary') || q.includes('report') || q.includes('overall') || q.includes('status')) {
    const criticalZones = zones.filter((z: any) => z.density === 'critical');
    return `### NexusFlow AI Executive Report\n\n- **Live Occupancy:** ${stats.liveOccupancy.toLocaleString()} / ${stats.totalCapacity.toLocaleString()} (${Math.round((stats.liveOccupancy/stats.totalCapacity)*100)}%)\n- **Optimization Index:** **${stats.aiOptimizationScore}%**\n- **Operational Alerts:** ${stats.activeAlertsCount} active\n- **Active Protocol:** \`${activeIncidentMode.toUpperCase()}\`\n- **Congested Sectors:** ${criticalZones.length} (${criticalZones.map((z: any) => z.name).join(', ') || 'None'})\n\n**System Health:** Systems are functional. The simulation engine is active.`;
  }

  // General fallback
  return `I have processed your query: "${query}" against the live telemetry.\n\n*Note: Google Gemini Core is operating in Simulator Heuristics mode (GEMINI_API_KEY environment variable is not defined).* \n\n**Live Telemetry Status:**\n- Live Occupancy is **${stats.liveOccupancy.toLocaleString()}**.\n- AI flow optimization score is **${stats.aiOptimizationScore}%**.\n- Active protocol is **${activeIncidentMode}**.\n\nTry asking specific questions like "Which zone has the longest wait time?" or "List all congestion hotspots".`;
}

export async function POST(request: Request) {
  try {
    const { query, context } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful local rule fallback
      const reply = runRuleBasedAnalyzer(query, context);
      return NextResponse.json({ reply, mode: 'fallback' });
    }

    // Call real Google Gemini API
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const promptEnvelope = `
You are the NexusFlow AI Venue Operations Copilot, an advanced neural-link assistant managing a major events arena.
You are helping the venue operators optimize crowd flow, resolve bottlenecks, and manage responses.

Here is the current live JSON telemetry of the stadium:
==================================
Active Incident Mode: ${context.activeIncidentMode}
Overall Stats: ${JSON.stringify(context.stats)}
Zones Data: ${JSON.stringify(context.zones)}
Active Alerts: ${JSON.stringify(context.alerts)}
Staff Deployments: ${JSON.stringify(context.staff)}
==================================

Guidelines:
1. Provide highly structured, actionable, and operations-focused answers.
2. Use markdown bolding, lists, and bullet points. Keep it clear and readable.
3. Be professional and act like an AI running inside an advanced operations center.
4. Keep answers brief and concise.

User Query: "${query}"

Assistant Response:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promptEnvelope }] }],
    });

    const reply = result.response.text();
    return NextResponse.json({ reply, mode: 'gemini' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating content: ' + error.message },
      { status: 500 }
    );
  }
}

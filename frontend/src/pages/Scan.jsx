import React, { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeCanvas } from "qrcode.react";
import { api } from "../api";
import { Card, CardBody, Pill, Button, Field, Select } from "../ui";

// Mobile-first scan flow:
// 1) Scan Site QR
// 2) Scan Partner QR (short token shown on partner phone)
// 3) Send geolocation + start check-in

function QrScanner({ onResult, enabled }) {
  const id = useMemo(() => `qr-${Math.random().toString(16).slice(2)}`, []);
  const qrRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const qrcode = new Html5Qrcode(id);
    qrRef.current = qrcode;

    (async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        const camId = cameras?.[0]?.id;
        if (!camId) return;
        await qrcode.start(
          camId,
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
          },
          (decodedText) => {
            if (cancelled) return;
            onResult(decodedText);
          }
        );
      } catch (e) {
        // Ignore in POC: camera denied / no camera.
      }
    })();

    return () => {
      cancelled = true;
      try {
        qrcode.stop().catch(() => {});
      } catch {}
      try {
        qrcode.clear();
      } catch {}
    };
  }, [enabled, id, onResult]);

  return (
    <div className="scanFrame">
      <div id={id} className="scanViewport" />
      <div className="scanHint">Place the QR in the frame</div>
    </div>
  );
}

function useGeo(enabled) {
  const [geo, setGeo] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy_m: pos.coords.accuracy,
        });
      },
      (e) => setError(e.message),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [enabled]);
  return { geo, error };
}

export default function Scan() {
  const [sites, setSites] = useState([]);
  const [siteCode, setSiteCode] = useState("");
  const [partnerToken, setPartnerToken] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [myToken, setMyToken] = useState(null);
  const [session, setSession] = useState(null);
  const { geo, error: geoErr } = useGeo(true);

  useEffect(() => {
    api.sites().then(setSites).catch(() => {});
  }, []);

  async function createMyToken() {
    setMsg("");
    try {
      const t = await api.createPeerToken();
      setMyToken(t);
    } catch (e) {
      setMsg(String(e.message || e));
    }
  }

  async function start() {
    setBusy(true);
    setMsg("");
    try {
      const s = await api.startMobileCheckin({
        site_code: siteCode,
        partner_token: partnerToken.trim(),
        note,
        geo: geo || null,
      });
      setSession(s);
      setMsg("Validation successful. Session started.");
    } catch (e) {
      setMsg(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  const siteOptions = sites.map((s) => ({
    value: s.code,
    label: `${s.city} — ${s.name} (${s.code})`,
  }));

  // Parse QR payloads:
  // - Site QR can be the raw code (CTN-DEPOT) or "SITE:CTN-DEPOT"
  // - Partner QR is "PEER:<token>"
  const handleSiteScan = (text) => {
    const t = text.trim();
    const code = t.startsWith("SITE:") ? t.slice(5) : t;
    setSiteCode(code);
    setStep(2);
  };
  const handlePeerScan = (text) => {
    const t = text.trim();
    const tok = t.startsWith("PEER:") ? t.slice(5) : t;
    setPartnerToken(tok);
    setStep(3);
  };

  return (
    <div className="mobileShell">
      <div className="mobileGrid">
        <div>
          <div className="mobileHeader">
            <div className="brandMark" />
            <div>
              <div className="mobileTitle">Secure Access</div>
              <div className="mobileSubtitle">Two-person presence • QR + Geo • Privacy-first</div>
            </div>
          </div>

          <Card className="mobileCard">
            <CardBody>
              <div className="rowBetween">
                <div>
                  <div className="sectionTitle">Site Presence</div>
                  <div className="muted">Step {step} / 3</div>
                </div>
                <Pill tone={geo ? "ok" : "warn"}>{geo ? "GPS ACTIVE" : "GPS…"}</Pill>
              </div>

              {geoErr ? <div className="error">Geo error: {geoErr}</div> : null}

              {step === 1 ? (
                <>
                  <div className="stepLabel">Step 1: Scan site QR</div>
                  <QrScanner enabled={true} onResult={handleSiteScan} />
                  <div className="divider" />
                  <div className="muted">No camera? Pick a site manually (POC).</div>
                  <Select label="Site" value={siteCode} onChange={setSiteCode} options={siteOptions} />
                  <Button full disabled={!siteCode} onClick={() => setStep(2)}>Continue</Button>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <div className="stepLabel">Step 2: Scan partner QR</div>
                  <div className="muted">Partner shows a QR generated in the app (token expires fast).</div>
                  <QrScanner enabled={true} onResult={handlePeerScan} />
                  <div className="divider" />
                  <Field label="Partner token (fallback)" value={partnerToken} onChange={setPartnerToken} placeholder="e.g. 6X3KQ9" />
                  <div className="rowBetween">
                    <Button tone="ghost" onClick={() => setStep(1)}>Back</Button>
                    <Button disabled={!partnerToken} onClick={() => setStep(3)}>Continue</Button>
                  </div>
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <div className="stepLabel">Step 3: Validate & start session</div>
                  <Select label="Site" value={siteCode} onChange={setSiteCode} options={siteOptions} />
                  <Field label="Partner token" value={partnerToken} onChange={setPartnerToken} />
                  <Field label="Note (optional)" value={note} onChange={setNote} placeholder="Optional notes…" />
                  <Button full disabled={!siteCode || !partnerToken || busy} onClick={start}>
                    {busy ? "Starting…" : "Proceed to Site"}
                  </Button>
                  <Button full tone="ghost" onClick={() => setStep(2)}>Back</Button>
                </>
              ) : null}

              {msg ? <div className={msg.toLowerCase().includes("success") ? "ok" : "error"}>{msg}</div> : null}
              {session ? (
                <div className="ok small">
                  Session ID: <b>{session.id}</b> — status <b>{session.status}</b>
                </div>
              ) : null}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card className="mobileCard">
            <CardBody>
              <div className="sectionTitle">Verify Peer</div>
              <div className="muted">Show this QR to your partner so they can scan you.</div>
              <div className="qrWrap">
                {myToken ? (
                  <>
                    <QRCodeCanvas value={`PEER:${myToken.token}`} size={220} includeMargin />
                    <div className="mono">PEER:{myToken.token}</div>
                    <div className="muted small">Expires: {new Date(myToken.expires_at).toLocaleTimeString()}</div>
                  </>
                ) : (
                  <div className="muted">No token yet.</div>
                )}
              </div>
              <Button full onClick={createMyToken}>Generate Partner QR</Button>
              <div className="divider" />
              <div className="muted small">
                Pro idea: random biometric challenges during the session + geofence drift alerts.
              </div>
            </CardBody>
          </Card>

          <Card className="mobileCard" style={{ marginTop: 16 }}>
            <CardBody>
              <div className="sectionTitle">Live Geo (POC)</div>
              <div className="muted small">This POC stores periodic pings and raises GEO_DRIFT anomaly &gt; 200m.</div>
              <div className="mono">
                {geo ? `${geo.lat.toFixed(6)}, ${geo.lng.toFixed(6)} (±${Math.round(geo.accuracy_m || 0)}m)` : "waiting…"}
              </div>
              {session ? (
                <Button
                  full
                  tone="ghost"
                  onClick={async () => {
                    if (!geo) return;
                    try {
                      await api.heartbeat(session.id, { geo });
                      setMsg("Heartbeat sent.");
                    } catch (e) {
                      setMsg(String(e.message || e));
                    }
                  }}
                >
                  Send heartbeat now
                </Button>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

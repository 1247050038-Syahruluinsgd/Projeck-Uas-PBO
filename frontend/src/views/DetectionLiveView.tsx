import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  CheckCircle,
  XSquare,
  RefreshCcw,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Award,
  Loader2,
  Cpu,
  VideoOff,
  ZapIcon
} from 'lucide-react';
import { Gender, StudentRecord } from '../types';
import { ASSET_URLS } from '../data';

interface DetectionLiveViewProps {
  studentData: {
    fullName: string;
    userId: string;
    whatsapp: string;
    gender: Gender;
    hasHijab: boolean;
  };
  onSaveScan: (newRecord: StudentRecord) => void;
  onCancel: () => void;
}

export default function DetectionLiveView({ studentData, onSaveScan, onCancel }: DetectionLiveViewProps) {
  // Common states for both genders
  const [nametagOk, setNametagOk] = useState(true);
  const [kemejaPutihOk, setKemejaPutihOk] = useState(true);
  const [sabukOk, setSabukOk] = useState(true);

  // Female states
  const [kerudungPinkOk, setKerudungPinkOk] = useState(studentData.gender === 'Female' ? studentData.hasHijab : false);
  const [rokHitamOk, setRokHitamOk] = useState(studentData.gender === 'Female');

  // Male states
  const [celanaHitamOk, setCelanaHitamOk] = useState(studentData.gender === 'Male');

  const [ticker, setTicker] = useState(0);

  // ── Webcam States ──
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);

  // ── AI Detection States ──
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);

  // Simple scan lines animation simulation trigger
  useEffect(() => {
    const handle = setInterval(() => {
      setTicker(t => (t + 1) % 100);
    }, 150);
    return () => clearInterval(handle);
  }, []);

  // ── Start Camera on Mount ──
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Akses kamera ditolak. Silakan izinkan akses kamera di browser Anda lalu muat ulang halaman.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('Tidak ditemukan kamera pada perangkat ini.');
      } else {
        setCameraError('Gagal membuka kamera: ' + (err.message || 'Error tidak diketahui.'));
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup: turn off camera when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  // ── Capture frame and send to AI ──
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally (mirror) so captured image matches preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get data URL for preview
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedFrame(dataUrl);

    setIsAnalyzing(true);
    setAiError(null);
    setAiSuccess(false);

    try {
      // Convert canvas to Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas is empty')), 'image/jpeg', 0.9);
      });

      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/detection/analyze', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.attributes) {
        // Map hasil AI ke state frontend
        const attrs: { code: string; detected: boolean }[] = data.attributes;
        const get = (code: string) => attrs.find(a => a.code === code)?.detected ?? false;

        setKemejaPutihOk(get('kemeja_benar'));
        setNametagOk(get('nametag_ada'));
        setSabukOk(get('sabuk_ada'));

        if (studentData.gender === 'Female') {
          setKerudungPinkOk(get('kerudung_benar'));
          setRokHitamOk(get('rok_benar'));
        } else {
          setCelanaHitamOk(get('celana_benar'));
        }

        setAiSuccess(true);
      } else {
        throw new Error(data.message || 'Respons dari server tidak valid.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Gagal menghubungi AI server. Pastikan backend dan AI server sudah berjalan.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Retake photo (go back to live view) ──
  const handleRetake = () => {
    setCapturedFrame(null);
    setAiSuccess(false);
    setAiError(null);
  };

  // Determine overall status based on gender criteria
  const isAllComplete = studentData.gender === 'Female'
    ? (nametagOk && kemejaPutihOk && sabukOk && kerudungPinkOk && rokHitamOk)
    : (nametagOk && kemejaPutihOk && sabukOk && celanaHitamOk);

  const handleSave = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newRecord: StudentRecord = {
      id: String(Math.floor(Math.random() * 1000)),
      profileUrl: capturedFrame ?? (studentData.gender === 'Female'
        ? ASSET_URLS.detectorScannerImage
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlVrrj3hIaLPH0OS8qPzaosE7VaxhGnQjSV8qUCAAjNqScD7tjcPqfZUvOt-1EZXoyovo_TjAgz6otMtZMB-YHxbuOvGBhSbr4CkJ_yL-EBdWQqFZOvg35oeUo603k-cfKTXjf8LrPNAv6eBsemEpwoJYhcURULXWsNhXoFy4dcF9H64v1DcKWUDdOii_MfrvJFheYnKpREl-XVPc9htTCyy2JNG9BcCz7osmhzh1HV6sZzhwe6nXvxjRlakqXB2WGSO1r6XWYpWk'),
      fullName: studentData.fullName,
      whatsapp: studentData.whatsapp,
      gender: studentData.gender,
      hasHijab: studentData.gender === 'Female' ? true : false,
      userId: studentData.userId,
      hasNametag: nametagOk,
      hasKemejaPutih: kemejaPutihOk,
      hasSabuk: sabukOk,
      hasKerudungPink: studentData.gender === 'Female' ? kerudungPinkOk : false,
      hasRokHitam: studentData.gender === 'Female' ? rokHitamOk : false,
      hasCelanaHitam: studentData.gender === 'Male' ? celanaHitamOk : false,
      status: isAllComplete ? 'COMPLETE' : 'INCOMPLETE',
      timestamp: timestampStr
    };

    onSaveScan(newRecord);
  };

  return (
    <div id="detection-live-view-root" className="flex flex-col gap-6 p-8 bg-[#FDFAF5] overflow-y-auto h-full select-none">

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-12 gap-6">

        {/* Left Column: Camera Viewport */}
        <section id="camera-frame-panel" className="col-span-12 lg:col-span-7 bg-white border border-[#D4C9B0] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0c132c]">
                <Camera className="w-4 h-4" />
                <span>Lensa Kamera Live — Full Body</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {cameraReady && !capturedFrame && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[9px] font-mono font-bold text-red-800 uppercase bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      LIVE
                    </span>
                  </>
                )}
                {capturedFrame && (
                  <span className="text-[9px] font-mono font-bold text-cyan-800 uppercase bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">
                    FRAME CAPTURED
                  </span>
                )}
                <span className="text-[9px] font-mono font-medium text-cyan-800 uppercase bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">
                  FULL BODY DETECTION
                </span>
              </div>
            </div>

            {/* Action buttons row */}
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              {!capturedFrame ? (
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={isAnalyzing || !cameraReady}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#0c132c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#212842] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Menganalisis AI...</span></>
                  ) : (
                    <><ZapIcon className="w-3.5 h-3.5" /><span>Ambil Foto & Analisis AI</span></>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#D4C9B0] bg-[#FDFAF5] text-[10px] text-[#0c132c] font-bold uppercase tracking-wider hover:bg-[#E8DEC8]/50 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Foto Ulang</span>
                </button>
              )}
              {aiSuccess && !isAnalyzing && (
                <span className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold uppercase bg-emerald-50 px-2 py-1 border border-emerald-200">
                  <Cpu className="w-3 h-3" /> AI Selesai — Hasil Diperbarui
                </span>
              )}
              {aiError && !isAnalyzing && (
                <span className="flex items-center gap-1 text-[9px] text-red-700 font-bold bg-red-50 px-2 py-1 border border-red-200 max-w-xs truncate" title={aiError}>
                  ⚠ {aiError}
                </span>
              )}
            </div>

            {/* Camera / Preview Box */}
            <div className="w-full h-[470px] bg-neutral-950 border border-[#D4C9B0] overflow-hidden relative select-none">

              {/* Live Video Feed */}
              {!capturedFrame && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }} // Mirror the video
                />
              )}

              {/* Captured Frame Preview */}
              {capturedFrame && (
                <img
                  src={capturedFrame}
                  alt="Captured Frame"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Camera Error State */}
              {cameraError && !capturedFrame && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 text-center px-6">
                  <VideoOff className="w-10 h-10 text-red-400" />
                  <p className="text-red-300 font-mono text-xs font-semibold">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="mt-2 px-4 py-2 bg-cyan-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* Camera Loading State */}
              {!cameraReady && !cameraError && !capturedFrame && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-cyan-300 font-mono text-xs">Menghidupkan Kamera...</span>
                </div>
              )}

              {/* Analyzing overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-[#0c132c]/80 flex flex-col items-center justify-center gap-3 z-20">
                  <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                  <span className="text-cyan-300 font-mono text-xs font-bold uppercase tracking-widest">AI SEDANG MENGANALISIS...</span>
                  <span className="text-cyan-400/60 font-mono text-[9px]">Mendeteksi atribut pakaian</span>
                </div>
              )}

              {/* ── GUIDE FRAME: Silhouette Body Guide ── */}
              {!capturedFrame && cameraReady && !isAnalyzing && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {/* Outer dimming vignette */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_50%_40%,transparent_60%,rgba(0,0,0,0.5)_100%)]" />

                  {/* Center body guide box */}
                  <div
                    className="absolute border-2 border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    style={{
                      left: '28%', right: '28%',
                      top: '4%', bottom: '3%',
                      borderRadius: '6px',
                    }}
                  >
                    {/* Corner accents */}
                    <div className="absolute -top-[2px] -left-[2px] w-6 h-6 border-t-4 border-l-4 border-cyan-400" />
                    <div className="absolute -top-[2px] -right-[2px] w-6 h-6 border-t-4 border-r-4 border-cyan-400" />
                    <div className="absolute -bottom-[2px] -left-[2px] w-6 h-6 border-b-4 border-l-4 border-cyan-400" />
                    <div className="absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-4 border-r-4 border-cyan-400" />

                    {/* Head circle guide */}
                    <div
                      className="absolute border border-cyan-400/50 border-dashed rounded-full"
                      style={{ width: '38%', height: '15%', top: '3%', left: '31%' }}
                    />

                    {/* Center label */}
                    <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-cyan-400/70 font-mono text-[9px] uppercase tracking-widest whitespace-nowrap">
                        Posisikan badan di sini
                      </p>
                    </div>
                  </div>

                  {/* Top instruction */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#0c132c]/80 px-3 py-1 border border-cyan-500/30 backdrop-blur-sm">
                    <p className="text-cyan-300 font-mono text-[9px] font-bold uppercase tracking-widest text-center">
                      Pastikan seluruh tubuh terlihat • Berdiri tegak
                    </p>
                  </div>

                  {/* Holographic sweep line */}
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-cyan-500/80 opacity-70 shadow-[0_0_12px_rgba(6,182,212,0.9)] transition-all duration-300"
                    style={{ top: `${ticker}%` }}
                  />
                </div>
              )}

              {/* ── Bounding Boxes (shown only on captured frame) ── */}
              {capturedFrame && (
                <>
                  {/* Bounding Box 1: NAMETAG */}
                  {nametagOk ? (
                    <div className="absolute top-[34%] left-[34%] w-[16%] h-[7%] border-2 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all">
                      <span className="absolute -top-4 left-0 bg-emerald-500 text-neutral-950 font-mono text-[7px] px-1 py-0.5 uppercase font-bold tracking-wider leading-none">
                        PAPAN NAMA • OK
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-[34%] left-[34%] w-[16%] h-[7%] border-2 border-red-500/80 border-dashed transition-all">
                      <span className="absolute -top-4 left-0 bg-red-600 text-white font-mono text-[7px] px-1 py-0.5 uppercase font-bold tracking-wider leading-none">
                        PAPAN NAMA TIDAK ADA
                      </span>
                    </div>
                  )}

                  {/* Bounding Box 2: KEMEJA PUTIH */}
                  {kemejaPutihOk ? (
                    <div className="absolute top-[32%] left-[26%] w-[48%] h-[28%] border-2 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all">
                      <span className="absolute bottom-1 right-1 bg-emerald-500 text-neutral-950 font-mono text-[7px] px-1 font-bold">
                        KEMEJA PUTIH OK
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-[32%] left-[26%] w-[48%] h-[28%] border-2 border-red-500/80 transition-all">
                      <span className="absolute bottom-1 right-1 bg-red-600 text-white font-mono text-[7px] px-1 font-bold">
                        KEMEJA PUTIH TIDAK ADA
                      </span>
                    </div>
                  )}

                  {/* Bounding Box 3: SABUK */}
                  {sabukOk ? (
                    <div className="absolute top-[60%] left-[32%] w-[36%] h-[4%] border-2 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all">
                      <span className="absolute bottom-[-14px] right-0 bg-emerald-500 text-neutral-950 font-mono text-[7px] px-1 font-bold leading-none">
                        SABUK OK
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-[60%] left-[32%] w-[36%] h-[4%] border-2 border-red-500/80 border-dashed transition-all">
                      <span className="absolute bottom-[-14px] right-0 bg-red-600 text-white font-mono text-[7px] px-1 font-bold leading-none">
                        SABUK TIDAK ADA
                      </span>
                    </div>
                  )}

                  {/* Female Bounding Boxes */}
                  {studentData.gender === 'Female' && (
                    <>
                      {/* Kerudung Pink */}
                      {kerudungPinkOk ? (
                        <div className="absolute top-[6%] left-[36%] w-[28%] h-[26%] border-2 border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)] transition-all">
                          <span className="absolute -top-4 right-0 bg-pink-500 text-white font-mono text-[7px] px-1 py-0.5 uppercase font-bold leading-none">
                            KERUDUNG PINK OK
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-[6%] left-[36%] w-[28%] h-[26%] border-2 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] border-dashed transition-all">
                          <span className="absolute -top-4 right-0 bg-red-600 text-white font-mono text-[7px] px-1 py-0.5 uppercase font-bold leading-none">
                            TIDAK ADA JILBAB PINK
                          </span>
                        </div>
                      )}

                      {/* Rok Hitam */}
                      {rokHitamOk ? (
                        <div className="absolute top-[64%] left-[28%] w-[44%] h-[32%] border-2 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all">
                          <span className="absolute left-1 bottom-1 bg-emerald-500 text-neutral-950 font-mono text-[7px] px-1 font-bold">
                            ROK HITAM OK
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-[64%] left-[28%] w-[44%] h-[32%] border-2 border-red-500/80 transition-all">
                          <span className="absolute left-1 bottom-1 bg-red-600 text-white font-mono text-[7px] px-1 font-bold">
                            ROK HITAM TIDAK ADA
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Male Bounding Boxes */}
                  {studentData.gender === 'Male' && (
                    <>
                      {/* Celana Hitam */}
                      {celanaHitamOk ? (
                        <div className="absolute top-[64%] left-[30%] w-[40%] h-[32%] border-2 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all">
                          <span className="absolute left-1 bottom-1 bg-emerald-500 text-neutral-950 font-mono text-[7px] px-1 font-bold">
                            CELANA HITAM OK
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-[64%] left-[30%] w-[40%] h-[32%] border-2 border-red-500/80 transition-all">
                          <span className="absolute left-1 bottom-1 bg-red-600 text-white font-mono text-[7px] px-1 font-bold">
                            CELANA HITAM TIDAK ADA
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Biometric Coordinates overlay */}
              <div className="absolute bottom-2 left-2 bg-[#0c132c]/80 text-cyan-400 font-mono text-[8px] p-2 leading-tight select-none border border-cyan-400/20 backdrop-blur-sm z-10">
                {capturedFrame ? 'FRAME DIANALISIS' : (cameraReady ? 'KAMERA AKTIF • LIVE'  : 'MENUNGGU KAMERA...')}<br />
                TARGET: {studentData.gender === 'Female' ? 'PEREMPUAN' : 'LAKI-LAKI'} • FULL BODY
              </div>
            </div>
          </div>

          {/* Calibrate and abort foot buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setNametagOk(true);
                setKemejaPutihOk(true);
                setSabukOk(true);
                if (studentData.gender === 'Female') {
                  setKerudungPinkOk(true);
                  setRokHitamOk(true);
                } else {
                  setCelanaHitamOk(true);
                }
                handleRetake();
              }}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#D4C9B0] bg-[#FDFAF5] text-[11px] text-[#0c132c] font-bold uppercase tracking-wider hover:bg-[#E8DEC8]/50 transition-colors cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Reset Sesi</span>
            </button>
            <button
              onClick={() => {
                // Stop camera before cancelling
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => track.stop());
                }
                onCancel();
              }}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-[#ba1a1a] hover:bg-red-50 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <XSquare className="w-3.5 h-3.5" />
              <span>Batalkan Sesi</span>
            </button>
          </div>
        </section>

        {/* Right Column: Attribute Verification & Checker Controls */}
        <section id="inspection-control-panel" className="col-span-5 bg-white border border-[#D4C9B0] p-6 shadow-sm flex flex-col justify-between select-none">
          <div>
            <header className="mb-4">
              <span className="text-[9px] font-bold tracking-widest text-[#0c132c] bg-[#E8DEC8] px-2 py-0.5 uppercase">
                DAFTAR PARAMETER ATRIBUT
              </span>
              <h3 className="text-sm font-bold text-[#0c132c] tracking-tight mt-2">Pemeriksaan Verifikasi Atribut</h3>
              <p className="text-[11px] text-[#76767e] mt-1 font-semibold">Sesuaikan deteksi atribut secara manual untuk uji kesesuaian berpakaian.</p>
            </header>

            {/* Checklist elements block */}
            <div className="space-y-3 pt-1">

              {/* NAMETAG CHECK */}
              <div id="check-nametag-row" className="flex items-center justify-between p-2.5 bg-[#FDFAF5] border border-[#D4C9B0]/60 hover:border-[#0c132c]">
                <div className="flex gap-3 items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${nametagOk ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-500'}`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-[#0c132c]">Papan Nama Mahasiswa</h5>
                    <p className="text-[9px] text-[#76767e] font-semibold leading-tight">Harus disematkan di sebelah dada kemeja putih</p>
                  </div>
                </div>
                <button
                  onClick={() => setNametagOk(!nametagOk)}
                  className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider cursor-pointer ${nametagOk ? 'bg-emerald-600 text-white' : 'bg-[#ba1a1a] text-white'}`}
                >
                  {nametagOk ? 'ADA' : 'TIDAK ADA'}
                </button>
              </div>

              {/* KEMEJA PUTIH CHECK */}
              <div id="check-white-shirt-row" className="flex items-center justify-between p-2.5 bg-[#FDFAF5] border border-[#D4C9B0]/60 hover:border-[#0c132c]">
                <div className="flex gap-3 items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${kemejaPutihOk ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-500'}`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-[#0c132c]">Kemeja Putih</h5>
                    <p className="text-[9px] text-[#76767e] font-semibold leading-tight">Kemeja berwarna putih berkerah resmi universitas</p>
                  </div>
                </div>
                <button
                  onClick={() => setKemejaPutihOk(!kemejaPutihOk)}
                  className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider cursor-pointer ${kemejaPutihOk ? 'bg-emerald-600 text-white' : 'bg-[#ba1a1a] text-white'}`}
                >
                  {kemejaPutihOk ? 'ADA' : 'TIDAK ADA'}
                </button>
              </div>

              {/* SABUK CHECK */}
              <div id="check-belt-row" className="flex items-center justify-between p-2.5 bg-[#FDFAF5] border border-[#D4C9B0]/60 hover:border-[#0c132c]">
                <div className="flex gap-3 items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${sabukOk ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-500'}`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-[#0c132c]">Sabuk Akademik</h5>
                    <p className="text-[9px] text-[#76767e] font-semibold leading-tight">Ikat pinggang standar warna hitam resmi</p>
                  </div>
                </div>
                <button
                  onClick={() => setSabukOk(!sabukOk)}
                  className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider cursor-pointer ${sabukOk ? 'bg-emerald-600 text-white' : 'bg-[#ba1a1a] text-white'}`}
                >
                  {sabukOk ? 'ADA' : 'TIDAK ADA'}
                </button>
              </div>

              {/* Gender Custom checkboxes */}
              {studentData.gender === 'Female' ? (
                <>
                  {/* KERUDUNG PINK CHECK */}
                  <div id="check-pink-hijab-row" className="flex items-center justify-between p-2.5 bg-[#FDFAF5] border border-[#D4C9B0]/60 hover:border-[#0c132c]">
                    <div className="flex gap-3 items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${kerudungPinkOk ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-500'}`}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-[#0c132c]">Kerudung Pink</h5>
                        <p className="text-[9px] text-[#76767e] font-semibold leading-tight">Kerudung jilbab berwarna merah muda approved</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setKerudungPinkOk(!kerudungPinkOk)}
                      className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider cursor-pointer ${kerudungPinkOk ? 'bg-pink-600 text-white' : 'bg-[#ba1a1a] text-white'}`}
                    >
                      {kerudungPinkOk ? 'ADA' : 'TIDAK ADA'}
                    </button>
                  </div>

                  {/* ROK HITAM CHECK */}
                  <div id="check-black-skirt-row" className="flex items-center justify-between p-2.5 bg-[#FDFAF5] border border-[#D4C9B0]/60 hover:border-[#0c132c]">
                    <div className="flex gap-3 items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${rokHitamOk ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-500'}`}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-[#0c132c]">Rok Hitam</h5>
                        <p className="text-[9px] text-[#76767e] font-semibold leading-tight">Rok panjang formal berwarna hitam polos</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setRokHitamOk(!rokHitamOk)}
                      className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider cursor-pointer ${rokHitamOk ? 'bg-emerald-600 text-white' : 'bg-[#ba1a1a] text-white'}`}
                    >
                      {rokHitamOk ? 'ADA' : 'TIDAK ADA'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* CELANA HITAM CHECK */}
                  <div id="check-black-pants-row" className="flex items-center justify-between p-2.5 bg-[#FDFAF5] border border-[#D4C9B0]/60 hover:border-[#0c132c]">
                    <div className="flex gap-3 items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${celanaHitamOk ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-500'}`}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-[#0c132c]">Celana Hitam</h5>
                        <p className="text-[9px] text-[#76767e] font-semibold leading-tight">Celana panjang kain formal berwarna hitam</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCelanaHitamOk(!celanaHitamOk)}
                      className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider cursor-pointer ${celanaHitamOk ? 'bg-emerald-600 text-white' : 'bg-[#ba1a1a] text-white'}`}
                    >
                      {celanaHitamOk ? 'ADA' : 'TIDAK ADA'}
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Status banner and submission action */}
          <div className="space-y-4 pt-4 border-t border-[#D4C9B0]/60">
            {/* Status box */}
            <div className={`p-4 border text-xs leading-normal font-semibold ${isAllComplete
              ? 'bg-emerald-50 text-emerald-900 border-emerald-400/40'
              : 'bg-red-50 text-[#ba1a1a] border-red-200'
              }`}>
              <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                {isAllComplete ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Seluruh Atribut Sesuai</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
                    <span>Terdapat Ketidaksesuaian Atribut</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-[10px] text-[#46464d] leading-normal font-medium">
                {isAllComplete
                  ? 'Mahasiswa sepenuhnya mematuhi semua persyaratan pakaian. Siap disimpan ke dalam sistem basis data.'
                  : 'Atribut wajib ada yang tidak lengkap. Melanjutkan pemrosesan akan mencatatkan status sebagai pelanggaran aturan.'}
              </p>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-[#0c132c] hover:bg-[#212842] hover:opacity-95 text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <span>Simpan & Catat Riwayat Pemindaian</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </section>

      </div>

    </div>
  );
}

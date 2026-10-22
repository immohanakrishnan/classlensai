"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clipboard,
  Download,
  FileVideo,
  Gauge,
  Link2,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import type { Evaluation } from "@/lib/schema";
import { parseDriveUrl } from "@/lib/drive";

const dimensions = [
  "Teaching clarity",
  "Student engagement",
  "Lesson structure",
  "Examples and explanations",
  "Audio and visual usability",
];
const fmtTime = (seconds: number | null) =>
  seconds === null
    ? "Unverified time"
    : `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [driveUrl, setDriveUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const drive = useMemo(
    () => (driveUrl ? parseDriveUrl(driveUrl) : null),
    [driveUrl],
  );

  function chooseFile(selected: File | undefined) {
    if (!selected) return;
    setError("");
    setEvaluation(null);
    if (
      !["video/mp4", "video/quicktime", "video/webm"].includes(selected.type)
    ) {
      setFile(null);
      setError("Use an MP4, MOV, or WebM video.");
      return;
    }
    if (selected.size > 20 * 1024 * 1024) {
      setFile(null);
      setError("This prototype accepts files up to 20 MB for direct analysis.");
      return;
    }
    setFile(selected);
    setDriveUrl("");
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function analyze() {
    setBusy(true);
    setError("");
    setEvaluation(null);
    try {
      const form = new FormData();
      if (file) form.append("file", file);
      else form.append("driveUrl", driveUrl);
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");
      setEvaluation(data.evaluation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setDriveUrl("");
    setPreviewUrl("");
    setEvaluation(null);
    setError("");
    setCopied(false);
  }
  function download() {
    if (!evaluation) return;
    const blob = new Blob([JSON.stringify(evaluation, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "classlens-assessment.json";
    link.click();
  }
  async function copy() {
    if (!evaluation) return;
    await navigator.clipboard.writeText(
      `${evaluation.classification} — ${evaluation.overallScore}/100\n${evaluation.summary}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen grain">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-cream">
              <Sparkles size={19} />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">
                ClassLens <span className="font-normal text-moss">AI</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[.22em] text-moss">
                Class quality evaluator
              </div>
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </nav>
        <section className="grid gap-10 pb-12 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#dfebe5] px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-moss">
              <span className="h-2 w-2 rounded-full bg-coral" /> Evidence over
              assumptions
            </p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-7xl">
              Make every class
              <br />
              <span className="text-coral">count.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-ink/65">
              ClassLens turns a real class recording into a clear,
              evidence-based quality readout — with useful next steps for the
              teacher.
            </p>
          </div>
          <div className="rounded-[2rem] bg-ink p-6 text-cream shadow-soft sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-sage">
                  What we look for
                </p>
                <p className="mt-2 max-w-xs text-2xl font-medium leading-tight">
                  The moments that help students learn.
                </p>
              </div>
              <Gauge className="text-coral" size={28} />
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 text-sm text-cream/75">
              <span>01 &nbsp; Clear explanations</span>
              <span>02 &nbsp; Student engagement</span>
              <span>03 &nbsp; Lesson structure</span>
              <span>04 &nbsp; Useful examples</span>
            </div>
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-moss">
                  01 / Source
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Bring a class recording
                </h2>
              </div>
              <FileVideo className="text-coral" size={25} />
            </div>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                chooseFile(e.dataTransfer.files[0]);
              }}
              className="cursor-pointer rounded-3xl border-2 border-dashed border-sage/70 bg-[#f7fbf8] p-8 text-center transition hover:border-moss"
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => chooseFile(e.target.files?.[0])}
              />
              <UploadCloud className="mx-auto text-moss" size={30} />
              <p className="mt-3 font-semibold">Drop a video here, or browse</p>
              <p className="mt-1 text-sm text-ink/50">
                MP4, MOV, or WebM · up to 20 MB for direct analysis
              </p>
              {file && (
                <p className="mt-4 rounded-xl bg-white px-3 py-2 text-left text-sm font-semibold text-moss">
                  {file.name}
                </p>
              )}
            </div>
            <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-ink/35">
              <div className="h-px flex-1 bg-ink/10" />
              or use Drive
              <div className="h-px flex-1 bg-ink/10" />
            </div>
            <div className="relative">
              <Link2
                className="absolute left-4 top-1/2 -translate-y-1/2 text-moss"
                size={17}
              />
              <input
                value={driveUrl}
                onChange={(e) => {
                  setDriveUrl(e.target.value);
                  if (e.target.value) {
                    setFile(null);
                    setPreviewUrl("");
                  }
                }}
                placeholder="Paste an individual Google Drive video URL"
                className="w-full rounded-2xl border border-ink/10 bg-cream py-3 pl-11 pr-4 text-sm outline-none ring-coral/30 focus:ring-4"
              />
            </div>
            {drive?.kind === "folder" && (
              <p className="mt-2 text-sm text-coral">
                That’s a folder link. Paste the URL for one video.
              </p>
            )}
            {drive?.kind === "file" && !file && (
              <div className="mt-4 overflow-hidden rounded-2xl bg-ink">
                <iframe
                  title="Drive video preview"
                  src={drive.previewUrl}
                  className="h-52 w-full border-0"
                  allow="autoplay"
                />
              </div>
            )}
            {previewUrl && (
              <video
                src={previewUrl}
                controls
                className="mt-4 max-h-64 w-full rounded-2xl bg-black"
              />
            )}
            {error && (
              <div className="mt-5 flex gap-3 rounded-2xl bg-[#fff1ed] p-4 text-sm text-[#a44b39]">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              disabled={busy || (!file && !driveUrl)}
              onClick={analyze}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-coral px-5 py-3.5 font-bold text-white transition hover:bg-[#d96d59] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Reviewing
                  recording…
                </>
              ) : (
                <>
                  Analyze class <ArrowRight size={18} />
                </>
              )}
            </button>
            <p className="mt-4 text-center text-xs leading-5 text-ink/45">
              Recordings are processed only when an approved multimodal provider
              is configured. No synthetic results.
            </p>
          </div>
          <div className="min-h-[520px] rounded-[2rem] bg-[#e3eee8] p-5 sm:p-7">
            {!evaluation && !busy && (
              <div className="flex h-full min-h-[470px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-moss shadow-sm">
                  <Play size={25} fill="currentColor" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                  Your assessment will land here
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-ink/60">
                  Upload a recording to see the quality signal, dimension
                  scores, grounded observations, and practical recommendations.
                </p>
              </div>
            )}
            {busy && (
              <div className="flex h-full min-h-[470px] flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin text-coral" size={38} />
                <h2 className="mt-6 text-2xl font-semibold">
                  Listening for the learning moments…
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-ink/60">
                  The model is reviewing the available audio and visual
                  evidence. This may take a minute.
                </p>
              </div>
            )}
            {evaluation && (
              <Results
                evaluation={evaluation}
                onCopy={copy}
                copied={copied}
                onDownload={download}
              />
            )}
          </div>
        </section>
        <footer className="mt-12 flex flex-col gap-2 border-t border-ink/10 pt-5 text-xs text-ink/45 sm:flex-row sm:justify-between">
          <span>ClassLens AI · Humaniti AI build challenge prototype</span>
          <span>
            Scores are rubric-based signals, not scientific validation.
          </span>
        </footer>
      </div>
    </main>
  );
}

function Results({
  evaluation,
  onCopy,
  copied,
  onDownload,
}: {
  evaluation: Evaluation;
  onCopy: () => void;
  copied: boolean;
  onDownload: () => void;
}) {
  const badge =
    evaluation.classification === "Excellent"
      ? "bg-[#c9e6d7] text-[#28634e]"
      : evaluation.classification === "Good"
        ? "bg-[#dcebd8] text-[#4c6e49]"
        : evaluation.classification === "Average"
          ? "bg-[#f7e6b9] text-[#8b691b]"
          : "bg-[#f5c8bd] text-[#984938]";
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-moss">
            02 / Readout
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Class quality signal
          </h2>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${badge}`}>
          {evaluation.classification}
        </span>
      </div>
      <div className="mt-7 flex items-end gap-3">
        <span className="text-7xl font-semibold leading-none tracking-[-.06em]">
          {evaluation.overallScore}
        </span>
        <span className="pb-2 text-sm font-semibold text-ink/45">/ 100</span>
      </div>
      <p className="mt-5 text-[15px] leading-7 text-ink/70">
        {evaluation.summary}
      </p>
      <div className="mt-7 space-y-4">
        {evaluation.dimensions.map((d) => (
          <div key={d.name}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-semibold">{d.name}</span>
              <span className="font-bold text-moss">{d.score}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/75">
              <div
                className="h-full rounded-full bg-moss"
                style={{ width: `${d.score}%` }}
              />
            </div>
            <p className="mt-1 text-xs leading-5 text-ink/55">{d.reason}</p>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/65 p-4">
          <h3 className="font-bold">What’s working</h3>
          <ul className="mt-3 space-y-2 text-sm leading-5 text-ink/65">
            {evaluation.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-moss" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white/65 p-4">
          <h3 className="font-bold">Next moves</h3>
          <ul className="mt-3 space-y-2 text-sm leading-5 text-ink/65">
            {evaluation.improvements.map((s) => (
              <li key={s} className="flex gap-2">
                <ArrowRight size={15} className="mt-0.5 shrink-0 text-coral" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {evaluation.observations.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold">Grounded observations</h3>
          <div className="mt-3 space-y-3">
            {evaluation.observations.map((o, i) => (
              <div
                key={`${o.observation}-${i}`}
                className="rounded-2xl border border-ink/10 bg-white/55 p-4"
              >
                <span className="rounded-full bg-ink px-2 py-1 text-[11px] font-bold text-cream">
                  {fmtTime(o.timestampSeconds)}
                </span>
                <p className="mt-3 text-sm font-semibold leading-5">
                  {o.observation}
                </p>
                <p className="mt-1 text-xs leading-5 text-ink/55">
                  Try: {o.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {evaluation.limitations.length > 0 && (
        <div className="mt-6 rounded-2xl bg-[#fff7df] p-4">
          <h3 className="font-bold text-[#765716]">Evidence limits</h3>
          <ul className="mt-2 space-y-1 text-sm leading-5 text-[#765716]/75">
            {evaluation.limitations.map((l) => (
              <li key={l}>• {l}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-7 flex flex-wrap gap-2">
        <button
          onClick={onCopy}
          className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-cream"
        >
          {copied ? <Check size={15} /> : <Clipboard size={15} />}
          {copied ? "Copied" : "Copy summary"}
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 rounded-xl border border-ink/15 bg-white/70 px-4 py-2.5 text-sm font-bold"
        >
          <Download size={15} /> JSON
        </button>
      </div>
    </div>
  );
}

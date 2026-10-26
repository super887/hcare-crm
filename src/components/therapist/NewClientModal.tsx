"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useHcareStore } from "@/lib/store";
import type { Client } from "@/types/hcare";

const field = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500";

export function NewClientModal({ onClose }: { onClose: () => void }) {
  const addClient = useHcareStore((s) => s.addClient);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    birthDate: "",
    gender: "" as "" | NonNullable<Client["gender"]>,
    occupation: "",
    consultationNotes: "",
    preferences: "",
    precautionsMemo: "",
    packageName: "",
    totalSessions: 10,
  });
  const [consent, setConsent] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.phone.trim() && consent;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    addClient({
      name: form.name.trim(),
      phone: form.phone.trim(),
      birthDate: form.birthDate || undefined,
      gender: form.gender || undefined,
      occupation: form.occupation || undefined,
      consultationNotes: form.consultationNotes || undefined,
      preferences: form.preferences || undefined,
      precautionsMemo: form.precautionsMemo || undefined,
      packageName: form.packageName || undefined,
      totalSessions: form.totalSessions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold">신규 고객 등록</h3>
          <button type="button" onClick={onClose} aria-label="닫기" className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-slate-600">
            이름 *
            <input className={`${field} mt-1`} value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus />
          </label>
          <label className="text-xs font-medium text-slate-600">
            연락처 *
            <input className={`${field} mt-1`} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-0000-0000" />
          </label>
          <label className="text-xs font-medium text-slate-600">
            생년월일
            <input type="date" className={`${field} mt-1`} value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
          </label>
          <label className="text-xs font-medium text-slate-600">
            성별
            <select className={`${field} mt-1`} value={form.gender} onChange={(e) => set("gender", e.target.value as typeof form.gender)}>
              <option value="">선택 안 함</option>
              <option value="F">여성</option>
              <option value="M">남성</option>
              <option value="OTHER">기타</option>
            </select>
          </label>
          <label className="col-span-2 text-xs font-medium text-slate-600">
            직업·생활습관
            <input className={`${field} mt-1`} value={form.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="예: 사무직, 하루 8시간 이상 앉아서 근무" />
          </label>
          <label className="col-span-2 text-xs font-medium text-slate-600">
            상담 내용 (주요 호소 증상)
            <textarea rows={3} className={`${field} mt-1`} value={form.consultationNotes} onChange={(e) => set("consultationNotes", e.target.value)} />
          </label>
          <label className="text-xs font-medium text-slate-600">
            선호사항
            <textarea rows={2} className={`${field} mt-1`} value={form.preferences} onChange={(e) => set("preferences", e.target.value)} placeholder="압 강도, 민감 부위 등" />
          </label>
          <label className="text-xs font-medium text-slate-600">
            특이사항·주의
            <textarea rows={2} className={`${field} mt-1`} value={form.precautionsMemo} onChange={(e) => set("precautionsMemo", e.target.value)} placeholder="기저질환, 수술 이력 등" />
          </label>
          <label className="text-xs font-medium text-slate-600">
            패키지명
            <input className={`${field} mt-1`} value={form.packageName} onChange={(e) => set("packageName", e.target.value)} placeholder="기본 케어 10회권" />
          </label>
          <label className="text-xs font-medium text-slate-600">
            총 회차
            <input type="number" min={1} className={`${field} mt-1`} value={form.totalSessions} onChange={(e) => set("totalSessions", Number(e.target.value) || 1)} />
          </label>
        </div>

        <label className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
          <span>
            <b className="text-slate-800">[필수] 개인정보 및 민감정보(신체·건강 정보) 수집·이용에 동의합니다.</b>
            <br />관리 목적으로만 사용되며, 고객 본인 정보는 본인과 담당 관리사만 조회할 수 있습니다.
          </span>
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">취소</button>
          <button type="submit" disabled={!valid} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white enabled:hover:bg-teal-700 disabled:opacity-40">
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
}

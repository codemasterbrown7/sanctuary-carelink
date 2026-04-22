import { Consultation } from './mock-api/types';

type ConsultationInput = Omit<Consultation, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'careSummary' | 'matchedVideoIds'>;

// ── In-memory fallback (used when Supabase is not configured) ──
const memoryStore = new Map<string, Consultation>();

function useDatabase(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function getDb() {
  const { getDb: getSupabase } = await import('./db');
  return getSupabase();
}

// ── CRUD operations ─────────────────────────────────────────

export async function createConsultation(data: ConsultationInput): Promise<Consultation> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const consultation: Consultation = {
    ...data,
    id,
    status: 'created',
    careSummary: null,
    matchedVideoIds: [],
    createdAt: now,
    updatedAt: now,
  };

  if (useDatabase()) {
    const db = await getDb();
    const { error } = await db.from('consultations').insert({
      id,
      data: consultation,
      patient_phone: consultation.patientPhone,
      status: consultation.status,
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(`Supabase insert error: ${error.message}`);
  } else {
    memoryStore.set(id, consultation);
  }

  return consultation;
}

export async function getConsultation(id: string): Promise<Consultation | undefined> {
  if (useDatabase()) {
    const db = await getDb();
    const { data, error } = await db
      .from('consultations')
      .select('data')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return data.data as Consultation;
  }
  return memoryStore.get(id);
}

export async function updateConsultation(id: string, updates: Partial<Consultation>): Promise<Consultation | undefined> {
  const existing = await getConsultation(id);
  if (!existing) return undefined;

  const now = new Date().toISOString();
  const updated = { ...existing, ...updates, updatedAt: now };

  if (useDatabase()) {
    const db = await getDb();
    const { error } = await db
      .from('consultations')
      .update({
        data: updated,
        status: updated.status,
        updated_at: now,
      })
      .eq('id', id);
    if (error) throw new Error(`Supabase update error: ${error.message}`);
  } else {
    memoryStore.set(id, updated);
  }

  return updated;
}

export async function listConsultations(): Promise<Consultation[]> {
  if (useDatabase()) {
    const db = await getDb();
    const { data, error } = await db
      .from('consultations')
      .select('data')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(row => row.data as Consultation);
  }
  return Array.from(memoryStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getConsultationByPhone(phone: string): Promise<Consultation | undefined> {
  if (useDatabase()) {
    const db = await getDb();
    const { data, error } = await db
      .from('consultations')
      .select('data')
      .eq('patient_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return undefined;
    return data.data as Consultation;
  }
  return Array.from(memoryStore.values())
    .filter(c => c.patientPhone === phone)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

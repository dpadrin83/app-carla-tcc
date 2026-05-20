export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'psicologa' | 'assistente'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role: 'psicologa' | 'assistente'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'psicologa' | 'assistente'
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          full_name: string
          birth_date: string | null
          email: string | null
          phone: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          payment_method: string | null
          session_value: number | null
          active: boolean
          case_summary: string | null
          current_focus: string | null
          medication: string | null
          risks_alerts: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          birth_date?: string | null
          email?: string | null
          phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          payment_method?: string | null
          session_value?: number | null
          active?: boolean
          case_summary?: string | null
          current_focus?: string | null
          medication?: string | null
          risks_alerts?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          birth_date?: string | null
          email?: string | null
          phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          payment_method?: string | null
          session_value?: number | null
          active?: boolean
          case_summary?: string | null
          current_focus?: string | null
          medication?: string | null
          risks_alerts?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          patient_id: string
          scheduled_at: string
          occurred_at: string | null
          status: 'scheduled' | 'occurred' | 'no_show' | 'cancelled'
          google_event_id: string | null
          agenda: string | null
          interventions: string | null
          homework: string | null
          next_focus: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          scheduled_at: string
          occurred_at?: string | null
          status?: 'scheduled' | 'occurred' | 'no_show' | 'cancelled'
          google_event_id?: string | null
          agenda?: string | null
          interventions?: string | null
          homework?: string | null
          next_focus?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          scheduled_at?: string
          occurred_at?: string | null
          status?: 'scheduled' | 'occurred' | 'no_show' | 'cancelled'
          google_event_id?: string | null
          agenda?: string | null
          interventions?: string | null
          homework?: string | null
          next_focus?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_tasks: {
        Row: {
          id: string
          patient_id: string | null
          assigned_to: string | null
          created_by: string | null
          title: string
          description: string | null
          type: 'nf' | 'receita_saude' | 'contrato' | 'lembrete' | 'cadastro' | 'outro' | null
          status: 'pending' | 'in_progress' | 'done' | 'cancelled'
          due_date: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          assigned_to?: string | null
          created_by?: string | null
          title: string
          description?: string | null
          type?: 'nf' | 'receita_saude' | 'contrato' | 'lembrete' | 'cadastro' | 'outro' | null
          status?: 'pending' | 'in_progress' | 'done' | 'cancelled'
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          assigned_to?: string | null
          created_by?: string | null
          title?: string
          description?: string | null
          type?: 'nf' | 'receita_saude' | 'contrato' | 'lembrete' | 'cadastro' | 'outro' | null
          status?: 'pending' | 'in_progress' | 'done' | 'cancelled'
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          author_id: string | null
          patient_id: string
          task_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          author_id?: string | null
          patient_id: string
          task_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string | null
          patient_id?: string
          task_id?: string | null
          content?: string
          created_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          patient_id: string
          uploaded_by: string | null
          file_name: string
          file_path: string
          file_type: string | null
          category: 'contrato' | 'documento' | 'exame' | 'outro' | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          uploaded_by?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          category?: 'contrato' | 'documento' | 'exame' | 'outro' | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          uploaded_by?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          category?: 'contrato' | 'documento' | 'exame' | 'outro' | null
          created_at?: string
        }
      }
      financial_entries: {
        Row: {
          id: string
          patient_id: string | null
          session_id: string | null
          type: 'entrada' | 'saida'
          amount: number
          description: string | null
          occurred_at: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          session_id?: string | null
          type: 'entrada' | 'saida'
          amount: number
          description?: string | null
          occurred_at: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          session_id?: string | null
          type?: 'entrada' | 'saida'
          amount?: number
          description?: string | null
          occurred_at?: string
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          patient_id: string | null
          action: string
          entity: string
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          patient_id?: string | null
          action: string
          entity: string
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          patient_id?: string | null
          action?: string
          entity?: string
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
  }
}

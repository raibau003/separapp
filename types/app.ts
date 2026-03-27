/**
 * Roles de usuario en el sistema
 */
export type UserRole = 'padre' | 'madre' | 'hijo' | 'mediador' | 'juez';

/**
 * Categorías de gastos
 */
export type ExpenseCategory =
  | 'educacion'
  | 'salud'
  | 'ropa'
  | 'alimentacion'
  | 'deporte'
  | 'transporte'
  | 'otros';

/**
 * Estado de un gasto
 */
export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

/**
 * Estado de un pago de manutención
 */
export type MaintenanceStatus = 'pending' | 'paid' | 'late';

/**
 * Frecuencia de pago de manutención
 */
export type PaymentFrequency = 'mensual' | 'quincenal';

/**
 * Tipo de evento de calendario
 */
export type CalendarEventType = 'custody' | 'activity' | 'school' | 'exchange';

/**
 * Monedas soportadas
 */
export type Currency = 'CLP' | 'ARS' | 'MXN' | 'EUR';

/**
 * Interfaz para una familia
 */
export interface Family {
  id: string;
  name: string;
  created_at: string;
}

/**
 * Interfaz para un gasto
 */
export interface Expense {
  id: string;
  family_id: string;
  child_id: string;
  declared_by: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  description: string;
  receipt_url?: string;
  ocr_data?: any;
  status: ExpenseStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

/**
 * Interfaz para un hijo
 */
export interface Child {
  id: string;
  family_id: string;
  full_name: string;
  birth_date: string;
  photo_url?: string;
  created_at: string;
}

/**
 * Interfaz para un miembro de la familia
 */
export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

/**
 * Interfaz para un pago de manutención
 */
export interface MaintenancePayment {
  id: string;
  family_id: string;
  amount: number;
  currency: Currency;
  frequency: PaymentFrequency;
  due_date: string;
  paid_date?: string;
  paid_by?: string;
  receipt_url?: string;
  status: MaintenanceStatus;
  created_at: string;
}

/**
 * Interfaz para un mensaje
 */
export interface Message {
  id: string;
  family_id: string;
  sender_id: string;
  content: string;
  original_content?: string;
  ai_filtered: boolean;
  ai_suggestion?: string;
  created_at: string;
}

/**
 * Interfaz para un evento de calendario
 */
export interface CalendarEvent {
  id: string;
  family_id: string;
  child_id: string;
  title: string;
  start_date: string;
  end_date: string;
  type: CalendarEventType;
  created_by: string;
  created_at: string;
}

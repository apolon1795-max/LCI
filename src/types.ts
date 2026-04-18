export type AppStep =
    | 'welcome'
    | 'subject'
    | 'assessment'
    | 'grade'
    | 'branch'
    | 'teacher'
    | 'contact'
    | 'success';

export interface AppState {
    subject: string | null;
    assessment: string | null;
    grade: string | null;
    branch: string | null;
    teacher: string | null;
    parentName: string | null;
    parentPhone: string | null;
    parentEmail: string | null;
}

export interface Subject {
    id: string;
    name: string;
    emoji: string;
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    coordinates?: [number, number]; // [lat, lng]
}

export interface Teacher {
    id: string;
    name: string;
    subjects: string[];
    branches: string[];
    photoUrl: string;
    description: string;
    quote: string;
}

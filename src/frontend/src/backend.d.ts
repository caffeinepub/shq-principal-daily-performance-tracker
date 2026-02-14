import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CheckIn {
    time: Time;
    detail: string;
}
export interface PublicProfile {
    name: string;
    dedication: Dedication;
}
export type Time = bigint;
export interface InputProfile {
    name: string;
    dedication: Dedication;
}
export interface CheckOut {
    time: Time;
    detail: string;
}
export interface KPITally {
    focus: number;
    habit: number;
    flow: number;
    dedication: number;
    energy: number;
    health: number;
}
export interface DailyReport {
    focus: string;
    focusRating: number;
    dedicationMetric: Dedication;
    strats: string;
    habit: string;
    healthRating: number;
    habitRating: number;
    flow: string;
    time: Time;
    dedication: string;
    flowRating: number;
    energyRating: number;
    dedicationRating: number;
    energy: string;
    health: string;
}
export interface Submission {
    kpi: KPITally;
    report: DailyReport;
    relation: number;
    time: Time;
    user: PublicProfile;
    account: string;
    rating: number;
    reflection: string;
}
export interface UserProfile {
    name: string;
    dedication: Dedication;
}
export enum Dedication {
    sales = "sales",
    technology = "technology",
    leadership = "leadership"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCheckIn(detail: string): Promise<void>;
    addCheckOut(detail: string): Promise<void>;
    addSubmission(report: DailyReport, review: string, account: string, reflection: string, relation: number, rating: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllCheckIns(): Promise<Array<[Principal, Array<CheckIn>]>>;
    getAllCheckOuts(): Promise<Array<[Principal, Array<CheckOut>]>>;
    getAllSubmissions(): Promise<Array<[Principal, Array<Submission>]>>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCheckIns(): Promise<Array<CheckIn>>;
    getCheckOuts(): Promise<Array<CheckOut>>;
    getPublicProfile(): Promise<UserProfile>;
    getSubmissionCount(): Promise<bigint>;
    getSubmissions(): Promise<Array<Submission>>;
    getUniqueDedications(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserSubmissions(user: Principal): Promise<Array<Submission>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: InputProfile): Promise<void>;
    saveUserProfile(profile: InputProfile): Promise<void>;
}

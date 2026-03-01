import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type UserId = Principal;
export type Time = bigint;
export interface User {
    id: UserId;
    name: string;
    createdAt: Time;
    upiId: UpiId;
    phone: Phone;
    walletBalance: Amount;
}
export type UpiId = string;
export type Phone = string;
export type Amount = number;
export interface UserProfile {
    name: string;
    upiId: string;
    phone: string;
}
export interface Transaction {
    id: bigint;
    status: TransactionStatus;
    provider: string;
    note: string;
    type: TransactionType;
    receiverId: UserId;
    timestamp: Time;
    category: string;
    accountNumber: string;
    amount: Amount;
    senderId: UserId;
}
export enum TransactionStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum TransactionType {
    receive = "receive",
    bill = "bill",
    request = "request",
    send = "send"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getBalance(): Promise<Amount>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserByPhone(phone: Phone): Promise<User | null>;
    getUserByUpi(upi: UpiId): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTransactions(userId: UserId): Promise<Array<Transaction>>;
    isCallerAdmin(): Promise<boolean>;
    payBill(category: string, provider: string, accountNumber: string, amount: Amount): Promise<void>;
    registerUser(name: string, phone: string): Promise<User>;
    requestMoney(requesterUpi: UpiId, amount: Amount, note: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMoney(receiverUpi: UpiId, amount: Amount, note: string): Promise<void>;
    topUp(amount: Amount): Promise<void>;
}

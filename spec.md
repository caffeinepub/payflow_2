# PayFlow - UPI Payment App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User registration and login (with UPI ID auto-generation)
- Wallet with balance management (add money, view balance)
- Send money by UPI ID or phone number
- Receive money / request payment from another user
- Transaction history (sent, received, pending requests)
- Bill payments: mobile recharge, electricity, DTH, water bill
- QR code scan to pay
- Home dashboard with quick actions

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- User model: id, name, phone, upiId, walletBalance, createdAt
- Transaction model: id, senderId, receiverId, amount, type (send/receive/bill), status, note, timestamp
- BillPayment model: category, provider, accountNumber, amount, status
- APIs:
  - registerUser(name, phone) -> User
  - getUser(userId) -> User
  - getUserByUpiId(upiId) -> User
  - getUserByPhone(phone) -> User
  - addMoney(userId, amount) -> new balance
  - sendMoney(fromUserId, toUpiId, amount, note) -> Transaction
  - requestMoney(fromUserId, toUpiId, amount, note) -> Transaction
  - payBill(userId, category, provider, accountNumber, amount) -> Transaction
  - getTransactions(userId) -> [Transaction]
  - getBalance(userId) -> Float

### Frontend
- Login / Register screen
- Home dashboard: balance card, quick action buttons (Send, Receive, Scan, History, Pay Bills)
- Send Money screen: enter UPI ID or phone, amount, note
- Request Money screen: enter UPI ID, amount, note
- QR Scanner screen: scan QR to autofill payment
- Transaction History screen: list of all transactions with filters
- Bill Payment screen: category selection, provider, account number, amount
- Add Money screen: enter amount to top up wallet
- Profile screen: show UPI ID, phone, name

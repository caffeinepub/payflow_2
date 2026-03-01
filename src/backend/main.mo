import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserId = Principal;
  type Phone = Text;
  type UpiId = Text;
  type Amount = Float;

  type User = {
    id : UserId;
    name : Text;
    phone : Phone;
    upiId : UpiId;
    walletBalance : Amount;
    createdAt : Time.Time;
  };

  type TransactionStatus = {
    #completed;
    #pending;
    #failed;
  };

  type TransactionType = {
    #send;
    #receive;
    #bill;
    #request;
  };

  type Transaction = {
    id : Nat;
    senderId : UserId;
    receiverId : UserId;
    amount : Amount;
    type_ : TransactionType;
    status : TransactionStatus;
    note : Text;
    category : Text;
    provider : Text;
    accountNumber : Text;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
    upiId : Text;
  };

  module User {
    public func compare(user1 : User, user2 : User) : Order.Order {
      switch (Text.compare(user1.name, user2.name)) {
        case (#equal) { Text.compare(user1.upiId, user2.upiId) };
        case (order) { order };
      };
    };
  };

  let users = Map.empty<UserId, User>();
  let upiMap = Map.empty<UpiId, UserId>();
  let phoneMap = Map.empty<Phone, UserId>();
  let transactionMap = Map.empty<UserId, [Transaction]>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var transactionCounter = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerUser(name : Text, phone : Text) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    // Check if user already exists
    switch (users.get(caller)) {
      case (?_) { Runtime.trap("User already registered") };
      case (null) {};
    };

    let upi = name.concat("@payflow");
    let user : User = {
      id = caller;
      name;
      phone;
      upiId = upi;
      walletBalance = 1000.0;
      createdAt = Time.now();
    };

    users.add(caller, user);
    upiMap.add(upi, caller);
    phoneMap.add(phone, caller);

    // Also save to user profile
    let profile : UserProfile = {
      name;
      phone;
      upiId = upi;
    };
    userProfiles.add(caller, profile);

    user;
  };

  public query ({ caller }) func getUserByUpi(upi : UpiId) : async ?User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can lookup by UPI");
    };

    switch (upiMap.get(upi)) {
      case (?userId) { users.get(userId) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUserByPhone(phone : Phone) : async ?User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can lookup by phone");
    };

    switch (phoneMap.get(phone)) {
      case (?userId) { users.get(userId) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getBalance() : async Amount {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check balance");
    };

    switch (users.get(caller)) {
      case (?user) { user.walletBalance };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func topUp(amount : Amount) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can top up");
    };

    if (amount <= 0) {
      Runtime.trap("Amount must be positive");
    };

    switch (users.get(caller)) {
      case (?user) {
        let updatedUser = { user with walletBalance = user.walletBalance + amount };
        users.add(caller, updatedUser);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func sendMoney(receiverUpi : UpiId, amount : Amount, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send money");
    };

    if (amount <= 0) {
      Runtime.trap("Amount must be positive");
    };

    let sender = switch (users.get(caller)) {
      case (?user) { user };
      case (null) { Runtime.trap("Sender not found") };
    };

    if (sender.walletBalance < amount) {
      Runtime.trap("Insufficient balance");
    };

    let receiver = switch (upiMap.get(receiverUpi)) {
      case (?receiverId) {
        switch (users.get(receiverId)) {
          case (?user) { user };
          case (null) { Runtime.trap("Receiver not found") };
        };
      };
      case (null) { Runtime.trap("Receiver not found") };
    };

    // Update balances
    let updatedSender = {
      sender with
      walletBalance = sender.walletBalance - amount
    };
    let updatedReceiver = {
      receiver with
      walletBalance = receiver.walletBalance + amount
    };
    users.add(caller, updatedSender);
    users.add(updatedReceiver.id, updatedReceiver);

    // Create transaction
    let transaction : Transaction = {
      id = transactionCounter;
      senderId = caller;
      receiverId = receiver.id;
      amount;
      type_ = #send;
      status = #completed;
      note;
      category = "";
      provider = "";
      accountNumber = "";
      timestamp = Time.now();
    };
    transactionCounter += 1;

    // Add to transaction histories
    let senderHistory = switch (transactionMap.get(caller)) {
      case (?history) { history };
      case (null) { [] };
    };
    let receiverHistory = switch (transactionMap.get(receiver.id)) {
      case (?history) { history };
      case (null) { [] };
    };

    transactionMap.add(caller, senderHistory.concat([transaction]));
    transactionMap.add(receiver.id, receiverHistory.concat([transaction]));
  };

  public shared ({ caller }) func requestMoney(requesterUpi : UpiId, amount : Amount, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request money");
    };

    if (amount <= 0) {
      Runtime.trap("Amount must be positive");
    };

    let requester = switch (upiMap.get(requesterUpi)) {
      case (?requesterId) {
        switch (users.get(requesterId)) {
          case (?user) { user };
          case (null) { Runtime.trap("Requester not found") };
        };
      };
      case (null) { Runtime.trap("Requester not found") };
    };

    let transaction : Transaction = {
      id = transactionCounter;
      senderId = caller;
      receiverId = requester.id;
      amount;
      type_ = #request;
      status = #pending;
      note;
      category = "";
      provider = "";
      accountNumber = "";
      timestamp = Time.now();
    };
    transactionCounter += 1;

    let history = switch (transactionMap.get(requester.id)) {
      case (?history) { history };
      case (null) { [] };
    };
    transactionMap.add(requester.id, history.concat([transaction]));
  };

  public shared ({ caller }) func payBill(category : Text, provider : Text, accountNumber : Text, amount : Amount) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can pay bills");
    };

    if (amount <= 0) {
      Runtime.trap("Amount must be positive");
    };

    let user = switch (users.get(caller)) {
      case (?user) { user };
      case (null) { Runtime.trap("User not found") };
    };

    if (user.walletBalance < amount) {
      Runtime.trap("Insufficient balance");
    };

    let updatedUser = {
      user with
      walletBalance = user.walletBalance - amount
    };
    users.add(caller, updatedUser);

    let transaction : Transaction = {
      id = transactionCounter;
      senderId = caller;
      receiverId = caller;
      amount;
      type_ = #bill;
      status = #completed;
      note = "Bill Payment";
      category;
      provider;
      accountNumber;
      timestamp = Time.now();
    };
    transactionCounter += 1;

    let history = switch (transactionMap.get(caller)) {
      case (?history) { history };
      case (null) { [] };
    };
    transactionMap.add(caller, history.concat([transaction]));
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    switch (transactionMap.get(caller)) {
      case (?history) { history };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getUserTransactions(userId : UserId) : async [Transaction] {
    // Only allow viewing own transactions or admin can view any
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };

    let user = switch (users.get(userId)) {
      case (?user) { user };
      case (null) { Runtime.trap("User not found") };
    };

    let history = switch (transactionMap.get(userId)) {
      case (?history) { history };
      case (null) { [] };
    };

    history;
  };
};

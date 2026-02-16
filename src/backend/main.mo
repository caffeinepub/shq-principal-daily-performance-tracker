import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Profile {
    public type Dedication = {
      #leadership;
      #technology;
      #sales;
    };

    public type DailyReport = {
      time : Time.Time;
      strats : Text;
      energy : Text;
      energyRating : Float;
      flow : Text;
      flowRating : Float;
      focus : Text;
      focusRating : Float;
      health : Text;
      healthRating : Float;
      habit : Text;
      habitRating : Float;
      dedication : Text;
      dedicationRating : Float;
      dedicationMetric : Dedication;
    };

    public type PublicProfile = {
      name : Text;
      dedication : Dedication;
    };

    public type InputProfile = {
      name : Text;
      dedication : Dedication;
    };
  };

  module Submission {
    public type KPITally = {
      energy : Float;
      flow : Float;
      focus : Float;
      health : Float;
      habit : Float;
      dedication : Float;
    };
  };

  public type UserProfile = Profile.PublicProfile;
  type InputProfile = Profile.InputProfile;
  type DailyReport = Profile.DailyReport;

  public type Submission = {
    time : Time.Time;
    report : Profile.DailyReport;
    user : Profile.PublicProfile;
    relation : Float;
    reflection : Text;
    rating : Float;
    account : Text;
    kpi : Submission.KPITally;
  };

  // New CheckIn and CheckOut types
  public type CheckIn = {
    time : Time.Time;
    detail : Text;
    photo : ?Text; // Single photo field
  };

  public type CheckOut = {
    time : Time.Time;
    detail : Text;
  };

  // Type for user with role information
  public type UserWithRole = {
    principal : Principal;
    profile : ?UserProfile;
    role : AccessControl.UserRole;
  };

  // Type for KPI Weights
  public type KPIConfig = {
    activity1name : Text;
    activity1weight : Float;
    activity1active : Bool;

    activity2name : Text;
    activity2weight : Float;
    activity2active : Bool;

    activity3name : Text;
    activity3weight : Float;
    activity3active : Bool;

    activity4name : Text;
    activity4weight : Float;
    activity4active : Bool;

    activity5name : Text;
    activity5weight : Float;
    activity5active : Bool;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let submissions = Map.empty<Principal, List.List<Submission>>();
  let checkIns = Map.empty<Principal, List.List<CheckIn>>();
  let checkOuts = Map.empty<Principal, List.List<CheckOut>>();

  // Persistent KPI Weights initialized with default values
  var kpiWeights : KPIConfig = {
    activity1name = "Activity 1";
    activity1weight = 20.0;
    activity1active = false;

    activity2name = "Activity 2";
    activity2weight = 20.0;
    activity2active = false;

    activity3name = "Activity 3";
    activity3weight = 20.0;
    activity3active = false;

    activity4name = "Activity 4";
    activity4weight = 20.0;
    activity4active = false;

    activity5name = "Activity 5";
    activity5weight = 20.0;
    activity5active = false;
  };

  // KPI Config APIs
  public query ({ caller }) func getKPIConfig() : async KPIConfig {
    // All authenticated users (including guests) can view KPI configuration
    kpiWeights;
  };

  public shared ({ caller }) func updateKPIConfig(newConfig : KPIConfig) : async () {
    // Only Admin (Kepsek/Direktur) can update KPI configuration
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Kepsek or Direktur can update KPI configuration");
    };
    checkValidConfig(newConfig);
    kpiWeights := newConfig;
  };

  func checkValidConfig(config : KPIConfig) {
    var activeCount = 0;
    var activeWeightSum = 0.0;

    // Check each activity
    if (config.activity1active) {
      activeCount += 1;
      activeWeightSum += config.activity1weight;
    };
    if (config.activity2active) {
      activeCount += 1;
      activeWeightSum += config.activity2weight;
    };
    if (config.activity3active) {
      activeCount += 1;
      activeWeightSum += config.activity3weight;
    };
    if (config.activity4active) {
      activeCount += 1;
      activeWeightSum += config.activity4weight;
    };
    if (config.activity5active) {
      activeCount += 1;
      activeWeightSum += config.activity5weight;
    };

    if (activeCount != 5) {
      Runtime.trap("Exactly 5 activities must be active, currently " # activeCount.toText() # " are active");
    };

    if (not compareFloatsWithEpsilon(activeWeightSum, 100.0, 0.01)) {
      Runtime.trap("Total weight must be exactly 100, current value is " # activeWeightSum.toText());
    };
  };

  // Function to compare floats with epsilon
  func compareFloatsWithEpsilon(a : Float, b : Float, epsilon : Float) : Bool {
    let diff = a - b;
    if (diff < 0.0) {
      -diff <= epsilon;
    } else {
      diff <= epsilon;
    };
  };

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless you are a Kepsek");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : InputProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let publicProfile : UserProfile = {
      name = profile.name;
      dedication = profile.dedication;
    };
    userProfiles.add(caller, publicProfile);
  };

  // Legacy function for backward compatibility
  public shared ({ caller }) func saveUserProfile(profile : InputProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let publicProfile : UserProfile = {
      name = profile.name;
      dedication = profile.dedication;
    };
    userProfiles.add(caller, publicProfile);
  };

  public query ({ caller }) func getPublicProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };
  };

  // Calculate KPI tally dynamically based on current active weights
  func computeKPITally(report : DailyReport) : Submission.KPITally {
    {
      energy = if (kpiWeights.activity1active) { report.energyRating * kpiWeights.activity1weight } else { 0.0 };
      flow = if (kpiWeights.activity2active) { report.flowRating * kpiWeights.activity2weight } else { 0.0 };
      focus = if (kpiWeights.activity3active) { report.focusRating * kpiWeights.activity3weight } else { 0.0 };
      health = if (kpiWeights.activity4active) { report.healthRating * kpiWeights.activity4weight } else { 0.0 };
      habit = if (kpiWeights.activity5active) { report.habitRating * kpiWeights.activity5weight } else { 0.0 };
      dedication = report.dedicationRating * 1.0;
    };
  };

  public shared ({ caller }) func addSubmission(report : Profile.DailyReport, review : Text, account : Text, reflection : Text, relation : Float, rating : Float) : async () {
    // Principal (form-only) role: only users can submit
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit daily activities");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Must create a profile first."); };
      case (?profile) { profile };
    };

    let time = Time.now();

    let submission : Submission = {
      report;
      time;
      account;
      relation;
      user = profile;
      rating;
      reflection;
      kpi = computeKPITally(report);
    };

    let existingSubmissions = switch (submissions.get(caller)) {
      case (null) { List.empty<Submission>() };
      case (?existing) { existing };
    };

    let updatedSubmissions = List.fromArray<Submission>([submission]);
    submissions.add(caller, updatedSubmissions);
  };

  public shared ({ caller }) func addCheckIn(detail : Text, photo : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit check-ins");
    };

    let checkIn : CheckIn = {
      detail;
      time = Time.now();
      photo;
    };

    let existingCheckIns = switch (checkIns.get(caller)) {
      case (null) { List.empty<CheckIn>() };
      case (?existing) { existing };
    };
    existingCheckIns.add(checkIn);
    checkIns.add(caller, existingCheckIns);
  };

  public shared ({ caller }) func addCheckOut(detail : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit check-outs");
    };

    let checkOut : CheckOut = {
      detail;
      time = Time.now();
    };

    let existingCheckOuts = switch (checkOuts.get(caller)) {
      case (null) { List.empty<CheckOut>() };
      case (?existing) { existing };
    };
    existingCheckOuts.add(checkOut);
    checkOuts.add(caller, existingCheckOuts);
  };

  // Principal can read their own submissions
  public query ({ caller }) func getSubmissions() : async [Submission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };
    switch (submissions.get(caller)) {
      case (null) { [] };
      case (?results) { results.toArray() };
    };
  };

  public query ({ caller }) func getCheckIns() : async [CheckIn] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view check-ins");
    };
    switch (checkIns.get(caller)) {
      case (null) { [] };
      case (?results) { results.toArray() };
    };
  };

  public query ({ caller }) func getCheckOuts() : async [CheckOut] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view check-outs");
    };
    switch (checkOuts.get(caller)) {
      case (null) { [] };
      case (?results) { results.toArray() };
    };
  };

  // Director/Management can read submissions across Principals
  public query ({ caller }) func getAllSubmissions() : async [(Principal, [Submission])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Kepsek can view all submissions");
    };

    submissions.toArray().map(func((principal, submissionList)) { (principal, submissionList.toArray()) });
  };

  public query ({ caller }) func getAllCheckIns() : async [(Principal, [CheckIn])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Kepsek can view all check-ins");
    };

    checkIns.toArray().map(func((principal, checkInList)) { (principal, checkInList.toArray()) });
  };

  public query ({ caller }) func getAllCheckOuts() : async [(Principal, [CheckOut])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Kepsek can view all check-outs");
    };

    checkOuts.toArray().map(func((principal, checkOutList)) { (principal, checkOutList.toArray()) });
  };

  // Director/Management can read specific user's submissions
  public query ({ caller }) func getUserSubmissions(user : Principal) : async [Submission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Kepsek can view other users' submissions");
    };
    switch (submissions.get(user)) {
      case (null) { [] };
      case (?results) { results.toArray() };
    };
  };

  // Admin-only: Get all user profiles
  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Kepsek can view all user profiles");
    };
    userProfiles.toArray();
  };

  // Director-only: List all users with their roles (for settings page)
  public query ({ caller }) func listUsersWithRoles() : async [UserWithRole] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Direktur can list users with roles");
    };

    // Get all principals that have profiles
    let profilePrincipals = userProfiles.keys().toArray();

    // Map each principal to UserWithRole
    profilePrincipals.map(func(principal : Principal) : UserWithRole {
      {
        principal = principal;
        profile = userProfiles.get(principal);
        role = AccessControl.getUserRole(accessControlState, principal);
      };
    });
  };

  // Director-only: Update a user's role (for settings page)
  public shared ({ caller }) func updateUserRole(user : Principal, newRole : AccessControl.UserRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Direktur can update user roles");
    };

    // assignRole already includes admin-only guard internally, but we add explicit check for clarity
    AccessControl.assignRole(accessControlState, caller, user, newRole);
  };

  // Director-only: Delete a user account while preserving historical data
  public shared ({ caller }) func deleteUser(user : Principal) : async () {
    // Only director (admin) can delete users
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Direktur can delete users");
    };

    // Remove the user's profile only
    // Historical submissions, check-ins, and check-outs are preserved for monitoring and reporting
    userProfiles.remove(user);
  };

  // Query functions for statistics (admin-only)
  public query ({ caller }) func getUniqueDedications() : async [Text] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Kepsek can view dedication statistics");
    };
    let dedications = userProfiles.values().toArray().map(
      func(profile) : Text {
        switch (profile.dedication) {
          case (#technology) { "Technology" };
          case (#sales) { "Sales" };
          case (#leadership) { "Leadership" };
        };
      }
    );
    dedications;
  };

  // Get submission count (admin-only)
  public query ({ caller }) func getSubmissionCount() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only Kepsek can view submission statistics");
    };
    var count : Nat = 0;
    for ((_, submissionList) in submissions.entries()) {
      count += submissionList.size();
    };
    count;
  };
};


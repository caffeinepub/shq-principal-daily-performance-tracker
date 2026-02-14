import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
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
  };

  public type CheckOut = {
    time : Time.Time;
    detail : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let submissions = Map.empty<Principal, List.List<Submission>>();
  let checkIns = Map.empty<Principal, List.List<CheckIn>>();
  let checkOuts = Map.empty<Principal, List.List<CheckOut>>();

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
      Runtime.trap("Unauthorized: Can only view your own profile unless you are admin");
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

  func computeKPITally(report : DailyReport) : Submission.KPITally {
    let pointsPerActivity : Float = 100.0 / 6.0;
    {
      energy = report.energyRating * pointsPerActivity;
      flow = report.flowRating * pointsPerActivity;
      focus = report.focusRating * pointsPerActivity;
      health = report.healthRating * pointsPerActivity;
      habit = report.habitRating * pointsPerActivity;
      dedication = report.dedicationRating * pointsPerActivity;
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

  public shared ({ caller }) func addCheckIn(detail : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit check-ins");
    };

    let checkIn : CheckIn = {
      detail;
      time = Time.now();
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
      Runtime.trap("Unauthorized: Only admins (Director/Management) can view all submissions");
    };

    submissions.toArray().map(func((principal, submissionList)) { (principal, submissionList.toArray()) });
  };

  public query ({ caller }) func getAllCheckIns() : async [(Principal, [CheckIn])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins (Director/Management) can view all check-ins");
    };

    checkIns.toArray().map(func((principal, checkInList)) { (principal, checkInList.toArray()) });
  };

  public query ({ caller }) func getAllCheckOuts() : async [(Principal, [CheckOut])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins (Director/Management) can view all check-outs");
    };

    checkOuts.toArray().map(func((principal, checkOutList)) { (principal, checkOutList.toArray()) });
  };

  // Director/Management can read specific user's submissions
  public query ({ caller }) func getUserSubmissions(user : Principal) : async [Submission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins (Director/Management) can view other users' submissions");
    };
    switch (submissions.get(user)) {
      case (null) { [] };
      case (?results) { results.toArray() };
    };
  };

  // Admin-only: Get all user profiles
  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };
    userProfiles.toArray();
  };

  // Query functions for statistics (admin-only)
  public query ({ caller }) func getUniqueDedications() : async [Text] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view dedication statistics");
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
      Runtime.trap("Unauthorized: Only admins can view submission statistics");
    };
    var count : Nat = 0;
    for ((_, submissionList) in submissions.entries()) {
      count += submissionList.size();
    };
    count;
  };
};

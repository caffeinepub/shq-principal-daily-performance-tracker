import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";

module {
  type OldProfile = {
    name : Text;
    dedication : {
      #leadership;
      #technology;
      #sales;
    };
  };

  type DailyReport = {
    time : Int;
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
    dedicationMetric : {
      #leadership;
      #technology;
      #sales;
    };
  };

  type Submission = {
    time : Int;
    report : DailyReport;
    user : OldProfile;
    relation : Float;
    reflection : Text;
    rating : Float;
    account : Text;
    kpi : { energy : Float; flow : Float; focus : Float; health : Float; habit : Float; dedication : Float };
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, OldProfile>;
    submissions : Map.Map<Principal, List.List<Submission>>;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, OldProfile>;
    submissions : Map.Map<Principal, List.List<Submission>>;
    checkIns : Map.Map<Principal, List.List<{ time : Int; detail : Text }>>;
    checkOuts : Map.Map<Principal, List.List<{ time : Int; detail : Text }>>;
  };

  public func run(old : OldActor) : NewActor {
    { old with checkIns = Map.empty<Principal, List.List<{ time : Int; detail : Text }>>(); checkOuts = Map.empty<Principal, List.List<{ time : Int; detail : Text }>>() };
  };
};

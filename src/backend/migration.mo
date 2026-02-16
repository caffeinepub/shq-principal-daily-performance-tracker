import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Float "mo:core/Float";

module {
  type Profile = {
    dedication : {
      #leadership;
      #technology;
      #sales;
    };
    name : Text;
  };

  type DailyReport = {
    dedicationMetric : {
      #leadership;
      #technology;
      #sales;
    };
    dedication : Text;
    dedicationRating : Float;
    energy : Text;
    energyRating : Float;
    focus : Text;
    focusRating : Float;
    flow : Text;
    flowRating : Float;
    habit : Text;
    habitRating : Float;
    health : Text;
    healthRating : Float;
    strats : Text;
    time : Int;
  };

  type KPITally = {
    dedication : Float;
    energy : Float;
    flow : Float;
    focus : Float;
    habit : Float;
    health : Float;
  };

  type Submission = {
    account : Text;
    kpi : KPITally;
    rating : Float;
    reflection : Text;
    relation : Float;
    report : DailyReport;
    time : Int;
    user : Profile;
  };

  type CheckIn = {
    detail : Text;
    photo : ?Text;
    time : Int;
  };

  type CheckOut = {
    detail : Text;
    time : Int;
  };

  type KPIConfigOld = {
    dedicationWeight : Float;
    energyWeight : Float;
    focusWeight : Float;
    flowWeight : Float;
    habitWeight : Float;
    healthWeight : Float;
  };

  type KPIConfigNew = {
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

  type OldActor = {
    userProfiles : Map.Map<Principal, {
      dedication : {
        #leadership;
        #technology;
        #sales;
      };
      name : Text;
    }>;
    submissions : Map.Map<Principal, List.List<{
      account : Text;
      kpi : {
        dedication : Float;
        energy : Float;
        flow : Float;
        focus : Float;
        habit : Float;
        health : Float;
      };
      rating : Float;
      reflection : Text;
      relation : Float;
      report : {
        dedicationMetric : {
          #leadership;
          #technology;
          #sales;
        };
        dedication : Text;
        dedicationRating : Float;
        energy : Text;
        energyRating : Float;
        focus : Text;
        focusRating : Float;
        flow : Text;
        flowRating : Float;
        habit : Text;
        habitRating : Float;
        health : Text;
        healthRating : Float;
        strats : Text;
        time : Int;
      };
      time : Int;
      user : {
        dedication : {
          #leadership;
          #technology;
          #sales;
        };
        name : Text;
      };
    }>>;
    checkIns : Map.Map<Principal, List.List<{ detail : Text; photo : ?Text; time : Int }>>;
    checkOuts : Map.Map<Principal, List.List<{ detail : Text; time : Int }>>;
    kpiWeights : {
      dedicationWeight : Float;
      energyWeight : Float;
      focusWeight : Float;
      flowWeight : Float;
      habitWeight : Float;
      healthWeight : Float;
    };
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, {
      dedication : {
        #leadership;
        #technology;
        #sales;
      };
      name : Text;
    }>;
    submissions : Map.Map<Principal, List.List<{
      account : Text;
      kpi : {
        dedication : Float;
        energy : Float;
        flow : Float;
        focus : Float;
        habit : Float;
        health : Float;
      };
      rating : Float;
      reflection : Text;
      relation : Float;
      report : {
        dedicationMetric : {
          #leadership;
          #technology;
          #sales;
        };
        dedication : Text;
        dedicationRating : Float;
        energy : Text;
        energyRating : Float;
        focus : Text;
        focusRating : Float;
        flow : Text;
        flowRating : Float;
        habit : Text;
        habitRating : Float;
        health : Text;
        healthRating : Float;
        strats : Text;
        time : Int;
      };
      time : Int;
      user : {
        dedication : {
          #leadership;
          #technology;
          #sales;
        };
        name : Text;
      };
    }>>;
    checkIns : Map.Map<Principal, List.List<{ detail : Text; photo : ?Text; time : Int }>>;
    checkOuts : Map.Map<Principal, List.List<{ detail : Text; time : Int }>>;
    kpiWeights : {
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
  };

  public func convertKPIConfig(oldConfig : KPIConfigOld) : KPIConfigNew {
    {
      activity1name = "Energy";
      activity1weight = oldConfig.energyWeight;
      activity1active = true;

      activity2name = "Flow";
      activity2weight = oldConfig.flowWeight;
      activity2active = true;

      activity3name = "Focus";
      activity3weight = oldConfig.focusWeight;
      activity3active = true;

      activity4name = "Health";
      activity4weight = oldConfig.healthWeight;
      activity4active = true;

      activity5name = "Habit";
      activity5weight = oldConfig.habitWeight;
      activity5active = true;
    };
  };

  public func run(old : OldActor) : NewActor {
    {
      old with kpiWeights = convertKPIConfig(old.kpiWeights);
    };
  };
};

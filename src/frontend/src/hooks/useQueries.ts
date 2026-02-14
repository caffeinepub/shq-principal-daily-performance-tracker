import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { InputProfile, UserProfile, UserRole, DailyReport, Submission, CheckIn, CheckOut } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: InputProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      report: DailyReport;
      review: string;
      account: string;
      reflection: string;
      relation: number;
      rating: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSubmission(
        params.report,
        params.review,
        params.account,
        params.reflection,
        params.relation,
        params.rating
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
    },
  });
}

export function useGetSubmissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Submission[]>({
    queryKey: ['submissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubmissions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllSubmissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, Submission[]]>>({
    queryKey: ['allSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubmissions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Check-in hooks
export function useAddCheckIn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (detail: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCheckIn(detail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['allCheckIns'] });
    },
  });
}

export function useGetCheckIns() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CheckIn[]>({
    queryKey: ['checkIns'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCheckIns();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllCheckIns() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, CheckIn[]]>>({
    queryKey: ['allCheckIns'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCheckIns();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Check-out hooks
export function useAddCheckOut() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (detail: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCheckOut(detail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkOuts'] });
      queryClient.invalidateQueries({ queryKey: ['allCheckOuts'] });
    },
  });
}

export function useGetCheckOuts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CheckOut[]>({
    queryKey: ['checkOuts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCheckOuts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllCheckOuts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, CheckOut[]]>>({
    queryKey: ['allCheckOuts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCheckOuts();
    },
    enabled: !!actor && !actorFetching,
  });
}

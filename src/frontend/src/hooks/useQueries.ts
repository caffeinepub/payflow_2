import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction, User, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ─── Profile & Auth ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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

// ─── Balance ─────────────────────────────────────────────────────────────────

export function useGetBalance() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<number>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getBalance();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30_000,
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useGetTransactions() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── User lookup ─────────────────────────────────────────────────────────────

export function useGetUserByUpi(upi: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<User | null>({
    queryKey: ["userByUpi", upi],
    queryFn: async () => {
      if (!actor || !upi) return null;
      return actor.getUserByUpi(upi);
    },
    enabled: !!actor && !actorFetching && upi.length > 0,
    retry: false,
  });
}

export function useGetUserByPhone(phone: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<User | null>({
    queryKey: ["userByPhone", phone],
    queryFn: async () => {
      if (!actor || !phone) return null;
      return actor.getUserByPhone(phone);
    },
    enabled: !!actor && !actorFetching && phone.length >= 10,
    retry: false,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerUser(name, phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useSendMoney() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiverUpi,
      amount,
      note,
    }: {
      receiverUpi: string;
      amount: number;
      note: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendMoney(receiverUpi, amount, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useRequestMoney() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requesterUpi,
      amount,
      note,
    }: {
      requesterUpi: string;
      amount: number;
      note: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.requestMoney(requesterUpi, amount, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useTopUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error("Actor not available");
      return actor.topUp(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function usePayBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
      provider,
      accountNumber,
      amount,
    }: {
      category: string;
      provider: string;
      accountNumber: string;
      amount: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.payBill(category, provider, accountNumber, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

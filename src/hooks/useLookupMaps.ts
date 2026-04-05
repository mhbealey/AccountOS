'use client';

import { useMemo } from 'react';
import { useClientStore } from '@/stores/client-store';
import { useDealStore } from '@/stores/deal-store';
import type { Client, Contact, Deal } from '@/types';

export interface LookupMaps {
  clientMap: Record<string, Client>;
  contactMap: Record<string, Contact>;
  dealMap: Record<string, Deal>;
  getClient: (id: string) => Client | undefined;
  getContact: (id: string) => Contact | undefined;
  getDeal: (id: string) => Deal | undefined;
}

/**
 * Creates O(1) lookup maps for clients, contacts, and deals.
 * Memoized so the maps only recompute when the underlying arrays change.
 */
export function useLookupMaps(): LookupMaps {
  const clients = useClientStore((s) => s.clients);
  const deals = useDealStore((s) => s.deals);

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c])),
    [clients],
  );

  const contactMap = useMemo(() => {
    const map: Record<string, Contact> = {};
    for (const client of clients) {
      for (const contact of client.contacts ?? []) {
        map[contact.id] = contact;
      }
    }
    return map;
  }, [clients]);

  const dealMap = useMemo(
    () => Object.fromEntries(deals.map((d) => [d.id, d])),
    [deals],
  );

  const getClient = useMemo(
    () => (id: string) => clientMap[id],
    [clientMap],
  );

  const getContact = useMemo(
    () => (id: string) => contactMap[id],
    [contactMap],
  );

  const getDeal = useMemo(
    () => (id: string) => dealMap[id],
    [dealMap],
  );

  return { clientMap, contactMap, dealMap, getClient, getContact, getDeal };
}

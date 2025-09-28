"use client";

import React from "react";
import { Button, Chip } from "@heroui/react";

type Props = {
  userCollectionName: string;
  searchText: string;
  onRun: (query: Record<string, unknown>) => void;
  KGTU_GRAPH_ID: string;
  KBK_GRAPH_ID: string;
};

export default function UserQuickQueries({ userCollectionName, searchText, onRun, KGTU_GRAPH_ID, KBK_GRAPH_ID }: Props) {
  if (!userCollectionName) return null;
  const trimmed = searchText.trim();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Chip variant="flat">Быстрые запросы: {userCollectionName}</Chip>
      <Button size="sm" variant="flat" onPress={() => onRun({ selectedGraphId: { $oid: KGTU_GRAPH_ID } })}>Пользователи КГТУ</Button>
      <Button size="sm" variant="flat" onPress={() => onRun({ selectedGraphId: { $oid: KBK_GRAPH_ID } })}>Пользователи КБК</Button>
      <Button size="sm" variant="flat" onPress={() => onRun({ $or: [ { username: null }, { username: { $exists: false } } ] })}>username = null</Button>
      <Button size="sm" variant="flat" onPress={() => onRun({ $or: [ { firstName: { $regex: trimmed, $options: 'i' } }, { lastName: { $regex: trimmed, $options: 'i' } }, { username: { $regex: trimmed, $options: 'i' } } ] })} isDisabled={!trimmed}>Быстрый поиск</Button>
    </div>
  );
}



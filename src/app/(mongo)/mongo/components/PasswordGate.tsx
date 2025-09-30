"use client";

import { useState } from "react";
import { Button, Input, Chip } from "@heroui/react";
import { toast } from "sonner";

export default function PasswordGate() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) { toast.error('Введите пароль'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/mongo-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        toast.success('Доступ разрешен');
        window.location.reload();
      } else {
        toast.error('Неверный пароль');
      }
    } catch {
      toast.error('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{
        width: 360,
        border: '1px solid var(--border-color, #e5e7eb)',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <h2 style={{ margin: 0 }}>Доступ к Mongo инструментам</h2>
        <Chip variant="flat" color="warning">Требуется пароль</Chip>
        <Input
          label="Пароль"
          type="password"
          value={password}
          onValueChange={setPassword}
          onKeyDown={(e) => { if ((e as any).key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
        />
        <Button color="primary" isLoading={loading} onPress={handleSubmit}>Войти</Button>
      </div>
    </main>
  );
}



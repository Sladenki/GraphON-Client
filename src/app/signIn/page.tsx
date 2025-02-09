'use client'

import LoginButton from "@/components/ProfileCorner/LoginButton/LoginButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


const Signin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // @ts-expect-error потом исправлю если получится
    const telegram = window.Telegram?.WebApp;
    
    if (!telegram) {
      console.error("Telegram WebApp API недоступен.");
      return;
    }

    telegram.ready();
    const user = telegram.initDataUnsafe?.user;

    if (!user) {
      console.error("Ошибка: данные пользователя Telegram не найдены!");
      setLoading(false);
      return;
    }

    console.log("Данные пользователя:", user);

    // Отправляем данные на сервер
    fetch("https://graphon-server.onrender.com/api/auth/telegram/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegramId: user.id,
        first_name: user.first_name,
        last_name: user.last_name || "",
        username: user.username || "",
        photo_url: user.photo_url || "",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Ответ сервера:", data);
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          router.push(`/profile?accessToken=${data.accessToken}`);
        }
      })
      .catch((error) => {
        console.error("Ошибка запроса:", error);
        setLoading(false);
      });
  }, [router]);

  return (
    <>
      <h1>Авторизация</h1>
      {loading ? <p>Загрузка...</p> : <LoginButton />}
    </>
  );
};

export default Signin;
"use client";
import { useState } from 'react';

const LoginButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = () => { // Уберите async/await
        setIsLoading(true);

        // Прямое перенаправление на эндпоинт авторизации Google
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`; // Используйте полный URL API
        // После перенаправления код ниже не выполнится

        // setIsLoading(false); // Не нужно здесь, так как страница перезагрузится
    };

    return (
        <button onClick={handleGoogleSignIn} disabled={isLoading}>
            {isLoading ? "Загрузка..." : "Sign in with Google"}
        </button>
    );
};

export default LoginButton;



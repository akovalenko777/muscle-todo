import { useEffect, useRef } from 'react';
import { isAxiosError } from "axios"
import { toast } from 'react-toastify';
import useLogin from '../hooks/useLogin';
import { loadGoogleScript } from '../utils/loadGoogleScript';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: object) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { doLogin } = useLogin()

  useEffect(() => {
    let cancelled = false

    loadGoogleScript().then(() => {
      if (cancelled) return

      window.google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response.credential) {
            toast.error('Щось пішло не так...')
            return
          }

          try {
            await doLogin('/auth/google', {
              idToken: response.credential
            })
          } catch (error: unknown){
            if(!isAxiosError(error)) {
              toast.error('Невдалося авторизуватися з акаунтом Google')
              return
            }
            const messages = isAxiosError(error)
              ? error.response?.data?.message
              : undefined
            const errorMessage = Array.isArray(messages) ? messages.join(' ') : messages
            if (errorMessage?.includes('regular email/password for login')) {
              toast.error('Скористайтеся звичайною авторизацією через логін/пароль.')
            } else {
              toast.error('Невдалося авторизуватися з акаунтом Google')
            }
          }
        },
      });

      if (buttonRef.current) {
        window.google?.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large' });
      }
    })

    return () => {
      cancelled = true
    }
  }, [doLogin]);

  return <div ref={buttonRef} />;
}
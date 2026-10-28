import { useEffect, useRef } from 'react';
import { isAxiosError } from "axios"
import { toast } from 'react-toastify';
import useLogin from '../hooks/useLogin';
import { loadGoogleScript } from '../utils/loadGoogleScript';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation()
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
            toast.error(t('auth.google.noCredential'))
            return
          }

          try {
            await doLogin('/auth/google', {
              idToken: response.credential
            })
          } catch (error: unknown){
            if(!isAxiosError(error)) {
              toast.error(t('auth.google.error'))
              return
            }
            const messages = isAxiosError(error)
              ? error.response?.data?.message
              : undefined
            const errorMessage = Array.isArray(messages) ? messages.join(' ') : messages
            if (errorMessage?.includes('regular email/password for login')) {
              toast.error(t('auth.google.useLocalLogin'))
            } else {
              toast.error(t('auth.google.error'))
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
  }, [doLogin, t]);

  return <div ref={buttonRef} />;
}
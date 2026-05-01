import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/common/button';
import { SEO } from '@/components/common/seo';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth-store';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export const AuthPage = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const profile = useAuthStore((state) => state.profile);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const customerLabel = locale === 'ka' ? 'მომხმარებელი' : 'Customer';

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  useEffect(() => {
    if (profile) {
      navigate((location.state as { from?: string } | null)?.from ?? '/profile', { replace: true });
    }
  }, [profile, navigate, location.state]);

  const handleSignIn = signInForm.handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
      toast.success(dictionary.common.welcomeBack);
    } catch {
      toast.error(dictionary.misc.signInFailed);
    }
  });

  const handleSignUp = signUpForm.handleSubmit(async (values) => {
    try {
      await signUp(values.fullName, values.email, values.password);
      toast.success(dictionary.auth.signupTitle);
    } catch {
      toast.error(dictionary.misc.signUpFailed);
    }
  });

  return (
    <>
      <SEO title={`${dictionary.auth.title} | ALEXANDRA LIMITED COLLECTION`} description={dictionary.auth.description} />
      <div className="container-shell section-space">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
          <div className="glass-panel overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
              alt={dictionary.brand}
              className="h-full min-h-[220px] w-full object-cover sm:min-h-[360px]"
            />
          </div>

          <div className="surface-panel p-4 sm:p-8">
            <p className="eyebrow">{dictionary.auth.title}</p>
            <h1 className="mt-3 break-words font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {mode === 'signin' ? dictionary.auth.signinTitle : dictionary.auth.signupTitle}
            </h1>
            <p className="mt-4 text-sm leading-8 text-neutral-600 sm:text-base">
              {dictionary.auth.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:flex">
              <Button
                variant={mode === 'signin' ? 'primary' : 'secondary'}
                onClick={() => setMode('signin')}
              >
                {dictionary.auth.signinTitle}
              </Button>
              <Button
                variant={mode === 'signup' ? 'primary' : 'secondary'}
                onClick={() => setMode('signup')}
              >
                {dictionary.auth.signupTitle}
              </Button>
            </div>

            {mode === 'signin' ? (
              <form className="mt-8 space-y-4" onSubmit={handleSignIn}>
                <input
                  {...signInForm.register('email')}
                  type="email"
                  placeholder={dictionary.auth.email}
                  className="min-h-12 w-full rounded-[20px] border border-black/10 bg-transparent px-4 text-base outline-none focus:border-neutral-950 sm:text-sm"
                />
                <input
                  {...signInForm.register('password')}
                  type="password"
                  placeholder={dictionary.auth.password}
                  className="min-h-12 w-full rounded-[20px] border border-black/10 bg-transparent px-4 text-base outline-none focus:border-neutral-950 sm:text-sm"
                />
                <Button type="submit" size="lg" className="w-full">
                  {dictionary.common.login}
                </Button>
              </form>
            ) : (
              <form className="mt-8 space-y-4" onSubmit={handleSignUp}>
                <input
                  {...signUpForm.register('fullName')}
                  type="text"
                  placeholder={dictionary.auth.fullName}
                  className="min-h-12 w-full rounded-[20px] border border-black/10 bg-transparent px-4 text-base outline-none focus:border-neutral-950 sm:text-sm"
                />
                <input
                  {...signUpForm.register('email')}
                  type="email"
                  placeholder={dictionary.auth.email}
                  className="min-h-12 w-full rounded-[20px] border border-black/10 bg-transparent px-4 text-base outline-none focus:border-neutral-950 sm:text-sm"
                />
                <input
                  {...signUpForm.register('password')}
                  type="password"
                  placeholder={dictionary.auth.password}
                  className="min-h-12 w-full rounded-[20px] border border-black/10 bg-transparent px-4 text-base outline-none focus:border-neutral-950 sm:text-sm"
                />
                <Button type="submit" size="lg" className="w-full">
                  {dictionary.common.signup}
                </Button>
              </form>
            )}

            <div className="mt-6 rounded-[20px] bg-black/5 p-4 text-sm leading-7 text-neutral-600 sm:mt-8 sm:rounded-[24px] sm:p-5">
              <p className="font-semibold">{dictionary.misc.demoAccounts}</p>
              <p className="mt-2">{dictionary.auth.helper}</p>
              <p className="mt-3">{dictionary.common.admin}: `admin@alexandralimitedcollection.com` / `Admin123!`</p>
              <p>{customerLabel}: `hello@alexandralimitedcollection.com` / `Shopper123!`</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

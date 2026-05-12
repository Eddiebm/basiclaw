import { SignIn } from "@clerk/nextjs";

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <SignIn
        routing="path"
        path={`${base}/sign-in`}
        signUpUrl={`${base}/sign-up`}
        fallbackRedirectUrl={base}
        appearance={{ variables: { colorPrimary: "hsl(var(--primary))" } }}
      />
    </div>
  );
}

import { SignUp } from "@clerk/nextjs";

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <SignUp
        routing="path"
        path={`${base}/sign-up`}
        signInUrl={`${base}/sign-in`}
        fallbackRedirectUrl={base}
        appearance={{ variables: { colorPrimary: "hsl(var(--primary))" } }}
      />
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-medium text-zinc-500">wrkout</p>
          <h1 className="text-2xl font-semibold tracking-normal">Privacy notice</h1>
          <p className="text-sm leading-6 text-zinc-500">
            How wrkout handles your account and workout data.
          </p>
        </header>

        <section className="space-y-5 rounded-lg border border-zinc-800 bg-zinc-950/35 p-6 text-sm leading-6 text-zinc-400">
          <p>
            wrkout stores the account details needed to sign you in and the workout data you choose to save in Supabase.
          </p>
          <p>
            Supabase Auth handles your password. wrkout never stores or displays your raw password.
          </p>
          <p>
            Your workout data is used to power the tracker, sync progress, and show your history in the app.
          </p>
          <p>
            Password reset emails are sent only when you request them.
          </p>
          <p>
            Your data is not sold. To request account or data deletion, contact the app owner.
          </p>
        </section>
      </div>
    </main>
  );
}

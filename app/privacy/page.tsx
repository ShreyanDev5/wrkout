export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Wrkout</p>
          <h1 className="text-2xl font-semibold tracking-normal">Privacy notice</h1>
          <p className="text-sm leading-6 text-zinc-500">
            How <span className="font-semibold italic text-zinc-300">Wrkout</span> handles your account and workout data.
          </p>
        </header>

        <section className="space-y-5 rounded-lg border border-zinc-800 bg-zinc-950/35 p-6 text-sm leading-6 text-zinc-400">
          <p>
            <span className="font-semibold italic text-zinc-200">Wrkout</span> stores only the account details necessary to authenticate you, alongside the workout logs you choose to record.
          </p>
          <p>
            Passwords are securely handled by Supabase Auth. <span className="font-semibold italic text-zinc-200">Wrkout</span> never stores, accesses, or displays your raw credentials.
          </p>
          <p>
            Your training data is solely used to power the tracking features, synchronize progress, and display your personal workout history.
          </p>
          <p>
            Account emails, such as password resets, are sent strictly upon your request.
          </p>
          <p>
            Your personal data is never sold or shared. To request full account and data deletion at any time, please contact the app administrator.
          </p>
        </section>
      </div>
    </main>
  );
}

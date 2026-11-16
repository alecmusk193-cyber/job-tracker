/** Shown when the build has no Firebase config (VITE_FIREBASE_* env vars missing). */
export default function SetupRequired() {
  const vars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-xl p-8">
        <h1 className="text-xl font-semibold">Firebase is not configured</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          This build was created without a Firebase config, so it can’t sign in or sync data. Provide these variables and rebuild:
        </p>
        <ul className="mt-4 space-y-1 font-mono text-xs">
          {vars.map((v) => (
            <li key={v} className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
              {v}
            </li>
          ))}
        </ul>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <b>Local:</b> copy <code>.env.example</code> to <code>.env.local</code> and fill it in.
          </li>
          <li>
            <b>GitHub Pages:</b> add them under repo Settings → Secrets and variables → Actions → <i>Variables</i>, then re-run the deploy
            workflow.
          </li>
        </ul>
        <p className="mt-4 text-xs text-slate-500">See the README section “Firebase setup” for step-by-step instructions.</p>
      </div>
    </div>
  );
}

import { HashRouter, Route, Routes } from 'react-router';
import { APP_NAME } from '@hm/shared';

function Accueil() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <h1 className="text-2xl font-semibold text-slate-800">{APP_NAME}</h1>
    </main>
  );
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
      </Routes>
    </HashRouter>
  );
}

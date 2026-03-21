# AG — jak raportować zakres pracy (repo + release)

- **Commit = dowód.** Podaj **konkretny hash** i **listę plików** (`git show --name-only <hash>`), zamiast „wszystko w jednym commicie”, jeśli faktycznie było kilka commitów lub równoległa praca Cursor/Lovable.
- **Working tree.** Zanim napiszesz „done / clean”, uruchom `git status` — ma być **bez niezacommitowanych zmian**, jeśli twierdzisz, że stan jest domknięty na `main`.
- **Main vs lokalnie.** Rozdziel jawnie: „wypchnięte na GitHub `main`” vs „tylko u mnie lokalnie / w Lovable preview”.
- **Backend vs frontend.** Migracje SQL i deploy Edge Functions w chmurze Supabase to **osobny krok** od zielonego `vite build`; jeśli nie deployowałeś migracji, nie pisz, że „baza jest zsynchronizowana z repo”.

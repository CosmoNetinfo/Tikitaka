# BRIEF PROGETTO: Tiki Taka, web app per ordinare il pranzo

> Versione 2: include le risposte ricevute da Tiki Taka (fasce orarie, orario limite 14:00, annullamento/modifica, fuori menu, ricevuta, dati legali).

## 0. Priorità e scadenza

**Martedì 6 ottobre 2026** c'è un colloquio con Tecnokar in cui va presentata una **bozza funzionante** dell'app. Quindi lo sviluppo è diviso in due blocchi (vedi sezione 11):

- **Blocco A, DEMO (da completare prima del 6 ottobre):** flusso cliente completo (giorno → fascia oraria → pranzo/fuori menu → riepilogo → conferma) in modalità contanti, area admin con riepilogo cucina per fascia oraria, gestione fuori menu, ricevuta, dati demo realistici, deploy su Vercel raggiungibile da telefono.
- **Blocco B, versione reale:** pagamento carta con Stripe, modifica/annullamento ordini con rimborso, rifiniture, pagina privacy, pulizia dati demo.

Tutto ciò che è ancora incerto (dove si consegna, orari esatti dei turni, ecc.) deve essere **un'impostazione modificabile dall'admin**, non una scelta nel codice.

---

## 1. Obiettivo

Costruire una **web app mobile-first (PWA)** che permette ai dipendenti di un'azienda cliente (primo cliente: **Tecnokar**, Spoleto) di ordinare il pranzo da **Tiki Taka**, da consegnare in azienda.

Due interfacce:
- **App cliente** (pubblica, nessuna registrazione): il dipendente sceglie giorno e fascia oraria, compone l'ordine, paga con carta o sceglie "contanti".
- **Area admin Tiki Taka** (login): la cucina vede cosa preparare per ogni fascia oraria, gli ordini individuali, i pagamenti; gestisce il fuori menu e le impostazioni.

Versione 1 specifica per Tecnokar, ma **architettura multi-azienda fin da subito** (tabella `companies`).

Fuori scope: app sugli store, registrazione con password per i clienti, emissione di documenti fiscali, notifiche push, consegne a privati.

---

## 2. Stack tecnico

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** (Postgres, Auth solo per admin, Storage per le foto, Row Level Security)
- **Stripe Checkout** + **webhook** (pagamento carta, opzionale e attivabile, vedi 5.5)
- **PWA**: `manifest.webmanifest`, icone, service worker per l'installazione sulla Home
- Deploy: **Vercel** (sottodominio gratuito `*.vercel.app`, dominio proprio collegabile in seguito)
- Interfaccia in **italiano**. Fuso orario per tutte le regole: **Europe/Rome**. Valuta EUR, importi in **centesimi (integer)**.

---

## 3. Brand e grafica

- Logo **TIKI TAKA** (nero su bianco, stile battito/onda): file fornito a parte, verrà sistemato dallo sviluppatore. Nell'header e come icona PWA.
- Palette ispirata al menu Tecnokar: **blu navy** (`#14213D` circa) principale, **giallo** (`#FFC300` circa) per CTA e prezzi, sfondo bianco.
- Stile pulito, una colonna, aree toccabili da almeno 44px, pensato per l'uso con una mano.
- **Foto dei piatti:** sono quelle del menu stampato Tecnokar. Vanno ritagliate dal menu e salvate in `public/menu/` (una per piatto: 3 condimenti pasta, 3 secondi, 2 contorni, 3 bibite, acqua). Il campo `image_url` del menu le referenzia; se manca, si mostra solo il nome.

---

## 4. Menu Tecnokar (seed iniziale)

**PRIMI**: formato pasta + condimento
- Formato: Linguine, Penne
- Condimento: Pomodoro e basilico, Pesto genovese, Cacio e pepe

**SECONDI**: Coscetti di pollo, Polpette al pomodoro, Spezzatino in agrodolce

**CONTORNI**: Insalata verde, Patate al forno

**Acqua naturale 0,5 L**: sempre inclusa in tutte le combinazioni.

**Bibita in lattina (+2,00 €)**: Coca-Cola, Fanta, Sprite. Extra aggiungibile a qualsiasi ordine.

### Combinazioni e prezzi

| Combinazione | Prezzo |
|---|---|
| Primo + acqua | 6,00 € |
| Secondo + acqua | 6,00 € |
| Secondo + contorno + acqua | 8,00 € |
| Primo + secondo + acqua | 10,00 € |
| Primo + secondo + contorno + acqua | 13,00 € |

Regole:
- Il **prezzo lo calcola sempre il server** in base alla combinazione riconosciuta; il cliente non sceglie né vede un listino da cui "comporre" prezzi.
- Combinazioni non in tabella (solo contorno, primo + contorno) **non sono ammesse**.
- **Nessun limite di porzioni:** il limite dell'orario di prenotazione serve proprio a questo. Non implementare "Esaurito".
- Un ordine contiene **un pranzo a menu** (combinazione) **e/o** uno o più articoli del **fuori menu** (sezione 4.1). Un ordine deve contenere almeno una delle due cose.
- I prezzi stanno nel database (`combos`), modificabili da admin.

### 4.1 Fuori menu variabile

Tiki Taka può proporre piatti speciali non presenti nel menu fisso, cambiandoli quando vuole.

- Dall'admin (`/admin/fuori-menu`) si crea un articolo con: **nome**, **foto** (upload su Supabase Storage), **prezzo**, descrizione opzionale, e **giorni in cui è disponibile** (una data, più date o un intervallo). Attivabile/disattivabile, duplicabile da un articolo precedente.
- Nell'app cliente, nel passo "Componi il pranzo", compare la sezione **"Fuori menu del giorno"** con gli articoli disponibili per la data scelta. Ogni articolo si aggiunge al carrello (quantità 1-3) al **suo prezzo**, da solo o insieme a una combinazione a menu.
- L'acqua **non** è inclusa automaticamente negli articoli fuori menu (campo opzionale `includes_water` per i casi in cui lo sia).
- Gli articoli fuori menu compaiono nel riepilogo cucina e negli ordini come righe separate.

---

## 5. Regole di business

### 5.1 Orario limite ordini (cut-off)
- Valore unico per tutti: **14:00 (Europe/Rome)**, configurabile.
- Per consegnare il giorno **D** si può ordinare **fino alle 14:00 del giorno prima**.
- **Eccezione lunedì:** per il lunedì si può ordinare **fino alle 14:00 del sabato precedente** (la domenica non è disponibile). Questo copre anche venerdì e sabato.
- Esempio: per martedì si ordina fino a lunedì 14:00; per lunedì fino a sabato 14:00.
- Dopo il limite il giorno risulta **"Ordini chiusi"**.
- Verifica **sempre lato server** (alla creazione, alla modifica e alla conferma pagamento), mai solo nell'interfaccia.

### 5.2 Giorni di consegna
- **Solo lunedì-venerdì** (valore configurabile per azienda, default lun-ven).
- L'admin può **chiudere giorni specifici** (festivi, ferie) in `closed_days`.
- Il cliente vede i prossimi giorni di consegna ancora aperti (max 5).

### 5.3 Fasce orarie di consegna (turni)
- Tre turni al giorno, scelti dal cliente **dopo il giorno** nel flusso d'ordine, mostrati come **tre banner/card grandi** ("Primo turno · consegna ore 12:00", ecc.).
- Gli orari sono **provvisori e configurabili** (tabella `delivery_slots`): Primo turno 12:00, Secondo turno 12:30, Terzo turno 13:00. *Gli ultimi due orari sono segnaposto, da confermare il 6 ottobre.*
- Ogni ordine è associato a **una fascia**. Il riepilogo cucina è **suddiviso per fascia** (la cucina prepara e consegna per turni).
- Nessun limite di ordini per fascia in V1 (campo `max_orders` opzionale per il futuro).

### 5.4 Identificazione cliente
- **Nessuna registrazione, nessuna password.** Si chiedono **nome**, **cognome**, **azienda** (select, per ora solo Tecnokar), e **note** opzionali (max 200 caratteri, es. allergie).
- Nome e cognome si salvano nel `localStorage` per precompilare gli ordini successivi.
- Ogni ordine ha un `client_token` (salvato nel dispositivo) e un `public_code` casuale nell'URL di conferma, per ritrovarlo anche da un altro dispositivo.

### 5.5 Pagamento
Il cliente sceglie:
- **Paga ora con carta** → Stripe Checkout; ordine `paid` solo dopo il webhook `checkout.session.completed`.
- **Paga in contanti alla consegna** → ordine confermato subito con `cash_pending`; la cucina segna "contanti ricevuti".

**La carta è opzionale e attivabile con un interruttore**, perché l'account Stripe di Tiki Taka non esiste ancora:
- Senza `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` (o con `card_payments_enabled = false`) l'app mostra **solo "Paga in contanti"**. L'app deve funzionare così.
- Sviluppo e demo con Stripe in **modalità test**. In produzione basta sostituire le variabili d'ambiente su Vercel: nessuna modifica al codice.
- L'account Stripe di produzione va **intestato a Tiki Taka** (Laura Simonelli, con la sua partita IVA e il suo IBAN).

**Commissione carta (impostazione):**
- Tiki Taka vuole che le commissioni siano a carico di chi paga con carta, e **nessun supplemento per i contanti**.
- Implementare come impostazione `card_fee_mode` = `none` | `fixed` | `percent` con `card_fee_value` (es. 0,50 € fisso oppure 3%). **Default: `none`.** Se attiva, nel riepilogo compare una riga trasparente "Commissione pagamento carta" e il totale la include. La riga viene salvata in `orders.card_fee_cents`.
- **Nota legale da verificare con il commercialista prima di attivarla:** in Italia, in generale, non sono ammessi supplementi sui pagamenti con carte di consumatori, mentre è ammesso un **prezzo scontato per chi paga in contanti**. Per questo la funzione è un interruttore spento di default, non un comportamento fisso.

Casi limite carta:
- Ordine creato `pending_payment` prima del redirect; se non pagato entro 30 minuti viene annullato.
- Webhook **idempotente**, con verifica della firma `Stripe-Signature`.

### 5.6 Modifica e annullamento
- **Modifica:** consentita **fino al limite di prenotazione** (14:00 del giorno prima, stessa regola di 5.1). Si possono cambiare piatti, fascia oraria, note.
- **Annullamento:** consentito **fino alle 09:00 del mattino della consegna**.
- Modifica e annullamento si fanno da **"I miei ordini"** (token del dispositivo) o dal link di conferma.
- **Ordini pagati con carta:** non modificabili (per evitare differenze di importo); si **annullano con rimborso automatico** tramite Stripe Refund API e si rifà l'ordine. Nota: di norma le commissioni Stripe non vengono restituite sui rimborsi (da verificare).
- **Ordini in contanti:** modificabili liberamente fino al limite; annullabili fino alle 09:00.
- Gli ordini annullati restano visibili in admin (in grigio) ma **non contano** nel riepilogo cucina né nei totali.
- Il cambio di **giorno** non è una modifica: si annulla e si rifà l'ordine.

### 5.7 Conferma e ricevuta
- Dopo l'ordine: schermata di conferma con numero progressivo (es. **#0048**), giorno, **fascia oraria**, luogo di consegna, piatti, totale, metodo e stato pagamento.
- **Ricevuta nell'app:** ogni ordine ha una pagina "Ricevuta" (`/ordine/[public_code]/ricevuta`), stampabile / salvabile in PDF dal browser, con: dati di Tiki Taka (vedi sezione 13), numero e data ordine, nome cliente, righe, totale, metodo di pagamento. Testo a piè di pagina **configurabile** (`receipt_footer`). Non è un documento fiscale: l'eventuale obbligo di scontrino/documento commerciale va verificato con il commercialista.

---

## 6. App cliente: schermate

1. **Home**: logo, "Benvenuto! Ordina il tuo pranzo e ricevilo direttamente in azienda.", bottone **ORDINA IL PRANZO**, avviso "Gli ordini si chiudono alle ore 14:00 del giorno prima" (testo generato dalle impostazioni, non scritto a mano).
2. **Scelta del giorno**: giorni disponibili; quelli chiusi nascosti o con etichetta "Ordini chiusi".
3. **Scelta della fascia oraria**: tre banner grandi con nome turno e orario di consegna.
4. **Componi il pranzo**: radio button a passi (primo con formato+condimento, secondo, contorno, bibita +2 €), più sezione **Fuori menu del giorno** se presente. Barra fissa in basso con **prezzo in tempo reale** e nome della combinazione riconosciuta ("Primo + secondo + acqua"). Se la selezione non è valida, "Avanti" disabilitato con messaggio chiaro.
5. **Riepilogo ordine**: piatti, acqua inclusa, giorno, fascia, luogo, eventuale commissione carta, **TOTALE**, note, nome/cognome/azienda. Bottone **PROCEDI AL PAGAMENTO**.
6. **Pagamento**: **PAGA ORA CON CARTA** (se attivo) e **PAGA IN CONTANTI**.
7. **Conferma** con numero ordine, link alla ricevuta, pulsanti "Modifica" e "Annulla" (visibili solo finché consentiti), "Fai un altro ordine".
8. **I miei ordini**: ordini del dispositivo con stato, modifica/annulla, ricevuta.

Il **luogo di consegna** è un testo configurabile (`delivery_point_text`), perché non è ancora noto se si consegna dentro l'azienda o al parcheggio.

---

## 7. Area admin Tiki Taka (`/admin`)

Accesso con **Supabase Auth (email + password)**, solo utenti in `admins` (V1: un account).

1. **Dashboard consegne**: selettore giorno. Mostra:
   - Numero ordini totali e **per fascia oraria**
   - **Riepilogo cucina diviso per fascia**: quante porzioni per ogni piatto (primi aggregati per formato+condimento, secondi, contorni, bibite, **articoli fuori menu**)
2. **Lista ordini individuali** (filtrabile per fascia): nome, azienda, piatti, fascia, totale, stato (💳 PAGATO / 💵 CONTANTI DA INCASSARE / ✅ CONTANTI RICEVUTI / ❌ ANNULLATO / NON PAGATO), note.
3. **"Contanti ricevuti"** su ogni ordine in contanti (annullabile); **"Segna non pagato"** con nota.
4. **Totali economici** del giorno: incasso previsto, già pagato, da riscuotere.
5. **Gestione ordini**: annullare (con rimborso Stripe se pagato con carta), modificare note.
6. **Fuori menu** (`/admin/fuori-menu`): vedi 4.1.
7. **Menu e prezzi**: attivare/disattivare piatti, modificare nomi, foto, allergeni, prezzi combinazioni.
8. **Stampa / esporta**: vista A4 del riepilogo cucina **per fascia**, CSV opzionale.
9. **Impostazioni** (`/admin/impostazioni`): tutto ciò che è elencato in sezione 14.

---

## 8. Modello dati (Supabase / Postgres)

Schema indicativo, rifinibile mantenendo i concetti:

```sql
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  delivery_weekdays int[] not null default '{1,2,3,4,5}', -- 1=lun ... 7=dom
  is_active boolean not null default true
);

create table company_settings (
  company_id uuid primary key references companies(id),
  order_cutoff_time time not null default '14:00',
  monday_cutoff_on_saturday boolean not null default true,
  cancel_until_time time not null default '09:00',   -- il mattino della consegna
  delivery_point_text text default 'Presso Tecnokar',
  card_payments_enabled boolean not null default false,
  cash_payments_enabled boolean not null default true,
  card_fee_mode text not null default 'none' check (card_fee_mode in ('none','fixed','percent')),
  card_fee_value numeric not null default 0,
  receipt_footer text,
  issuer_name text, issuer_vat text, issuer_address text, issuer_email text, issuer_phone text
);

create table delivery_slots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  label text not null,              -- "Primo turno"
  delivery_time time not null,      -- 12:00
  max_orders int,                   -- null = illimitato
  sort_order int default 0,
  is_active boolean default true
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  category text not null check (category in ('primo_formato','primo_condimento','secondo','contorno','bibita')),
  name text not null,
  image_url text,
  allergens text,                   -- opzionale, da compilare
  sort_order int default 0,
  is_active boolean default true
);

create table combos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  label text not null,
  has_primo boolean not null,
  has_secondo boolean not null,
  has_contorno boolean not null,
  price_cents int not null,
  is_active boolean default true
);

create table extras (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  name text not null,               -- "Bibita in lattina"
  price_cents int not null
);

create table special_items (        -- fuori menu
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  name text not null,
  description text,
  image_url text,
  price_cents int not null,
  includes_water boolean not null default false,
  available_dates date[] not null,  -- giorni in cui è ordinabile
  is_active boolean default true
);

create table closed_days (
  company_id uuid references companies(id),
  day date not null,
  reason text,
  primary key (company_id, day)
);

create sequence order_number_seq;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number int not null default nextval('order_number_seq'),
  public_code text unique not null,
  client_token text not null,
  company_id uuid not null references companies(id),
  delivery_date date not null,
  slot_id uuid not null references delivery_slots(id),
  customer_first_name text not null,
  customer_last_name text not null,
  notes text,
  combo_id uuid references combos(id),      -- null se solo fuori menu
  primo_formato text, primo_condimento text, secondo text, contorno text,
  drink text,
  subtotal_cents int not null,
  card_fee_cents int not null default 0,
  total_cents int not null,
  payment_method text not null check (payment_method in ('card','cash')),
  payment_status text not null check (payment_status in ('pending_payment','paid','cash_pending','cash_received','unpaid','refunded')),
  status text not null default 'active' check (status in ('active','cancelled')),
  cancelled_at timestamptz,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table order_lines (          -- righe fuori menu
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  special_item_id uuid references special_items(id),
  name_snapshot text not null,
  unit_price_cents int not null,
  qty int not null default 1
);

create table admins (
  user_id uuid primary key references auth.users(id)
);
```

Note:
- Gli **snapshot dei nomi piatti** restano nell'ordine, così modifiche al menu non alterano lo storico.
- **RLS**: il pubblico legge solo menu, combo, fasce, fuori menu attivi e aziende attive; gli ordini si creano/modificano **solo tramite route API server** (service role). Lettura e modifica ordini/impostazioni solo per `admins`.
- Foto: bucket Storage `menu-photos`, lettura pubblica, scrittura solo admin.

---

## 9. Endpoint / logica server

- `GET /api/availability?company=slug` → giorni ordinabili (regola 5.1, giorni chiusi, lun-ven) + fasce + fuori menu per data.
- `POST /api/orders` → valida (zod), verifica cut-off, giorno aperto, fascia valida, combinazione valida, articoli fuori menu disponibili in quella data; **ricalcola tutti i prezzi**; crea ordine. `card` → Checkout Session; `cash` → `cash_pending`.
- `PATCH /api/orders/:id` → modifica (token del dispositivo o `public_code`), solo fino al limite 5.1 e solo ordini in contanti.
- `POST /api/orders/:id/cancel` → annullamento fino alle 09:00 del giorno di consegna; se pagato con carta, avvia il rimborso Stripe.
- `POST /api/stripe/webhook` → firma verificata, idempotente (`checkout.session.completed`, `expired`, `charge.refunded`).
- `GET /api/orders/mine?token=…` e `GET /api/orders/:public_code` → ordini del dispositivo / singolo ordine e ricevuta.
- Admin: riepilogo giorno per fascia, azioni su ordini, CRUD fuori menu e impostazioni.
- Rate limiting e honeypot su `POST /api/orders`.

---

## 10. Requisiti non funzionali

- **Mobile-first**, testato su iPhone Safari e Android Chrome; Lighthouse PWA/Performance ≥ 90; accessibilità di base.
- **Privacy/GDPR:** titolare del trattamento Tiki Taka (dati in sezione 13); raccogliere solo nome, cognome, azienda e note; nessun dato carta sul sistema. Le note libere possono contenere allergie: spiegarlo nell'informativa. Prevedere una funzione (anche manuale da admin) per anonimizzare i dati personali degli ordini vecchi; il periodo di conservazione va deciso con il commercialista.
- **`.env.example`** con: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`.
- Stripe in **modalità test** finché non è tutto verificato.
- Codice tipizzato e pulito, `README.md` con setup, migrazioni, seed, deploy.

---

## 11. Piano di lavoro

**Blocco A: DEMO per il 6 ottobre**
1. Setup progetto (Next.js 14, Tailwind, Supabase, PWA base), `.env.example`.
2. Database: migrazioni, RLS, seed (Tecnokar, menu, combinazioni, 3 fasce, dati legali).
3. Logica con **test unitari**: cut-off (13:59/14:00/14:01, regola lunedì→sabato, giorni chiusi, cambio ora legale) e calcolo combinazione/prezzo (tutte le combinazioni valide e non valide).
4. App cliente: schermate 1-7 in modalità contanti, con fasce orarie e fuori menu.
5. Admin: login, dashboard per fascia, lista ordini, contanti ricevuti, gestione fuori menu (con upload foto), stampa.
6. Ricevuta in app.
7. **Seed demo**: script che crea ~15-20 ordini realistici distribuiti sui tre turni e su due giorni, e un comando per cancellarli prima del go-live.
8. Deploy su Vercel, prova da telefono.

**Blocco B: versione reale**
9. Stripe Checkout + webhook + scadenza ordini non pagati + commissione carta (spenta di default).
10. Modifica e annullamento (5.6), con rimborso Stripe.
11. "I miei ordini", impostazioni complete, pagina privacy, stati vuoti ed errori, icone PWA.
12. Test end-to-end, pulizia dati demo, go-live.

---

## 12. Criteri di accettazione

- [ ] Un dipendente completa un ordine in contanti in meno di 1 minuto da mobile.
- [ ] Alle 13:59 si ordina ancora per il giorno dopo, alle 14:01 no, **anche forzando l'API**.
- [ ] Per il lunedì si ordina fino a sabato 14:00 e non oltre.
- [ ] Non è possibile creare un ordine con combinazione non valida, fascia inesistente, fuori menu non disponibile in quella data o prezzo manomesso.
- [ ] Il cliente sceglie tra tre fasce orarie e il riepilogo cucina è diviso per fascia.
- [ ] Da admin si crea un fuori menu con nome, foto e prezzo e compare subito agli utenti nei giorni scelti.
- [ ] Un ordine in contanti si modifica fino alle 14:00 del giorno prima e si annulla fino alle 09:00 del giorno di consegna, non oltre.
- [ ] Un ordine pagato con carta si annulla con rimborso e non è modificabile.
- [ ] Il pagamento carta risulta "pagato" solo dopo il webhook; eventi duplicati non hanno effetti doppi.
- [ ] Gli ordini annullati non contano nel riepilogo cucina né nei totali.
- [ ] La ricevuta di un ordine si apre, si stampa e mostra i dati di Tiki Taka.
- [ ] Senza chiavi Stripe l'app funziona in solo contanti senza errori e senza mostrare la carta.
- [ ] Tutto in sezione 14 si cambia da `/admin/impostazioni` senza toccare il codice.
- [ ] Aggiungere una seconda azienda richiede solo inserimenti nel database.
- [ ] L'app è installabile come PWA su iPhone e Android.

---

## 13. Dati di Tiki Taka (titolare, ricevuta, privacy)

- Ragione sociale: **Tiki Taka di Laura Simonelli**
- Partita IVA: **04034150542**
- Indirizzo: **Via dei Vetrai 58, 06049 Spoleto (PG)**
- Email: **Laura.simonelli02@yahoo.com**
- Telefono: **329 323 9693**

Da inserire come valori iniziali in `company_settings` (campi `issuer_*`), non scritti a mano nelle pagine.

---

## 14. Impostazioni configurabili (valori attuali)

Modificabili da `/admin/impostazioni`.

| Impostazione | Valore attuale | Note |
|---|---|---|
| Giorni di consegna | Lunedì-venerdì | Selezione multipla |
| Orario limite ordini | 14:00 del giorno prima | Lunedì: sabato 14:00 |
| Orario limite annullamento | 09:00 del giorno di consegna | |
| Modifica ordine | Fino all'orario limite | Solo ordini in contanti |
| Fasce orarie | Primo turno 12:00; Secondo 12:30 e Terzo 13:00 **provvisori** | Nome e orario modificabili |
| Luogo di consegna | "Presso Tecnokar" | **Provvisorio:** dentro l'azienda o al parcheggio, da confermare il 6 ottobre |
| Pagamento contanti | Attivo | |
| Pagamento carta | Spento finché non ci sono le chiavi Stripe | Interruttore |
| Commissione carta | Nessuna (`none`) | Verificare con il commercialista prima di attivarla (vedi 5.5) |
| Limite porzioni | Nessuno | Voluto: il limite orario serve a questo |
| Allergeni | Vuoti | Tiki Taka li comunicherà piatto per piatto a fine servizio |
| Fuori menu | Nessuno all'inizio | Gestito da `/admin/fuori-menu` |
| Contanti non pagati | Solo segnalazione manuale ("non pagato" + nota) | Nessuna regola automatica: Tiki Taka non ha ancora deciso |
| Ricevuta | Pagina in app, testo a piè di pagina configurabile | Non è un documento fiscale |
| Dati titolare | Sezione 13 | |

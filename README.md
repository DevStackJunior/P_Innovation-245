# 💳 Proof of Concept – Fusion de 2 Applications Financières avec AdonisJS

## 🧠 Contexte

Ce Proof of Concept (PoC) démontre la faisabilité technique de la **fusion de deux applications financières** en une seule plateforme unifiée, à l’aide du framework **AdonisJS**.  
Les sources de données sont **deux fichiers JSON locaux** représentant deux environnements bancaires différents :  
🇨🇭 **TWINT (normes suisses)** et 🇪🇺 **WERO (normes européennes)**.

Aucune API externe n’est utilisée — toutes les données sont **chargées localement**, **fusionnées en base MySQL**, puis **consultées depuis le dossier `/resources/`**.

---

## 🎯 Objectifs du PoC

### Objectifs principaux

- **Fusion des données** de deux systèmes financiers distincts (App A et App B).  
- **Chargement depuis fichiers JSON locaux** sans dépendance externe.  
- **Architecture modulaire** pour isoler la logique de chaque application.  
- **Gestion commune de la logique métier**, services et schémas.  
- **Fusion et transformation des données** dans un format unique.  
- **Préparation d’une future migration** vers une base SQL complète.  

---

## ⚙️ Objectifs techniques

### 1. Environnement & persistance

- Utilisation d’un **conteneur MySQL (Docker)** pour centraliser les données fusionnées.  
- **Lecture et importation** des fichiers `/data/a.json` et `/data/b.json` dans la base à l’initialisation du projet.  
- **Aucune route API exposée** : les données sont exploitées depuis le dossier `/resources/`.  
- Possibilité d’utiliser des **scripts de seeding AdonisJS** pour automatiser le chargement.

---

### 2. Sources de données locales

Les deux fichiers JSON sont **identiques en structure** (même schéma, mêmes clés),  
mais leurs **contenus diffèrent** (valeurs, montants, devises, origine, etc.).

| Fichier | Origine | Description | Format |
|----------|----------|-------------|---------|
| `/data/a.json` | 🇨🇭 **App A – TWINT / Swiss Payment Standard** | Données simulées selon les normes suisses (TWINT / Swiss QR Bill / ISO 20022) | ✅ Identique à `/data/b.json` |
| `/data/b.json` | 🇪🇺 **App B – WERO / PSD2 Berlin Group** | Données simulées selon les normes européennes (Open Banking / PSD2 Berlin Group) | ✅ Identique à `/data/a.json` |

> 🔹 Les deux fichiers partagent le **même format JSON unifié**, garantissant une intégration directe.  
> Seuls les contenus varient selon le contexte (devise, identifiant, typologie, etc.).

---

### 3. Processus de fusion et de lecture

1. **Chargement initial**
   - Les fichiers `/data/a.json` et `/data/b.json` sont lus par `DataLoaderService`.  
   - Chaque entrée est validée, enrichie et préparée pour insertion.

2. **Insertion et fusion en base**
   - Les enregistrements sont insérés dans MySQL/MariaDB.  
   - Une table unique regroupe toutes les transactions avec un champ d’origine :  
     - `"origin": "SWISS"` pour `/data/a.json`  
     - `"origin": "EU"` pour `/data/b.json`.

3. **Lecture depuis `/resources/`**
   - Les vues, scripts ou exports dans `/resources/` accèdent directement à la base.  
   - Aucune route `/api/` n’est utilisée : tout est interne à AdonisJS.

---

### 4. Normalisation & validation

Avant insertion en base, un service de normalisation applique :

- ✅ **Validation de structure** (`user_id`, `merchant_id`, `amount`, `currency_id`, etc.)  
- 🔄 **Conversion de statuts** → normes ISO 20022 :  
  `completed` → `BOOKED`, `pending` → `PENDING`, `failed` → `REJECTED`  
- 💱 **Uniformisation des devises** selon **ISO 4217** (CHF, EUR, etc.)  
- 🌍 **Ajout d’un champ d’origine** : `"SWISS"` ou `"EU"`

---

### 5. Architecture technique

```bash
/app
 ├── Modules/
 │   ├── SwissProvider/       # Logique d’import TWINT / normes suisses
 │   ├── EuProvider/          # Logique d’import WERO / PSD2
 │   └── Shared/              # Schémas et services communs
 ├── Services/
 │   ├── DataLoaderService.ts     # Lecture des JSON depuis /data/
 │   ├── NormalizationService.ts  # Validation et unification des données
 │   ├── FusionService.ts         # Insertion et fusion en base
 ├── Database/
 │   ├── migrations/              # Schéma SQL des transactions
 │   ├── seeds/                   # Scripts d’import JSON → DB
 ├── Resources/
 │   ├── views/                   # Visualisation des données fusionnées
 │   ├── exports/                 # Génération d’exports (JSON, CSV)
 ├── data/
 │   ├── a.json    # Transactions suisses 🇨🇭
 │   └── b.json    # Transactions européennes 🇪🇺

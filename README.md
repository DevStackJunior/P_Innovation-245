# Proof of Concept - Fusion de 2 Applications Financières avec AdonisJS

## Objectifs du PoC

Ce PoC a pour but de démontrer la faisabilité technique de la **"fusion" de deux applications financières** en une seule, en utilisant le framework **AdonisJS**, avec uniquement des fichiers JSON bruts comme source de données.

### Objectifs principaux

- **Fusion des données** provenant de deux systèmes/applications financières distincts (App A et App B).
- **Chargement des données JSON locales** (sans base de données ni API externe).
- **Architecture modulaire** permettant de séparer la logique de chaque application tout en les unifiant dans un seul projet AdonisJS.
- **Gestion commune de la logique métier**, des services et des routes exposées.
- **Agrégation, transformation et exposition** des données dans un format unifié via une API REST.
- **Structure claire, scalable et extensible**, facilitant l’ajout d’une troisième application ou la migration vers une base de données plus tard.

### Ce que le PoC démontre

| Fonctionnalité          | Description                                                   |
|------------------------|---------------------------------------------------------------|
| 📂 Lecture multi-source | Chargement de fichiers JSON pour App A (simulée Route Brute) et App B (simulée Route Brute)              |
| 🔄 Fusion logique       | Agrégation des données utilisateurs et transactions           |
| 🧩 Modularité           | Services et contrôleurs organisés par application             |
| 🛣️ API REST unifiée    | Routes regroupées pour l'accès aux données fusionnées         |
| 📈 Simulations réalistes| Exemples de transactions, utilisateurs, agrégation, tri       |
| 🔒 Séparation des responsabilités | Gestion distincte des données App A et App B         |

## Main Objectives | Technical : 
- Configure database (docker container | private desktop)
- Data Seeds -> DB mysql
- Create 2 raw API routes (1 JSON file/route) 
    - Create 2 JSON files :
      - **TODO** | 1 JSON File | Format Data coming from TWINT (SWISS bank data norm)
      - **DONE** | 1 JSON File | Format Data coming from WERO (EU bank data norm | Open Banking (PSD2/Berlin Group)) 
